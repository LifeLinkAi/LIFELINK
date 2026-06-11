import { Response, NextFunction } from 'express';
import { Request } from '../models/Request';
import { ApiError } from '../middlewares/error.middleware';
import { AuthRequest } from '../middlewares/auth.middleware';
import crypto from 'crypto';
import { findNearbyCompatibleDonors } from '../services/matching/donor-match.service';
import { sendDonorRequestNotification } from '../services/notifications/email.service';
import { logger } from '../utils/logger';
import { Schema } from 'mongoose';
import { DonorProfile } from '../models/DonorProfile';

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

    res.status(200).json(mapped);
  } catch (error) {
    next(error);
  }
};

export const createRequest = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const requestData = req.body;
    if (!requestData.type || !requestData.urgency || !requestData.status) {
      return next(new ApiError(400, 'Request type, urgency, and status are required.'));
    }

    const newReq = new Request(requestData);
    await newReq.save();

    const obj = newReq.toObject();
    res.status(201).json({
      id: obj._id.toString(),
      ...obj,
    });
  } catch (error) {
    next(error);
  }
};

export const updateRequest = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const requestObj = await Request.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    if (!requestObj) {
      return next(new ApiError(404, 'Request not found.'));
    }

    const obj = requestObj.toObject();
    res.status(200).json({
      id: obj._id.toString(),
      ...obj,
    });
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
// PATIENT MODULE SPECIFIC CONTROLLERS
// ==========================================

export const createPatientRequest = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user || (req.user.role !== 'Patient' && req.user.role !== 'Hospital')) {
      return next(new ApiError(403, 'Access denied. Patient or Hospital role required to make requests.'));
    }

    const { 
      patientName, facility, age, gender, organType, 
      bloodGroup, units, urgency, facilityType, notes, type, location
    } = req.body;

    if (!type || !urgency || !bloodGroup || !patientName) {
      return next(new ApiError(400, 'Missing required fields: Type, urgency, blood group, and patient name are mandatory.'));
    }

    // Build the request object, strictly controlling the status and metadata
    const newReq = new Request({
      userId: req.user.id, // Tie the request to the logged-in patient account
      patientName,
      facility,
      age,
      gender,
      location,
      organType,
      bloodGroup,
      units,
      urgency,
      facilityType,
      notes,
      type,
      status: 'Pending', // Force all patient-created requests to start as Pending
      registeredDate: new Date(),
      matchPercentage: 0, // Will be calculated by your matching background engine later
    });

    await newReq.save();

    // Previously this endpoint auto-dispatched to donors; in Manual Selection flow
    // matching and dispatch are handled by separate endpoints.

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

// Find matching donors for a request without modifying the request document
export const findMatchesForRequest = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const requestObj = await Request.findById(id);
    if (!requestObj) return next(new ApiError(404, 'Request not found.'));

    const matches = await findNearbyCompatibleDonors(requestObj as any);
    res.status(200).json({ success: true, data: matches });
  } catch (error) {
    next(error);
  }
};

// Dispatch selected donors: persist matchedDonors and send notifications
export const dispatchToDonors = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { selectedDonorIds } = req.body as { selectedDonorIds?: string[] };

    if (!selectedDonorIds || !Array.isArray(selectedDonorIds) || selectedDonorIds.length === 0) {
      return next(new ApiError(400, 'selectedDonorIds must be a non-empty array.'));
    }

    const requestObj = await Request.findById(id);
    if (!requestObj) return next(new ApiError(404, 'Request not found.'));

    // Generate matchedDonor entries for selected donors
    const matchedEntries = selectedDonorIds.map(did => {
      const inviteToken = crypto.randomBytes(20).toString('hex');
      const tokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
      return {
        donorId: did as any,
        inviteToken,
        tokenExpiresAt,
        status: 'NOTIFIED',
      };
    });

    // Append to existing matchedDonors
    requestObj.matchedDonors = [...(requestObj.matchedDonors || []), ...(matchedEntries as any)];
    requestObj.status = 'DONOR_NOTIFIED';
    await requestObj.save();

    // Fetch donor profiles to send emails
    const { DonorProfile } = require('../models/DonorProfile');
    const donors = await DonorProfile.find({ _id: { $in: selectedDonorIds } }).populate('userId', 'name email phone').lean();

    const emailPromises = donors.map((d: any) => {
      const toEmail = d.userId?.email;
      const donorName = d.userId?.name || 'Donor';
      if (!toEmail) return Promise.resolve();
      const entry = matchedEntries.find((e: any) => e.donorId?.toString() === d._id.toString());
      if (!entry) return Promise.resolve();
      const inviteUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/donor/respond?requestId=${requestObj._id}&token=${entry.inviteToken}`;
      const requestDetails = {
        urgency: requestObj.urgency,
        type: requestObj.type,
        bloodGroup: requestObj.bloodGroup,
        organType: requestObj.organType,
        facility: requestObj.facility,
        patientName: requestObj.patientName,
      };
      return sendDonorRequestNotification(toEmail, donorName, requestDetails, inviteUrl);
    });

    Promise.all(emailPromises).catch(err => logger.error('Error sending dispatch notifications', err));

    res.status(200).json({ success: true, message: 'Donors notified', data: { matchedCount: matchedEntries.length } });
  } catch (error) {
    next(error);
  }
};

export const getMyRequests = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      return next(new ApiError(401, 'Not authenticated.'));
    }

    // Find only the records that match the logged-in user's ID
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

    // Find the matched donor entry (projection of the matching array element)
    const requestObj = await Request.findOne({ _id: id, 'matchedDonors.inviteToken': token }, { 'matchedDonors.$': 1, acceptedDonorId: 1 });
    if (!requestObj) return next(new ApiError(404, 'Request or token not found.'));

    const matched = (requestObj.matchedDonors && requestObj.matchedDonors[0]) as any;
    if (!matched) return next(new ApiError(400, 'Invalid token.'));

    const now = new Date();
    if (matched.tokenExpiresAt && matched.tokenExpiresAt < now) {
      // mark expired atomically
      await Request.updateOne({ _id: id, 'matchedDonors.inviteToken': token }, { $set: { 'matchedDonors.$.status': 'EXPIRED' } });
      return next(new ApiError(400, 'Token has expired.'));
    }

    if (donorResponse === 'ACCEPTED') {
      // Attempt atomic accept: only succeed if no acceptedDonorId exists and the matchedDonor is still NOTIFIED
      const donorId = matched.donorId;
      const filter = { _id: id, 'matchedDonors.inviteToken': token, 'matchedDonors.status': 'NOTIFIED', acceptedDonorId: { $exists: false } };
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
        return next(new ApiError(400, 'This request has already been accepted by another donor or the link is invalid.'));
      }

      res.status(200).json({ success: true, message: 'Thank you — you have accepted the request.' });
      return;
    }

    // DECLINED: atomically set the matched donor status to DECLINED
    await Request.updateOne({ _id: id, 'matchedDonors.inviteToken': token }, { $set: { 'matchedDonors.$.status': 'DECLINED', 'matchedDonors.$.respondedAt': now } });
    res.status(200).json({ success: true, message: 'You have declined the request. Thank you.' });
  } catch (error) {
    next(error);
  }
};
