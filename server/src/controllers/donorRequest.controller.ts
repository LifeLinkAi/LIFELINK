import { Response, NextFunction } from 'express';
import { Request as RequestModel } from '../models/Request';
import { DonorProfile } from '../models/DonorProfile';
import { DonorResponse } from '../models/DonorResponse';
import { DonationRecord } from '../models/DonationRecord';
import { User } from '../models/User';
import { ApiError } from '../middlewares/error.middleware';
import { AuthRequest } from '../middlewares/auth.middleware';
import { sendMail, sendDonorRequestNotification, sendHospitalMatchNotification } from '../services/notifications/email.service';
import { findBestCompatibleDonorForRequest } from '../services/matching/donor-match.service';
import { logger } from '../utils/logger';

const getRecipientBloodTypes = (donorBloodType: string): string[] => {
  const d = donorBloodType.toUpperCase().trim();
  const matrix: Record<string, string[]> = {
    'O-': ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'],
    'O+': ['O+', 'A+', 'B+', 'AB+'],
    'A-': ['A+', 'A-', 'AB+', 'AB-'],
    'A+': ['A+', 'AB+'],
    'B-': ['B+', 'B-', 'AB+', 'AB-'],
    'B+': ['B+', 'AB+'],
    'AB-': ['AB+', 'AB-'],
    'AB+': ['AB+'],
  };
  return matrix[d] || [d];
};

/**
 * GET /donors/requests
 * Returns all open requests visible to this donor, enriched with
 * this donor's response status (PENDING / ACCEPTED / DECLINED).
 * Optional query: ?type=Blood|Organ
 */
export const getDonorRequests = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) return next(new ApiError(401, 'Not authenticated.'));

    // Fetch this donor's profile
    const donorProfile = await DonorProfile.findOne({ userId: req.user.id });
    if (!donorProfile) {
      res.status(200).json({ success: true, data: [] });
      return;
    }

    const recipientBloodTypes = getRecipientBloodTypes(donorProfile.bloodType ?? 'O-');

    // Filter requests where assignedDonorId === currentDonorId OR notifiedDonors contains currentDonorId
    // OR compatibility match for broadcast requests (urgency critical/high/urgent/emergency)
    const filter: Record<string, any> = {
      rejectedBy: { $ne: donorProfile._id },
      status: { $in: ['Pending', 'PENDING', 'Active', 'ACTIVE', 'DONOR_NOTIFIED'] },
      $or: [
        { assignedDonorId: donorProfile._id },
        { notifiedDonors: donorProfile._id },
        {
          urgency: { $in: ['critical', 'high', 'urgent', 'emergency', 'Critical', 'High', 'Urgent', 'Emergency', 'CRITICAL', 'HIGH', 'URGENT', 'EMERGENCY'] },
          $or: [
            { type: 'Blood', bloodGroup: { $in: recipientBloodTypes } },
            { type: 'Organ', organType: { $in: donorProfile.organsWillingToDonate || [] } }
          ]
        }
      ],
    };
    if (req.query.type) filter.type = req.query.type;

    const requests = await RequestModel.find(filter).sort({ createdAt: -1 }).lean();

    // Fetch all donor responses for this donor in one query
    const requestIds = requests.map((r: any) => r._id);
    const responses = await DonorResponse.find({
      donorId: req.user.id,
      requestId: { $in: requestIds },
    }).lean();

    const responseMap = new Map(responses.map((r: any) => [r.requestId.toString(), r.status]));

    const enriched = requests.map((r: any) => ({
      id: r._id.toString(),
      patientName: r.patientName,
      facility: r.facility,
      bloodGroup: r.bloodGroup,
      organType: r.organType,
      urgency: r.urgency,
      status: r.status,
      type: r.type,
      distance: r.distance,
      notes: r.notes,
      registeredDate: r.registeredDate,
      createdAt: r.createdAt,
      contactPhone: r.contactPhone,
      units: r.units,
      age: r.age,
      gender: r.gender,
      // Donor's own response to this request
      donorResponse: responseMap.get(r._id.toString()) ?? 'PENDING',
    }));

    res.status(200).json({ success: true, data: enriched });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /donors/requests/:id/respond
 * Accepts or declines a request. Body: { action: 'ACCEPTED' | 'DECLINED' }
 */
