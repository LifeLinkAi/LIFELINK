import { Response, NextFunction } from 'express';
import mongoose, { Types, isValidObjectId } from 'mongoose';
import { Request } from '../models/Request';
import { ApiError } from '../middlewares/error.middleware';
import { AuthRequest } from '../middlewares/auth.middleware';
import crypto from 'crypto';
import { findNearbyCompatibleDonors, findBestCompatibleDonorForRequest } from '../services/matching/donor-match.service';
import { sendDonorRequestNotification } from '../services/notifications/email.service';
import { logger } from '../utils/logger';
import { DonorProfile } from '../models/DonorProfile';
import { HospitalProfile } from '../models/HospitalProfile';
import { User } from '../models/User';
import { OrganWaitlist } from '../models/OrganWaitlist';
import { BloodBag } from '../models/BloodBag';

// Helper function to safely parse and structure valid GeoJSON locations
const parseGeoLocation = (body: any) => {
  const location = body.location;
  // Default fallback coordinates to safeguard the 2dsphere index from missing types
  let coords = [0, 0];

  if (location && Array.isArray(location.coordinates) && location.coordinates.length === 2) {
    const lng = parseFloat(location.coordinates[0]);
    const lat = parseFloat(location.coordinates[1]);
    if (!isNaN(lng) && !isNaN(lat)) {
      coords = [lng, lat];
    }
  } else if (body.longitude && body.latitude) {
    const lng = parseFloat(body.longitude);
    const lat = parseFloat(body.latitude);
    if (!isNaN(lng) && !isNaN(lat)) {
      coords = [lng, lat];
    }
  }

  return {
    type: 'Point',
    coordinates: coords
  };
};

// Define recipient blood type compatibility groups based on donor blood type
const getCompatiblePatientBloodGroups = (donorBloodType: string): string[] => {
  const d = donorBloodType.toUpperCase().trim();
  if (d === 'O-') return ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];
  if (d === 'O+') return ['O+', 'A+', 'B+', 'AB+'];
  if (d === 'A-') return ['A-', 'A+', 'AB-', 'AB+'];
  if (d === 'A+') return ['A+', 'AB+'];
  if (d === 'B-') return ['B-', 'B+', 'AB-', 'AB+'];
  if (d === 'B+') return ['B+', 'AB+'];
  if (d === 'AB-') return ['AB-', 'AB+'];
  if (d === 'AB+') return ['AB+'];
  return [donorBloodType];
};

// Safeguard against missing/invalid required fields on legacy Mongoose documents on save
const sanitizeRequestForSave = (requestObj: any, fallbackUserId?: string) => {
  if (!requestObj.requestedBy) {
    requestObj.requestedBy = requestObj.userId || (fallbackUserId ? new Types.ObjectId(fallbackUserId) : undefined);
  }
  if (!requestObj.registeredDate) {
    requestObj.registeredDate = new Date();
  }
  if (!requestObj.type) {
    requestObj.type = 'Organ';
  }
  if (!requestObj.bloodGroup) {
    requestObj.bloodGroup = 'O-';
  }
  if (!requestObj.urgency) {
    requestObj.urgency = 'High';
  }
  // Remove coordinates if they are empty or not exactly length of 2 (breaks 2dsphere indexing)
  if (requestObj.location && (!Array.isArray(requestObj.location.coordinates) || requestObj.location.coordinates.length !== 2)) {
    requestObj.location = undefined;
  }
};

// ==========================================
// CORE ADMINISTRATIVE CONTROLLERS (FROM MAIN)
// ==========================================

const PENDING_REQUEST_STATUSES = ['Pending', 'PENDING'] as const;
const HOSPITAL_REQUEST_STATUSES = ['APPROVED', 'IN_PROGRESS', 'FULFILLED'] as const;

type HospitalRequestStatus = typeof HOSPITAL_REQUEST_STATUSES[number];
type RequestRecord = {
  _id: {
    toString(): string;
  };
  [key: string]: unknown;
};

const isHospitalRequestStatus = (status: unknown): status is HospitalRequestStatus => {
  return typeof status === 'string' && HOSPITAL_REQUEST_STATUSES.includes(status as HospitalRequestStatus);
};

const toRequestDto = (request: RequestRecord) => ({
  id: request._id.toString(),
  ...request,
});

