import { Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { User } from '../models/User';
import { HospitalProfile } from '../models/HospitalProfile';
import { ApiError } from '../middlewares/error.middleware';
import { AuthRequest } from '../middlewares/auth.middleware';
import { sendHospitalInviteEmail } from '../services/notifications/email.service';

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
        governmentLicenseId: profile.governmentLicenseId,
        city: profile.city,
        location: profile.location,
        logo: profile.logo || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}`,
        specialties: profile.specialties,
        status: profile.status,
        patientCount: profile.patientCount,
        rating: profile.rating,
        bloodHealthStatus: profile.bloodHealthStatus,
        isSetupComplete: profile.isSetupComplete,
        phone: profile.phone,
        website: profile.website,
        accreditation: profile.accreditation,
        hospitalLicenseUrl: profile.hospitalLicenseUrl,
        kidneyTransplantLicenseUrl: profile.kidneyTransplantLicenseUrl,
        liverTransplantLicenseUrl: profile.liverTransplantLicenseUrl,
        heartTransplantLicenseUrl: profile.heartTransplantLicenseUrl,
        lungTransplantLicenseUrl: profile.lungTransplantLicenseUrl,
        contactPerson: profile.contactPerson,
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
    const tempPass = crypto.randomBytes(16).toString('hex');
    const hashedPassword = await bcrypt.hash(tempPass, salt);

    const user = await User.create({
      name,
      email: emailLower,
      password: hashedPassword,
      role: 'Hospital',
    });

    const inviteToken = crypto.randomBytes(32).toString('hex');
    const inviteTokenExpires = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 hours

    const profile = await HospitalProfile.create({
      userId: user._id,
      licenseId: '',
      governmentLicenseId: '',
      city: '',
      location: '',
      logo: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
      specialties: ['General'],
      status: 'Pending',
      isSetupComplete: false,
      inviteToken,
      inviteTokenExpires,
    });

    // Send invitation email
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
    const inviteUrl = `${clientUrl.replace(/\/$/, '')}/register?token=${inviteToken}`;

    sendHospitalInviteEmail(emailLower, name, inviteUrl).catch((err) => {
      console.error(`Error sending hospital invite email to ${emailLower}:`, err);
    });

    res.status(201).json({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      licenseId: profile.licenseId,
      governmentLicenseId: profile.governmentLicenseId,
      city: profile.city,
      location: profile.location,
      logo: profile.logo,
      specialties: profile.specialties,
      status: profile.status,
      isSetupComplete: profile.isSetupComplete,
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
      governmentLicenseId: profile.governmentLicenseId,
      city: profile.city,
      location: profile.location,
      logo: profile.logo,
      specialties: profile.specialties,
      status: profile.status,
      patientCount: profile.patientCount,
      rating: profile.rating,
      bloodHealthStatus: profile.bloodHealthStatus,
      isSetupComplete: profile.isSetupComplete,
      phone: profile.phone,
      website: profile.website,
      accreditation: profile.accreditation,
      hospitalLicenseUrl: profile.hospitalLicenseUrl,
      kidneyTransplantLicenseUrl: profile.kidneyTransplantLicenseUrl,
      liverTransplantLicenseUrl: profile.liverTransplantLicenseUrl,
      heartTransplantLicenseUrl: profile.heartTransplantLicenseUrl,
      lungTransplantLicenseUrl: profile.lungTransplantLicenseUrl,
      contactPerson: profile.contactPerson,
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

export const getMeHospitalProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      return next(new ApiError(401, 'Not authenticated.'));
    }

    const user = await User.findById(req.user.id).select('-password');
    if (!user || user.role !== 'Hospital') {
      return next(new ApiError(404, 'Hospital user not found.'));
    }

    let profile = await HospitalProfile.findOne({ userId: user._id });
    if (!profile) {
      profile = await HospitalProfile.create({
        userId: user._id,
        logo: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}`,
      });
    }

    res.status(200).json({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      licenseId: profile.licenseId,
      governmentLicenseId: profile.governmentLicenseId,
      city: profile.city,
      location: profile.location,
      logo: profile.logo || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}`,
      specialties: profile.specialties,
      status: profile.status,
      patientCount: profile.patientCount,
      rating: profile.rating,
      bloodHealthStatus: profile.bloodHealthStatus,
      isSetupComplete: profile.isSetupComplete,
      phone: profile.phone,
      website: profile.website,
      accreditation: profile.accreditation,
      hospitalLicenseUrl: profile.hospitalLicenseUrl,
      kidneyTransplantLicenseUrl: profile.kidneyTransplantLicenseUrl,
      liverTransplantLicenseUrl: profile.liverTransplantLicenseUrl,
      heartTransplantLicenseUrl: profile.heartTransplantLicenseUrl,
      lungTransplantLicenseUrl: profile.lungTransplantLicenseUrl,
      contactPerson: profile.contactPerson,
    });
  } catch (error) {
    next(error);
  }
};

export const completeHospitalSetup = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      return next(new ApiError(401, 'Not authenticated.'));
    }

    const {
      city,
      address,
      phone,
      website,
      specialties,
      governmentLicenseId,
      hospitalLicenseUrl,
      kidneyTransplantLicenseUrl,
      liverTransplantLicenseUrl,
      heartTransplantLicenseUrl,
      lungTransplantLicenseUrl,
      contactPerson,
    } = req.body;

    if (!city || !address || !phone || !governmentLicenseId || !hospitalLicenseUrl || !contactPerson) {
      return next(new ApiError(400, 'Required profile setup information or general hospital license certificate is missing.'));
    }

    // Conditional restriction validation
    if (specialties && Array.isArray(specialties)) {
      if (specialties.includes('Kidney Transplant') && !kidneyTransplantLicenseUrl) {
        return next(new ApiError(400, 'Kidney Transplant Certification license certificate is required.'));
      }
      if (specialties.includes('Liver Transplant') && !liverTransplantLicenseUrl) {
        return next(new ApiError(400, 'Liver Transplant Certification license certificate is required.'));
      }
      if (specialties.includes('Heart Transplant') && !heartTransplantLicenseUrl) {
        return next(new ApiError(400, 'Heart Transplant Certification license certificate is required.'));
      }
      if (specialties.includes('Lung Transplant') && !lungTransplantLicenseUrl) {
        return next(new ApiError(400, 'Lung Transplant Certification license certificate is required.'));
      }
    }

    const user = await User.findById(req.user.id);
    if (!user || user.role !== 'Hospital') {
      return next(new ApiError(404, 'Hospital user not found.'));
    }

    const profile = await HospitalProfile.findOneAndUpdate(
      { userId: user._id },
      {
        $set: {
          city,
          location: address,
          phone,
          website,
          specialties: specialties || ['General'],
          governmentLicenseId,
          hospitalLicenseUrl,
          kidneyTransplantLicenseUrl: kidneyTransplantLicenseUrl || '',
          liverTransplantLicenseUrl: liverTransplantLicenseUrl || '',
          heartTransplantLicenseUrl: heartTransplantLicenseUrl || '',
          lungTransplantLicenseUrl: lungTransplantLicenseUrl || '',
          contactPerson: contactPerson || { name: '', designation: '', email: '', phone: '' },
          isSetupComplete: true,
          status: 'Pending', // pending admin audit verification
        },
      },
      { new: true, upsert: true }
    );

    res.status(200).json({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      licenseId: profile.licenseId,
      governmentLicenseId: profile.governmentLicenseId,
      city: profile.city,
      location: profile.location,
      logo: profile.logo,
      specialties: profile.specialties,
      status: profile.status,
      patientCount: profile.patientCount,
      rating: profile.rating,
      bloodHealthStatus: profile.bloodHealthStatus,
      isSetupComplete: profile.isSetupComplete,
      phone: profile.phone,
      website: profile.website,
      accreditation: profile.accreditation,
      hospitalLicenseUrl: profile.hospitalLicenseUrl,
      kidneyTransplantLicenseUrl: profile.kidneyTransplantLicenseUrl,
      liverTransplantLicenseUrl: profile.liverTransplantLicenseUrl,
      heartTransplantLicenseUrl: profile.heartTransplantLicenseUrl,
      lungTransplantLicenseUrl: profile.lungTransplantLicenseUrl,
      contactPerson: profile.contactPerson,
    });
  } catch (error) {
    next(error);
  }
};