export const respondToRequest = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) return next(new ApiError(401, 'Not authenticated.'));

    const { id } = req.params;
    const { action } = req.body;

    if (!['ACCEPTED', 'DECLINED'].includes(action)) {
      return next(new ApiError(400, "action must be 'ACCEPTED' or 'DECLINED'."));
    }

    const request = await RequestModel.findById(id);
    if (!request) return next(new ApiError(404, 'Request not found.'));

    const profile = await DonorProfile.findOne({ userId: req.user.id });
    if (!profile) return next(new ApiError(404, 'Donor profile not found.'));

    // Check if the request is exclusively assigned to this donor, or if they were notified/dispatched
    const isAssigned = request.assignedDonorId && request.assignedDonorId.toString() === profile._id.toString();
    const isNotified = request.notifiedDonors && request.notifiedDonors.some((did: any) => did.toString() === profile._id.toString());

    // Check if it is a compatible broadcast request
    const recipientBloodTypes = getRecipientBloodTypes(profile.bloodType ?? 'O-');
    const isCriticalUrgent = ['critical', 'high', 'urgent', 'emergency', 'Critical', 'High', 'Urgent', 'Emergency', 'CRITICAL', 'HIGH', 'URGENT', 'EMERGENCY'].includes(request.urgency);
    let isCompatible = false;
    if (request.type === 'Blood') {
      isCompatible = recipientBloodTypes.includes(request.bloodGroup);
    } else if (request.type === 'Organ') {
      isCompatible = request.organType ? (profile.organsWillingToDonate || []).includes(request.organType as any) : false;
    }
    const isBroadcastAllowed = isCriticalUrgent && isCompatible;

    if (!isAssigned && !isNotified && !isBroadcastAllowed) {
      return next(new ApiError(403, 'This request is not assigned or dispatched to you.'));
    }

    // Upsert the donor response
    const donorResponse = await DonorResponse.findOneAndUpdate(
      { donorId: req.user.id, requestId: id },
      {
        $set: {
          status: action,
          respondedAt: new Date(),
        },
      },
      { upsert: true, new: true }
    );

    logger.info(`Donor ${req.user.id} responded ${action} to request ${id}`);

    // If there is a matchedDonors entry, update its status as well
    const matchedDonorEntry = request.matchedDonors && request.matchedDonors.find(
      (m: any) => m.donorId && m.donorId.toString() === profile._id.toString()
    );
    if (matchedDonorEntry) {
      matchedDonorEntry.status = action;
      matchedDonorEntry.respondedAt = new Date();
    }

    if (action === 'ACCEPTED') {
      // Lock the request
      if (request.status === 'Accepted' || request.acceptedDonorId) {
        return next(new ApiError(400, 'This request has already been accepted.'));
      }

      const donorUser = await User.findById(req.user.id).select('name email');
      if (!donorUser) return next(new ApiError(404, 'Donor user account not found.'));

      let hospitalId = null;
      const creator = await User.findById(request.requestedBy).select('role');
      if (creator && creator.role === 'Hospital') {
        hospitalId = creator._id;
      } else if (request.facility) {
        const matchingHospital = await User.findOne({ name: request.facility, role: 'Hospital' }).select('_id');
        if (matchingHospital) {
          hospitalId = matchingHospital._id;
        }
      }

      if (isNotified) {
        request.status = 'PENDING_HOSPITAL';
        request.acceptedDonorId = profile._id as any;
        request.targetDonorId = donorUser._id as any;
        request.hospitalId = hospitalId as any;
        if (!request.timeline) request.timeline = [];
        request.timeline.push({
          event: 'donor_accepted',
          timestamp: new Date()
        });
      } else {
        request.status = 'Accepted';
        request.acceptedDonorId = profile._id as any;
      }

      request.acceptedBy = donorUser.name;
      request.acceptedAt = new Date();
      request.donorId = donorUser._id as any;
      request.donorName = donorUser.name;
      request.donorEmail = donorUser.email;
      request.donorBloodType = profile.bloodType ?? '';

      await request.save();

      // Trigger Hospital notification when a match is accepted
      if (request.type === 'Organ' && request.status === 'PENDING_HOSPITAL' && hospitalId) {
        try {
          const hospitalUser = await User.findById(hospitalId).select('email name');
          if (hospitalUser && hospitalUser.email) {
            await sendHospitalMatchNotification(
              hospitalUser.email,
              hospitalUser.name || request.facility || 'Hospital Representative',
              donorUser.name,
              request.organType || 'Unknown',
              request.bloodGroup
            );
          }
        } catch (mailErr: any) {
          logger.error(`Failed to send match accepted email to hospital: ${mailErr.message}`);
        }
      }

      // Create a donation record (Pending until physically completed)
      await DonationRecord.findOneAndUpdate(
        { donorId: req.user.id, requestId: id },
        {
          $setOnInsert: {
            donorId: req.user.id,
            requestId: id,
            donationType: (request as any).type === 'Organ' ? 'Organ' : 'Blood',
            bloodType: profile?.bloodType ?? '',
            facility: (request as any).facility ?? '',
            donationDate: new Date(),
            status: 'Pending',
            volumeMl: 450, // standard whole blood unit default
            notes: `Accepted request #${id}`,
          },
        },
        { upsert: true, new: true }
      );

      // Send SendGrid email to patient
      try {
        let recipient = null;

        if (request.userId) {
          const user = await User.findById(request.userId).select('name email role');
          if (user && user.role === 'Patient') recipient = user;
        }

        if (!recipient && request.requestedBy) {
          const user = await User.findById(request.requestedBy).select('name email role');
          if (user && user.role === 'Patient') recipient = user;
        }

        if (!recipient && request.patientName) {
          recipient = await User.findOne({
            role: 'Patient',
            name: { $regex: new RegExp('^' + request.patientName.trim().replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + '$', 'i') }
          }).select('name email role');
        }

        if (!recipient) {
          const targetUserId = request.userId || request.requestedBy;
          if (targetUserId) {
            recipient = await User.findById(targetUserId).select('name email role');
          }
        }

        // ==========================================
        // ADDED SAFETY CHECK HERE
        // ==========================================
        if (recipient && recipient._id.toString() === req.user.id.toString()) {
          logger.warn(`Safety Check: Prevented sending Acceptance email to the donor themselves (${req.user.id}).`);
          recipient = null; // Clear recipient so email doesn't send
        }

        if (recipient && recipient.email) {
          await sendMail({
            to: recipient.email,
            subject: 'Donation Request Accepted',
            html: `
              <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px;line-height:1.6;">
                <p>Hello ${request.patientName || recipient.name || 'Patient'},</p>
                <p>Good news!</p>
                <p>Your donation request has been accepted by donor ${donorUser.name}.</p>
                <p><strong>Blood Type:</strong><br/>${profile.bloodType ?? 'N/A'}</p>
                <p><strong>Hospital:</strong><br/>${request.facility || 'N/A'}</p>
                <p><strong>Date:</strong><br/>${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                <p>Please wait for further instructions.</p>
                <p>Thank you,<br/>LifeLink Network</p>
              </div>
            `
          });
        }
      } catch (err: any) {
        logger.error(`Failed to send acceptance email to patient: ${err.message}`);
      }
    } else if (action === 'DECLINED') {
      // Reject Flow
      if (!request.rejectedBy) {
        request.rejectedBy = [];
      }
      if (!request.rejectedBy.includes(profile._id as any)) {
        request.rejectedBy.push(profile._id as any);
      }
      request.rejectedAt = new Date();

if (isAssigned) {
        request.status = 'Pending';
        // Find the next best compatible donor
        const nextDonor = await findBestCompatibleDonorForRequest(request);
        if (nextDonor) {
          request.assignedDonorId = nextDonor._id as any;
          // Notify the new donor via SendGrid
          try {
            const nextDonorUser = await User.findById(nextDonor.userId).select('name email');
            if (nextDonorUser && nextDonorUser.email) {
              const inviteUrl = `${(process.env.NODE_ENV === 'production' ? process.env.CLIENT_URL : 'http://localhost:3000')}/donor/incoming-requests`;
              await sendDonorRequestNotification(nextDonorUser.email, nextDonorUser.name, {
                urgency: request.urgency,
                type: request.type,
                bloodGroup: request.bloodGroup,
                organType: request.organType,
                facility: request.facility,
                patientName: request.patientName,
              }, inviteUrl);
            }
          } catch (err: any) {
            logger.error(`Error notifying next best donor: ${err.message}`);
          }
        } else {
          request.assignedDonorId = null;
        }
      }

      await request.save();

      // Send SendGrid email to patient
      try {
        let recipient = null;

        if (request.userId) {
          const user = await User.findById(request.userId).select('name email role');
          if (user && user.role === 'Patient') recipient = user;
        }

        if (!recipient && request.requestedBy) {
          const user = await User.findById(request.requestedBy).select('name email role');
          if (user && user.role === 'Patient') recipient = user;
        }

        if (!recipient && request.patientName) {
          recipient = await User.findOne({
            role: 'Patient',
            name: { $regex: new RegExp('^' + request.patientName.trim().replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + '$', 'i') }
          }).select('name email role');
        }

        const donorUserForDecline = await User.findById(req.user.id).select('name email');

        if (!recipient) {
          const targetUserId = request.userId || request.requestedBy;
          if (targetUserId) {
            recipient = await User.findById(targetUserId).select('name email role');
          }
        }

        // ==========================================
        // ADDED SAFETY CHECK HERE
        // ==========================================
        if (recipient && recipient._id.toString() === req.user.id.toString()) {
          logger.warn(`Safety Check: Prevented sending Decline email to the donor themselves (${req.user.id}).`);
          recipient = null; // Clear recipient so email doesn't send
        }

        if (recipient && recipient.email) {
          const donorName = donorUserForDecline ? donorUserForDecline.name : 'a donor';
          await sendMail({
            to: recipient.email,
            subject: 'Donation Request Update',
            html: `
              <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px;line-height:1.6;">
                <p>Hello ${request.patientName || recipient.name || 'Patient'},</p>
                <p>Unfortunately, donor ${donorName} is unable to fulfill your request at this time.</p>
                <p>The system will continue searching for other compatible donors.</p>
                <p>Thank you for your patience.</p>
                <p>LifeLink Network</p>
              </div>
            `
          });
        }
      } catch (err: any) {
        logger.error(`Failed to send decline email to patient: ${err.message}`);
      }
    }

    res.status(200).json({
      success: true,
      requestId: id,
      donorResponse: action,
      respondedAt: donorResponse.respondedAt,
    });
  } catch (error) {
    next(error);
  }
};