export const getRequests = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { type } = req.query;

    // If type is Organ and user is a Donor, filter by compatibility and query from OrganWaitlist
    if (type === 'Organ' && req.user && req.user.role === 'Donor') {
      const donorProfile = await DonorProfile.findOne({ userId: req.user.id });
      if (donorProfile && donorProfile.isAvailable && donorProfile.organsWillingToDonate?.length > 0) {
        const organs = donorProfile.organsWillingToDonate;
        const bloodType = donorProfile.bloodType || 'O-';
        const compatibleBloodGroups = getCompatiblePatientBloodGroups(bloodType);
        
        const waitlistFilter = {
          requiredOrgan: { $in: organs },
          bloodGroup: { $in: compatibleBloodGroups },
          status: { $in: ['Waitlisted', 'Waitlist', 'WAITLISTED', 'WAITLIST', 'Searching', 'SEARCHING'] },
        };

        const waitlistedPatients = await OrganWaitlist.find(waitlistFilter)
          .populate('hospitalId', 'name email')
          .sort({ createdAt: -1 });

        const hospitalUserIds = waitlistedPatients
          .map(p => (p.hospitalId as any)?._id || p.hospitalId)
          .filter(Boolean);

        const hospitalProfiles = await HospitalProfile.find({ userId: { $in: hospitalUserIds } });

        const waitlistIds = waitlistedPatients.map(p => p._id);

        // Fetch corresponding Request documents to map interest/matching info
        const existingRequests = await Request.find({ waitlistId: { $in: waitlistIds } });

        const mapped = waitlistedPatients.map(p => {
          const patientObj = p.toObject();
          const matchingReq = existingRequests.find(r => r.waitlistId?.toString() === patientObj._id.toString());
          const hospProfile = hospitalProfiles.find(hp => hp.userId?.toString() === ((patientObj.hospitalId as any)?._id || patientObj.hospitalId)?.toString());
          const hospitalPhone = hospProfile?.phone || hospProfile?.contactPerson?.phone || '';
          
          return {
            id: patientObj._id.toString(),
            _id: patientObj._id,
            patientName: patientObj.fullName,
            age: patientObj.age,
            gender: patientObj.gender,
            contactPhone: patientObj.contact,
            organType: patientObj.requiredOrgan,
            bloodGroup: patientObj.bloodGroup,
            urgency: patientObj.urgency,
            status: patientObj.status,
            facility: (patientObj.hospitalId as any)?.name || 'Coordinating Medical Center',
            hospitalPhone: hospitalPhone || null,
            notes: patientObj.medicalHistory || patientObj.comorbidities || '',
            medicalCertificateUrl: patientObj.medicalCertificateUrl || null,
            medicalHistory: patientObj.medicalHistory || null,
            comorbidities: patientObj.comorbidities || null,
            registeredDate: patientObj.createdAt,
            type: 'Organ',
            pledgedDonors: matchingReq ? (matchingReq as any).pledgedDonors : [],
            targetDonorId: matchingReq ? (matchingReq as any).targetDonorId : null,
          };
        });

        res.status(200).json({ success: true, data: mapped });
        return;
      } else {
        res.status(200).json({ success: true, data: [] });
        return;
      }
    }

    const filter: any = {};
    if (type) {
      filter.type = type;
    }

    const requests = await Request.find(filter).sort({ createdAt: -1 });

    const mapped = requests.map(r => {
      const obj = r.toObject();
      return {
        id: obj._id.toString(),
        ...obj,
      };
    });

    res.status(200).json({ success: true, data: mapped });
  } catch (error) {
    next(error);
  }
};

export const createRequest = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.body.type || !req.body.urgency || !req.body.status) {
      return next(new ApiError(400, 'Request type, urgency, and status are required.'));
    }

    const requestData = {
      ...req.body,
      location: parseGeoLocation(req.body),
      requestedBy: req.body.requestedBy || req.user?.id,
      registeredDate: req.body.registeredDate || new Date().toISOString(),
    };

    const newReq = new Request(requestData);
    await newReq.save();

    const obj = newReq.toObject();
    res.status(201).json({ success: true, data: { id: obj._id.toString(), ...obj } });
  } catch (error) {
    next(error);
  }
};

