import { Response, NextFunction } from 'express';
import { Request } from '../models/Request';
import { ApiError } from '../middlewares/error.middleware';
import { AuthRequest } from '../middlewares/auth.middleware';

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
