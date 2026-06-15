import { Response, NextFunction } from 'express';
import { Request as RequestModel } from '../models/Request';
import { DonorProfile } from '../models/DonorProfile';
import { DonorResponse } from '../models/DonorResponse';
import { DonationRecord } from '../models/DonationRecord';
import { User } from '../models/User';
import { ApiError } from '../middlewares/error.middleware';
import { AuthRequest } from '../middlewares/auth.middleware';
import { sendMail, sendDonorRequestNotification } from '../services/notifications/email.service';
import { findBestCompatibleDonorForRequest } from '../services/matching/donor-match.service';
import { logger } from '../utils/logger';

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
      return next(new ApiError(404, 'Donor profile not found.'));
    }

    // Filter requests where assignedDonorId === currentDonorId and status is Pending/Active
    const filter: Record<string, any> = {
      assignedDonorId: donorProfile._id,
      status: { $in: ['Pending', 'PENDING', 'Active', 'ACTIVE'] },
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
 * On ACCEPTED:
 *   - Updates status to 'Accepted'
 *   - Populates donor details (acceptedBy, acceptedAt, etc.)
 *   - Creates a DonationRecord (status: Pending)
 *   - Sends email notification to request originator (SendGrid)
 * On DECLINED:
 *   - Appends donor profile ID to rejectedBy array
 *   - Recalculates match and assigns to the next best compatible donor
 *   - Sends email update to request originator (SendGrid)
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

    // Check if the request is assigned to this donor
    if (!request.assignedDonorId || request.assignedDonorId.toString() !== profile._id.toString()) {
      return next(new ApiError(403, 'This request is not assigned to you.'));
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

    if (action === 'ACCEPTED') {
      // Lock the request
      if (request.status === 'Accepted' || request.acceptedDonorId) {
        return next(new ApiError(400, 'This request has already been accepted.'));
      }

      const donorUser = await User.findById(req.user.id).select('name email');
      if (!donorUser) return next(new ApiError(404, 'Donor user account not found.'));

      request.status = 'Accepted';
      request.acceptedDonorId = profile._id as any;
      request.acceptedBy = donorUser.name;
      request.acceptedAt = new Date();
      request.donorId = donorUser._id as any;
      request.donorName = donorUser.name;
      request.donorEmail = donorUser.email;
      request.donorBloodType = profile.bloodType ?? '';

      await request.save();

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
      if ((request as any).requestedBy) {
        try {
          const requester = await User.findById((request as any).requestedBy).select('name email');
          if (requester && requester.email) {
            await sendMail({
              to: requester.email,
              subject: 'Donation Request Accepted',
              html: `
                <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px;border:1px solid #e2e8f0;border-radius:12px;background-color:#fcfcf9;">
                  <h2 style="color:#123e20;margin-top:0;">Donation Request Accepted</h2>
                  <p>Your request has been accepted.</p>
                  <hr style="border:none;border-top:1px solid #e2e8f0;margin:16px 0;" />
                  <p><strong>Donor:</strong> ${donorUser.name}</p>
                  <p><strong>Blood Type:</strong> ${profile.bloodType ?? 'N/A'}</p>
                  <p><strong>Hospital:</strong> ${(request as any).facility || 'N/A'}</p>
                  <p><strong>Date:</strong> ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
              `
            });
          }
        } catch (err: any) {
          logger.error(`Failed to send acceptance email to patient: ${err.message}`);
        }
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
      request.status = 'Pending';

      // Find the next best compatible donor
      const nextDonor = await findBestCompatibleDonorForRequest(request);
      if (nextDonor) {
        request.assignedDonorId = nextDonor._id as any;
        // Notify the new donor via SendGrid
        try {
          const nextDonorUser = await User.findById(nextDonor.userId).select('name email');
          if (nextDonorUser && nextDonorUser.email) {
            const inviteUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/donor/incoming-requests`;
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

      await request.save();

      // Send SendGrid email to patient
      if ((request as any).requestedBy) {
        try {
          const requester = await User.findById((request as any).requestedBy).select('name email');
          if (requester && requester.email) {
            await sendMail({
              to: requester.email,
              subject: 'Donation Request Update',
              html: `
                <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px;border:1px solid #e2e8f0;border-radius:12px;background-color:#fcfcf9;">
                  <p>The assigned donor declined your request.</p>
                  <p>Your request has been reassigned to another compatible donor.</p>
                </div>
              `
            });
          }
        } catch (err: any) {
          logger.error(`Failed to send decline email to patient: ${err.message}`);
        }
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