export const updateRequest = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // If an update contains location details, ensure it remains GeoJSON-compliant
    if (updateData.location || updateData.longitude || updateData.latitude) {
      updateData.location = parseGeoLocation(updateData);
    }

    const requestObj = await Request.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    if (!requestObj) {
      return next(new ApiError(404, 'Request not found.'));
    }

    const obj = requestObj.toObject();
    res.status(200).json({ success: true, data: { id: obj._id.toString(), ...obj } });
  } catch (error) {
    next(error);
  }
};

export const deleteRequest = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const requestObj = await Request.findByIdAndDelete(id);
    if (!requestObj) {
      return next(new ApiError(404, 'Request not found.'));
    }

    res.status(200).json({ success: true, message: 'Request deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// PATIENT MODULE SPECIFIC CONTROLLERS (MANUAL FLOW)
// ==========================================

export const createPatientRequest = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user || (req.user.role !== 'Patient' && req.user.role !== 'Hospital' && req.user.role !== 'Donor')) {
      return next(new ApiError(403, 'Access denied. Patient, Hospital or Donor role required to make requests.'));
    }

    const {
      patientName, facility, hospitalId, contactPhone, age, gender, organType,
      bloodGroup, units, urgency, facilityType, notes, type
    } = req.body;

    if (!type || !urgency || !bloodGroup || !patientName) {
      return next(new ApiError(400, 'Missing required fields: Type, urgency, blood group, and patient name are mandatory.'));
    }

    if (type === 'Organ' && req.user.role === 'Patient') {
      return next(new ApiError(403, 'Patients cannot directly request organs. Please contact a registered hospital to be placed on the organ waitlist.'));
    }

    const newReq = new Request({
      userId: req.user.id,
      requestedBy: req.user.id, // Support structural identity metrics across dashboards
      patientName,
      facility,
      hospitalId: hospitalId || null,
      age,
      gender,
      contactPhone,
      location: parseGeoLocation(req.body),
      organType,
      bloodGroup,
      units,
      urgency,
      facilityType,
      notes,
      type,
      status: 'PENDING',
      registeredDate: new Date(),
      matchPercentage: 0,
    });

    // Find the single best compatible donor
    const bestDonor = await findBestCompatibleDonorForRequest(newReq);
    if (bestDonor) {
      newReq.assignedDonorId = bestDonor._id;
    }

    await newReq.save();

    // If a donor was selected, send an email notification using SendGrid
    if (bestDonor) {
      try {
        const donorUser = await User.findById(bestDonor.userId).select('name email');
        if (donorUser && donorUser.email) {
          const inviteUrl = `${(process.env.NODE_ENV === 'production' ? process.env.CLIENT_URL : 'http://localhost:3000')}/donor/incoming-requests`;
          await sendDonorRequestNotification(donorUser.email, donorUser.name, {
            urgency: newReq.urgency,
            type: newReq.type,
            bloodGroup: newReq.bloodGroup,
            organType: newReq.organType,
            facility: newReq.facility,
            patientName: newReq.patientName,
          }, inviteUrl);
        }
      } catch (err: any) {
        logger.error(`Error sending email to assigned donor ${bestDonor._id}: ${err.message}`);
      }
    }

    const obj = newReq.toObject();
    res.status(201).json({
      success: true,
      data: {
        id: obj._id.toString(),
        ...obj,
      }
    });
  } catch (error) {
    next(error);
  }
};

export const findMatchesForRequest = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const requestObj = await Request.findById(id);
    if (!requestObj) return next(new ApiError(404, 'Request not found.'));

    const matches = await findNearbyCompatibleDonors(requestObj as any);
    const notifiedDonors = Array.from(new Set([
      ...(requestObj.notifiedDonors || []).map((donorId: any) => donorId.toString()),
      ...((requestObj as any).matchedDonors || [])
        .filter((matched: any) => ['NOTIFIED', 'ACCEPTED'].includes(matched.status))
        .map((matched: any) => matched.donorId?.toString())
        .filter(Boolean),
    ]));
    res.status(200).json({ success: true, data: matches, notifiedDonors });
  } catch (error) {
    next(error);
  }
};

