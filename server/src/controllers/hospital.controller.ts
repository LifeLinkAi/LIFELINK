import { Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import { User } from '../models/User';
import { HospitalProfile } from '../models/HospitalProfile';
import { ApiError } from '../middlewares/error.middleware';
import { AuthRequest } from '../middlewares/auth.middleware';

export const getHospitals = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const hospitals = await User.find({ role: 'Hospital' }).sort({ createdAt: -1 });
    const result = [];
    for (const user of hospitals) {
      let profile = await HospitalProfile.findOne({ userId: user._id });
      if (!profile) {
        profile = await HospitalProfile.create({
          userId: user._id,
          logo: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}`,
        });
      }
      result.push({
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        licenseId: profile.licenseId,
        city: profile.city,
        location: profile.location,
        logo: profile.logo || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}`,
        specialties: profile.specialties,
        status: profile.status,
        patientCount: profile.patientCount,
        rating: profile.rating,
        bloodHealthStatus: profile.bloodHealthStatus,
      });
    }
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const createHospital = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {
      name,
      email,
      password,
      licenseId,
      city,
      location,
      logo,
      specialties,
      status,
      patientCount,
      rating,
      bloodHealthStatus,
    } = req.body;

    if (!name || !email) {
      return next(new ApiError(400, 'Name and email are required.'));
    }

    const emailLower = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: emailLower });
    if (existingUser) {
      return next(new ApiError(400, 'A user with this email already exists.'));
    }

    const salt = await bcrypt.genSalt(10);
    const pass = password || 'hospital1234';
    const hashedPassword = await bcrypt.hash(pass, salt);

    const user = await User.create({
      name,
      email: emailLower,
      password: hashedPassword,
      role: 'Hospital',
    });

    const profile = await HospitalProfile.create({
      userId: user._id,
      licenseId: licenseId || '',
      city: city || '',
      location: location || '',
      logo: logo || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
      specialties: specialties || ['General'],
      status: status || 'Pending',
      patientCount: patientCount || 0,
      rating: rating || '--',
      bloodHealthStatus: bloodHealthStatus || 'Stable',
    });

    res.status(201).json({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      licenseId: profile.licenseId,
      city: profile.city,
      location: profile.location,
      logo: profile.logo,
      specialties: profile.specialties,
      status: profile.status,
      patientCount: profile.patientCount,
      rating: profile.rating,
      bloodHealthStatus: profile.bloodHealthStatus,
    });
  } catch (error) {
    next(error);
  }
};

export const createHospitalBulk = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { hospitals } = req.body;
    if (!hospitals || !Array.isArray(hospitals)) {
      return next(new ApiError(400, 'hospitals array is required for bulk operation.'));
    }

    const results = [];
    const salt = await bcrypt.genSalt(10);
    const defaultHashedPassword = await bcrypt.hash('hospital1234', salt);

    for (const hospitalData of hospitals) {
      const {
        name,
        email,
        licenseId,
        city,
        location,
        logo,
        specialties,
        status,
        patientCount,
        rating,
        bloodHealthStatus,
      } = hospitalData;

      if (!name || !email) continue;
      const emailLower = email.toLowerCase().trim();

      const existingUser = await User.findOne({ email: emailLower });
      if (existingUser) continue;

      const user = await User.create({
        name,
        email: emailLower,
        password: defaultHashedPassword,
        role: 'Hospital',
      });

      const profile = await HospitalProfile.create({
        userId: user._id,
        licenseId: licenseId || '',
        city: city || '',
        location: location || '',
        logo: logo || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
        specialties: specialties || ['General'],
        status: status || 'Pending',
        patientCount: patientCount || 0,
        rating: rating || '--',
        bloodHealthStatus: bloodHealthStatus || 'Stable',
      });

      results.push({
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        licenseId: profile.licenseId,
        city: profile.city,
        location: profile.location,
        logo: profile.logo,
        specialties: profile.specialties,
        status: profile.status,
        patientCount: profile.patientCount,
        rating: profile.rating,
        bloodHealthStatus: profile.bloodHealthStatus,
      });
    }

    res.status(201).json({ success: true, count: results.length, data: results });
  } catch (error) {
    next(error);
  }
};

export const updateHospital = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, email, ...profileFields } = req.body;

    const user = await User.findById(id);
    if (!user || user.role !== 'Hospital') {
      return next(new ApiError(404, 'Hospital not found.'));
    }

    if (name) user.name = name;
    if (email) user.email = email.toLowerCase().trim();
    await user.save();

    const profile = await HospitalProfile.findOneAndUpdate(
      { userId: user._id },
      { $set: profileFields },
      { new: true, upsert: true }
    );

    res.status(200).json({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      licenseId: profile.licenseId,
      city: profile.city,
      location: profile.location,
      logo: profile.logo,
      specialties: profile.specialties,
      status: profile.status,
      patientCount: profile.patientCount,
      rating: profile.rating,
      bloodHealthStatus: profile.bloodHealthStatus,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteHospital = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user || user.role !== 'Hospital') {
      return next(new ApiError(404, 'Hospital not found.'));
    }

    await User.findByIdAndDelete(id);
    await HospitalProfile.findOneAndDelete({ userId: id });

    res.status(200).json({ success: true, message: 'Hospital deleted successfully.' });
  } catch (error) {
    next(error);
  }
};
