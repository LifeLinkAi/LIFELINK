import { Response, NextFunction } from 'express';
import { Types, isValidObjectId } from 'mongoose';
import { Request } from '../models/Request';
import { ApiError } from '../middlewares/error.middleware';
import { AuthRequest } from '../middlewares/auth.middleware';
import crypto from 'crypto';
import { findNearbyCompatibleDonors } from '../services/matching/donor-match.service';
import { sendDonorRequestNotification } from '../services/notifications/email.service';
import { logger } from '../utils/logger';
import { DonorProfile } from '../models/DonorProfile';
import { HospitalProfile } from '../models/HospitalProfile';

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
    if (!req.user || (req.user.role !== 'Patient' && req.user.role !== 'Hospital')) {
      return next(new ApiError(403, 'Access denied. Patient or Hospital role required to make requests.'));
    }

    const { 
      patientName, facility, contactPhone, age, gender, organType, 
      bloodGroup, units, urgency, facilityType, notes, type
    } = req.body;

    if (!type || !urgency || !bloodGroup || !patientName) {
      return next(new ApiError(400, 'Missing required fields: Type, urgency, blood group, and patient name are mandatory.'));
    }

    const newReq = new Request({
      userId: req.user.id, 
      requestedBy: req.user.id, // Support structural identity metrics across dashboards
      patientName,
      facility,
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
      status: 'Pending', 
      registeredDate: new Date(),
      matchPercentage: 0,
    });

    await newReq.save();

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
      ...(requestObj.matchedDonors || [])
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
      ...(requestObj.matchedDonors || [])
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
      const inviteUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/donor/respond?requestId=${requestObj._id}&token=${entry.inviteToken}`;
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

    requestObj.matchedDonors = [...(requestObj.matchedDonors || []), ...(successfulEntries as any)];
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

    const requests = await Request.find({ userId: req.user.id }).sort({ createdAt: -1 });

    const mapped = requests.map(r => {
      const obj = r.toObject();
      return {
        id: obj._id.toString(),
        ...obj,
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
    const { token, response: donorResponse } = req.body as { token?: string; response?: 'ACCEPTED' | 'DECLINED' };

    if (!token || !donorResponse) {
      return next(new ApiError(400, 'Missing token or response.'));
    }

    const requestObj = await Request.findOne({ _id: id, 'matchedDonors.inviteToken': token }, { 'matchedDonors.$': 1, acceptedDonorId: 1, status: 1, notifiedDonors: 1 });
    if (!requestObj) return next(new ApiError(404, 'Request or token not found.'));

    const matched = (requestObj.matchedDonors && requestObj.matchedDonors[0]) as any;
    if (!matched) return next(new ApiError(400, 'Invalid token.'));

    const now = new Date();
    if (matched.tokenExpiresAt && matched.tokenExpiresAt < now) {
      await Request.updateOne({ _id: id, 'matchedDonors.inviteToken': token }, { $set: { 'matchedDonors.$.status': 'EXPIRED' } });
      return next(new ApiError(400, 'Token has expired.'));
    }

    if (donorResponse === 'ACCEPTED') {
      const donorId = matched.donorId;
      const filter = {
        _id: id,
        'matchedDonors.inviteToken': token,
        'matchedDonors.status': 'NOTIFIED',
        acceptedDonorId: null,
      };
      const update = {
        $set: {
          'matchedDonors.$.status': 'ACCEPTED',
          'matchedDonors.$.respondedAt': now,
          status: 'APPROVED',
          acceptedDonorId: donorId,
        },
      };

      const updated = await Request.findOneAndUpdate(filter, update, { new: true });
      if (!updated) {
        const latestRequest = await Request.findById(id, { status: 1, notifiedDonors: 1, matchedDonors: 1, acceptedDonorId: 1 }).lean();
        console.log('[respondToRequest] acceptance validation failed', {
          requestId: id,
          requestStatus: latestRequest?.status,
          requestNotifiedDonors: (latestRequest?.notifiedDonors || []).map((notifiedDonor: any) => notifiedDonor.toString()),
          incomingDonorId: donorId?.toString(),
          matchedDonorStatus: matched.status,
          acceptedDonorId: latestRequest?.acceptedDonorId?.toString?.() || latestRequest?.acceptedDonorId,
        });
        return next(new ApiError(400, 'This request has already been accepted by another donor or the link is invalid.'));
      }

      res.status(200).json({ success: true, message: 'Thank you â€” you have accepted the request.' });
      return;
    }

    await Request.updateOne({ _id: id, 'matchedDonors.inviteToken': token }, { $set: { 'matchedDonors.$.status': 'DECLINED', 'matchedDonors.$.respondedAt': now } });
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
      status: { $in: ['Pending', 'PENDING', 'APPROVED', 'IN_PROGRESS', 'FULFILLED'] },
    })
      .sort({ createdAt: -1 })
      .populate({
        path: 'acceptedDonorId',
        select: 'bloodType userId',
        populate: { path: 'userId', select: 'name email' }
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

    await requestObj.save();

    res.status(200).json({
      success: true,
      data: toRequestDto(requestObj.toObject() as any),
    });
  } catch (error) {
    next(error);
  }
};