export const dispatchToDonors = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { selectedDonorIds } = req.body as { selectedDonorIds?: string[] };

    if (!selectedDonorIds || !Array.isArray(selectedDonorIds) || selectedDonorIds.length === 0) {
      return next(new ApiError(400, 'selectedDonorIds must be a non-empty array.'));
    }

    const requestObj = await Request.findById(id);
    if (!requestObj) return next(new ApiError(404, 'Request not found.'));

    const alreadyNotified = new Set([
      ...(requestObj.notifiedDonors || []).map((donorId: any) => donorId.toString()),
      ...((requestObj as any).matchedDonors || [])
        .filter((matched: any) => ['NOTIFIED', 'ACCEPTED'].includes(matched.status))
        .map((matched: any) => matched.donorId?.toString())
        .filter(Boolean),
    ]);
    const uniqueDonorIds = Array.from(new Set(selectedDonorIds.map(did => did?.toString()).filter(Boolean)));
    const donorIdsToNotify = uniqueDonorIds.filter(did => !alreadyNotified.has(did));

    if (donorIdsToNotify.length === 0) {
      return next(new ApiError(400, 'All selected donors have already been notified for this request.'));
    }

    const matchedEntries = donorIdsToNotify.map(did => {
      const inviteToken = crypto.randomBytes(20).toString('hex');
      const tokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
      return {
        donorId: new Types.ObjectId(did) as any,
        inviteToken,
        tokenExpiresAt,
        status: 'NOTIFIED',
      };
    });

    const donors = await DonorProfile.find({ _id: { $in: donorIdsToNotify } }).populate('userId', 'name email phone').lean();
    const successfulDonorIds: string[] = [];
    const successfulEntries: typeof matchedEntries = [];

    await Promise.all(donors.map(async (d: any) => {
      const toEmail = d.userId?.email;
      const donorName = d.userId?.name || 'Donor';
      if (!toEmail) return;
      const entry = matchedEntries.find((e: any) => e.donorId?.toString() === d._id.toString());
      if (!entry) return;
      const inviteUrl = `${(process.env.NODE_ENV === 'production' ? process.env.CLIENT_URL : 'http://localhost:3000')}/donor/respond?requestId=${requestObj._id}&token=${entry.inviteToken}`;
      const requestDetails = {
        urgency: requestObj.urgency,
        type: requestObj.type,
        bloodGroup: requestObj.bloodGroup,
        organType: requestObj.organType,
        facility: requestObj.facility,
        patientName: requestObj.patientName,
      };
      try {
        await sendDonorRequestNotification(toEmail, donorName, requestDetails, inviteUrl);
        successfulDonorIds.push(d._id.toString());
        successfulEntries.push(entry);
      } catch (err) {
        logger.error(`Error sending dispatch notification to donor ${d._id}`, err);
      }
    }));

    if (successfulDonorIds.length === 0) {
      return next(new ApiError(502, 'No donor notifications were sent successfully.'));
    }

    (requestObj as any).matchedDonors = [...((requestObj as any).matchedDonors || []), ...(successfulEntries as any)];
    requestObj.notifiedDonors = [
      ...(requestObj.notifiedDonors || []),
      ...(successfulDonorIds.map(did => new Types.ObjectId(did)) as any),
    ];
    requestObj.status = 'DONOR_NOTIFIED';
    await requestObj.save();

    res.status(200).json({ success: true, message: 'Donors notified', data: { matchedCount: successfulDonorIds.length, notifiedDonors: successfulDonorIds } });
  } catch (error) {
    next(error);
  }
};

export const getMyRequests = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      return next(new ApiError(401, 'Not authenticated.'));
    }

    const requests = await Request.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .populate({
        path: 'pledgedDonors.donorId',
        select: 'name email'
      })
      .lean();

    // Secondary query to get blood types for donors
    const donorUserIds = requests.flatMap((r: any) => r.pledgedDonors?.map((p: any) => p.donorId?._id).filter(Boolean) || []);
    let donorProfiles: any[] = [];
    if (donorUserIds.length > 0) {
      donorProfiles = await mongoose.model('DonorProfile').find({ userId: { $in: donorUserIds } }).lean();
    }

    const mapped = requests.map((r: any) => {
      // Find an active/completed pledge to display donor info for backward compatibility
      const activePledge = r.pledgedDonors?.find((p: any) => ['PLEDGED', 'ARRIVED', 'BLEEDING', 'COMPLETED'].includes(p.status));
      const donorUser = activePledge?.donorId as any;
      const donorProfile = donorUser ? donorProfiles.find(dp => dp.userId.toString() === donorUser._id.toString()) : null;

      return {
        id: r._id.toString(),
        ...r,
        // Flatten donor details for the patient UI
        donorName: donorUser?.name || null,
        donorEmail: donorUser?.email || null,
        donorBloodType: donorProfile?.bloodType || null,
        acceptedAt: activePledge ? activePledge.pledgedAt : (r.updatedAt || null),
      };
    });

    res.status(200).json({
      success: true,
      data: mapped
    });
  } catch (error) {
    next(error);
  }
};

export const respondToRequest = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { response: donorResponse } = req.body as { response?: 'ACCEPTED' | 'DECLINED' };

    if (!donorResponse) {
      return next(new ApiError(400, 'Missing response.'));
    }

    if (!req.user || req.user.role !== 'Donor') {
      return next(new ApiError(401, 'Only donors can respond to requests.'));
    }

    const requestObj = await Request.findById(id);
    if (!requestObj) return next(new ApiError(404, 'Request not found.'));

    if (donorResponse === 'ACCEPTED') {
      const donorId = req.user.id;
      const alreadyPledged = requestObj.pledgedDonors?.some(pd => pd.donorId.toString() === donorId);
      
      if (alreadyPledged) {
        res.status(200).json({ success: true, message: 'You have already pledged to this request.' });
        return;
      }

      requestObj.pledgedDonors.push({
        donorId: req.user.id as any,
        status: 'PLEDGED',
        pledgedAt: new Date()
      });

      if (!requestObj.timeline) requestObj.timeline = [];
      requestObj.timeline.push({
        event: 'donor_pledged',
        timestamp: new Date()
      });

      await requestObj.save();
      res.status(200).json({ success: true, message: 'Thank you — you have pledged to the request.' });
      return;
    }

    res.status(200).json({ success: true, message: 'You have declined the request. Thank you.' });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// HOSPITAL MODULE SPECIFIC CONTROLLERS
// ==========================================

export const getHospitalIncomingRequests = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'Hospital') {
      return next(new ApiError(403, 'Access denied. Hospital role required.'));
    }

    const requests = await Request.find({
      type: { $in: ['Blood', 'Organ'] },
      status: { $in: ['Pending', 'PENDING', 'PENDING_HOSPITAL', 'DONOR_NOTIFIED', 'APPROVED', 'IN_PROGRESS', 'FULFILLED'] },
    })
      .sort({ createdAt: -1 })
      .populate({
        path: 'pledgedDonors.donorId',
        select: 'name email'
      })
      .lean() as RequestRecord[];

    res.status(200).json({
      success: true,
      data: requests.map(toRequestDto),
    });
  } catch (error) {
    next(error);
  }
};

export const updateRequestStatus = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'Hospital') {
      return next(new ApiError(403, 'Access denied. Hospital role required.'));
    }

    const { id } = req.params;
    const { status } = req.body as { status?: unknown };

    if (!isValidObjectId(id)) {
      return next(new ApiError(400, 'Invalid request ID.'));
    }

    if (!isHospitalRequestStatus(status)) {
      return next(new ApiError(400, 'Status must be one of: APPROVED, IN_PROGRESS, FULFILLED.'));
    }

    const requestObj = await Request.findById(id);

    if (!requestObj) {
      return next(new ApiError(404, 'Request not found.'));
    }

    const previousStatus = requestObj.status;
    requestObj.status = status as string;

    if (!requestObj.timeline) requestObj.timeline = [];
    requestObj.timeline.push({
      event: `status_changed_to_${(status as string).toLowerCase()}`,
      timestamp: new Date()
    });

    if (status === 'FULFILLED' && previousStatus !== 'FULFILLED' && requestObj.type === 'Blood') {
      const hospitalProfile = await HospitalProfile.findOne({ userId: req.user.id });
      if (hospitalProfile) {
        const invIndex = hospitalProfile.bloodInventory.findIndex(inv => inv.bloodGroup === requestObj.bloodGroup);
        if (invIndex !== -1) {
          const unitsToDeduct = requestObj.units || 1;
          hospitalProfile.bloodInventory[invIndex].units = Math.max(0, hospitalProfile.bloodInventory[invIndex].units - unitsToDeduct);
          
          const currentUnits = hospitalProfile.bloodInventory[invIndex].units;
          const currentMax = hospitalProfile.bloodInventory[invIndex].maxCapacity;
          const percentage = currentMax > 0 ? (currentUnits / currentMax) * 100 : 0;
          
          if (percentage <= 15) hospitalProfile.bloodInventory[invIndex].status = 'critical';
          else if (percentage <= 30) hospitalProfile.bloodInventory[invIndex].status = 'low';
          else if (percentage >= 80) hospitalProfile.bloodInventory[invIndex].status = 'optimal';
          else hospitalProfile.bloodInventory[invIndex].status = 'adequate';

          await hospitalProfile.save();
        }
      }
    }

    sanitizeRequestForSave(requestObj, req.user?.id);
    await requestObj.save();

    res.status(200).json({
      success: true,
      data: toRequestDto(requestObj.toObject() as any),
    });
  } catch (error) {
    next(error);
  }
};

export const getMyPledges = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'Donor') return next(new ApiError(403, 'Access denied.'));
    
    const requests = await Request.find({
      pledgedDonors: {
        $elemMatch: {
          $or: [
            { donorId: new Types.ObjectId(req.user.id) },
            { donorId: req.user.id }
          ],
          status: { $in: ['PLEDGED', 'ARRIVED', 'COMPLETED'] }
        }
      }
    }).lean();

    const result = requests.map((r: any) => {
      const dto = toRequestDto(r);
      const myPledge = r.pledgedDonors.find((d: any) => d.donorId.toString() === req.user!.id);
      return { ...dto, myPledgeStatus: myPledge?.status };
    });

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const expressInterest = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    if (!req.user) {
      return next(new ApiError(401, 'Not authenticated.'));
    }

    if (!isValidObjectId(id)) {
      return next(new ApiError(400, 'Invalid request or patient ID.'));
    }

    const donorProfile = await DonorProfile.findOne({ userId: req.user.id });
    if (!donorProfile) {
      return next(new ApiError(404, 'Donor profile not found.'));
    }

    // Try to find an existing request by either request _id or waitlistId
    let requestObj = await Request.findOne({
      $or: [
        { _id: new Types.ObjectId(id) },
        { waitlistId: new Types.ObjectId(id) }
      ]
    });

    if (!requestObj) {
      // Check if the ID corresponds to an OrganWaitlist patient
      const waitlistPatient = await OrganWaitlist.findById(id);
      if (waitlistPatient) {
        const hospitalUser = await User.findById(waitlistPatient.hospitalId);
        requestObj = new Request({
          waitlistId: waitlistPatient._id,
          patientName: waitlistPatient.fullName,
          age: waitlistPatient.age,
          gender: waitlistPatient.gender,
          contactPhone: waitlistPatient.contact,
          organType: waitlistPatient.requiredOrgan,
          bloodGroup: waitlistPatient.bloodGroup,
          urgency: waitlistPatient.urgency,
          status: 'Waitlisted',
          type: 'Organ',
          registeredDate: waitlistPatient.createdAt,
          requestedBy: waitlistPatient.hospitalId,
          hospitalId: waitlistPatient.hospitalId,
          facility: hospitalUser?.name || 'Coordinating Medical Center',
          location: {
            type: 'Point',
            coordinates: [0, 0]
          }
        });
      }
    }

    if (!requestObj) {
      return next(new ApiError(404, 'Transplant request or waitlist patient not found.'));
    }

    // Check if donor already exists in pledgedDonors
    const alreadyPledged = requestObj.pledgedDonors?.some(
      (m: any) => m.donorId.toString() === req.user!.id
    );

    if (alreadyPledged) {
      return next(new ApiError(400, 'You have already pledged to this request.'));
    }

    requestObj.pledgedDonors.push({
      donorId: req.user.id as any,
      status: 'PLEDGED',
      pledgedAt: new Date(),
    });

    // Find coordinating hospital ID
    let hospitalId: any = requestObj.hospitalId || null;
    if (!hospitalId) {
      const creator = await User.findById(new Types.ObjectId(requestObj.requestedBy as any));
      if (creator && creator.role === 'Hospital') {
        hospitalId = creator._id;
      } else if (requestObj.facility) {
        const matchingHospital = await User.findOne({ name: requestObj.facility, role: 'Hospital' });
        if (matchingHospital) {
          hospitalId = matchingHospital._id;
        }
      }
    }
    requestObj.hospitalId = hospitalId;
    if (requestObj.status === 'Waitlisted') {
      requestObj.status = 'PENDING_HOSPITAL';
    }

    if (!requestObj.timeline) {
      requestObj.timeline = [];
    }

    requestObj.timeline.push({
      event: 'donor_pledged',
      timestamp: new Date(),
    });

    sanitizeRequestForSave(requestObj, req.user?.id);
    await requestObj.save();

    res.status(200).json({ success: true, message: 'Interest expressed successfully.' });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// BLOOD FULFILLMENT ENGINE (FIFO)
// ==========================================

export const fulfillBloodRequest = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    if (!req.user || req.user.role !== 'Hospital') {
      throw new ApiError(403, 'Access denied. Hospital role required.');
    }

    const { id } = req.params;
    const { unitsToFulfill } = req.body;

    if (!isValidObjectId(id)) {
      throw new ApiError(400, 'Invalid request ID.');
    }

    if (!unitsToFulfill || typeof unitsToFulfill !== 'number' || unitsToFulfill <= 0) {
      throw new ApiError(400, 'unitsToFulfill must be a positive integer.');
    }

    // 1. Fetch Request
    const requestDoc = await Request.findById(id).session(session);
    if (!requestDoc) {
      throw new ApiError(404, 'Request not found.');
    }

    if (requestDoc.type !== 'Blood') {
      throw new ApiError(400, 'This endpoint is for blood requests only.');
    }

    if (requestDoc.status === 'FULFILLED' || requestDoc.status === 'CANCELLED') {
      throw new ApiError(400, 'Request is already fulfilled or cancelled.');
    }

    const requested = requestDoc.bloodLogistics?.unitsRequested || requestDoc.units || 1;
    const alreadyFulfilled = requestDoc.bloodLogistics?.unitsFulfilled || 0;
    const remaining = requested - alreadyFulfilled;

    if (unitsToFulfill > remaining) {
      throw new ApiError(400, `Cannot fulfill ${unitsToFulfill} units. Only ${remaining} units remaining.`);
    }

    const requiredComponent = requestDoc.bloodLogistics?.componentType || 'WHOLE_BLOOD';
    const hospitalIdObj = new Types.ObjectId(req.user.id);

    // 2. FIFO Query
    const availableBags = await BloodBag.find({
      hospitalId: hospitalIdObj,
      bloodGroup: requestDoc.bloodGroup,
      componentType: requiredComponent,
      status: 'AVAILABLE',
      expirationDate: { $gt: new Date() }, // strictly viable
    })
      .sort({ expirationDate: 1 }) // oldest viable first
      .limit(unitsToFulfill)
      .session(session);

    // 3. Stock Check
    if (availableBags.length < unitsToFulfill) {
      throw new ApiError(400, `Insufficient viable stock. Requested ${unitsToFulfill}, but only ${availableBags.length} available.`);
    }

    const bagIds = availableBags.map((bag) => bag._id);

    // 4. Ledger Update
    await BloodBag.updateMany(
      { _id: { $in: bagIds } },
      { $set: { status: 'TRANSFUSED' } },
      { session }
    );

    // 5. Request Update
    if (!requestDoc.bloodLogistics) {
      requestDoc.bloodLogistics = {
        componentType: requiredComponent as any,
        unitsRequested: requested,
        unitsFulfilled: 0,
        fulfilledBagIds: [],
      };
    }

    requestDoc.bloodLogistics.fulfilledBagIds.push(...bagIds as any);
    requestDoc.bloodLogistics.unitsFulfilled += unitsToFulfill;

    if (requestDoc.bloodLogistics.unitsFulfilled >= requested) {
      requestDoc.status = 'FULFILLED';
    } else {
      requestDoc.status = 'IN_PROGRESS';
    }

    if (!requestDoc.timeline) requestDoc.timeline = [];
    requestDoc.timeline.push({
      event: `blood_fulfilled_${unitsToFulfill}_units`,
      timestamp: new Date()
    });

    sanitizeRequestForSave(requestDoc, req.user.id);
    await requestDoc.save({ session });

    // 6. Commit
    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      success: true,
      message: `Successfully fulfilled ${unitsToFulfill} units.`,
      data: requestDoc
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    next(error);
  }
};

// ==========================================
// NEW HOSPITAL DIRECTED COMMAND CENTER ENDPOINTS
// ==========================================

export const getHospitalTriageBoard = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'Hospital') return next(new ApiError(403, 'Access denied.'));
    const requests = await Request.find({
      hospitalId: new Types.ObjectId(req.user.id),
      status: { $in: ['Pending', 'PENDING_HOSPITAL', 'DONOR_NOTIFIED', 'APPROVED', 'IN_PROGRESS'] }
    }).sort({ createdAt: -1 }).lean();

    res.status(200).json({ success: true, data: requests.map(toRequestDto) });
  } catch (error) {
    next(error);
  }
};

export const getHospitalLobbyQueue = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'Hospital') return next(new ApiError(403, 'Access denied.'));
    const requests = await Request.find({
      hospitalId: new Types.ObjectId(req.user.id),
      'pledgedDonors.status': 'PLEDGED'
    }).populate('pledgedDonors.donorId', 'name bloodType').lean();

    res.status(200).json({ success: true, data: requests.map(toRequestDto) });
  } catch (error) {
    next(error);
  }
};

export const getHospitalPhlebotomyQueue = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'Hospital') return next(new ApiError(403, 'Access denied.'));
    const requests = await Request.find({
      hospitalId: new Types.ObjectId(req.user.id),
      'pledgedDonors.status': 'ARRIVED'
    }).populate('pledgedDonors.donorId', 'name bloodType').lean();

    res.status(200).json({ success: true, data: requests.map(toRequestDto) });
  } catch (error) {
    next(error);
  }
};

export const arriveDirectedDonor = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { reqId, donorId } = req.params;
    if (!req.user || req.user.role !== 'Hospital') return next(new ApiError(403, 'Access denied.'));

    const requestObj = await Request.findOneAndUpdate(
      { _id: new Types.ObjectId(reqId), hospitalId: new Types.ObjectId(req.user.id), 'pledgedDonors.donorId': new Types.ObjectId(donorId) },
      { $set: { 'pledgedDonors.$.status': 'ARRIVED' } },
      { new: true }
    );
    if (!requestObj) return next(new ApiError(404, 'Request or pledge not found for this hospital.'));

    res.status(200).json({ success: true, message: 'Donor arrived in Lobby.' });
  } catch (error) {
    next(error);
  }
};

export const completeDirectDonation = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { reqId, donorId } = req.params;
    if (!req.user || req.user.role !== 'Hospital') return next(new ApiError(403, 'Access denied.'));

    const requestObj = await Request.findOne({
      _id: new Types.ObjectId(reqId),
      hospitalId: new Types.ObjectId(req.user.id),
      'pledgedDonors.donorId': new Types.ObjectId(donorId)
    });

    if (!requestObj) return next(new ApiError(404, 'Request or pledge not found for this hospital.'));

    const pledge = requestObj.pledgedDonors.find(p => p.donorId.toString() === donorId);
    if (!pledge || pledge.status !== 'ARRIVED') {
      return next(new ApiError(400, 'Donor must be in ARRIVED status.'));
    }

    pledge.status = 'COMPLETED';

    if (!requestObj.bloodLogistics) {
      requestObj.bloodLogistics = {
        componentType: 'WHOLE_BLOOD',
        unitsRequested: requestObj.units || 1,
        unitsFulfilled: 0,
        fulfilledBagIds: [],
      };
    }

    requestObj.bloodLogistics.unitsFulfilled += 1;
    (requestObj as any).unitsFulfilled = ((requestObj as any).unitsFulfilled || 0) + 1;

    if ((requestObj as any).unitsFulfilled >= (requestObj.units || 1)) {
      requestObj.status = 'FULFILLED'; // <-- Blow the final whistle!
    } else {
      requestObj.status = 'IN_PROGRESS';
    }

    if (!requestObj.timeline) requestObj.timeline = [];
    requestObj.timeline.push({ event: `direct_donation_completed`, timestamp: new Date() });

    await requestObj.save();

    // The Magic Click: Lock 56-day cooldown
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const now = new Date();
    const formattedDate = `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
    await DonorProfile.findOneAndUpdate(
      { userId: new Types.ObjectId(donorId) },
      { $set: { lastDonation: formattedDate } }
    );

    res.status(200).json({ success: true, message: 'Direct donation completed!' });
  } catch (error) {
    next(error);
  }
};

