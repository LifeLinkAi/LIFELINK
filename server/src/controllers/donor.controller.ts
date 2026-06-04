import { Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import { User } from '../models/User';
import { DonorProfile } from '../models/DonorProfile';
import { ApiError } from '../middlewares/error.middleware';
import { AuthRequest } from '../middlewares/auth.middleware';

export const getDonors = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const donors = await User.find({ role: 'Donor' }).sort({ createdAt: -1 });
    const result = [];
    for (const user of donors) {
      let profile = await DonorProfile.findOne({ userId: user._id });
      if (!profile) {
        profile = await DonorProfile.create({
          userId: user._id,
          avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(user.name)}`,
        });
      }
      result.push({
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        location: profile.location,
        bloodType: profile.bloodType,
        tier: profile.tier,
        status: profile.status,
        avatar: profile.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(user.name)}`,
        phone: profile.phone,
        lastDonation: profile.lastDonation,
        totalDonated: profile.totalDonated,
        details: profile.details,
      });
    }
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const createDonor = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {
      name,
      email,
      password,
      location,
      bloodType,
      tier,
      status,
      phone,
      lastDonation,
      totalDonated,
      details,
      avatar,
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
    const pass = password || 'donor1234';
    const hashedPassword = await bcrypt.hash(pass, salt);

    const user = await User.create({
      name,
      email: emailLower,
      password: hashedPassword,
      role: 'Donor',
    });

    const profile = await DonorProfile.create({
      userId: user._id,
      location: location || '',
      bloodType: bloodType || 'O-',
      tier: tier || 'Bronze',
      status: status || 'Pending',
      phone: phone || '',
      lastDonation: lastDonation || 'N/A',
      totalDonated: totalDonated || '0 Liters',
      details: details || '',
      avatar: avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name)}`,
    });

    res.status(201).json({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      location: profile.location,
      bloodType: profile.bloodType,
      tier: profile.tier,
      status: profile.status,
      avatar: profile.avatar,
      phone: profile.phone,
      lastDonation: profile.lastDonation,
      totalDonated: profile.totalDonated,
      details: profile.details,
    });
  } catch (error) {
    next(error);
  }
};

export const createDonorBulk = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { donors } = req.body;
    if (!donors || !Array.isArray(donors)) {
      return next(new ApiError(400, 'donors array is required for bulk operation.'));
    }

    const results = [];
    const salt = await bcrypt.genSalt(10);
    const defaultHashedPassword = await bcrypt.hash('donor1234', salt);

    for (const donorData of donors) {
      const {
        name,
        email,
        location,
        bloodType,
        tier,
        status,
        phone,
        lastDonation,
        totalDonated,
        details,
        avatar,
      } = donorData;

      if (!name || !email) continue;
      const emailLower = email.toLowerCase().trim();

      const existingUser = await User.findOne({ email: emailLower });
      if (existingUser) continue;

      const user = await User.create({
        name,
        email: emailLower,
        password: defaultHashedPassword,
        role: 'Donor',
      });

      const profile = await DonorProfile.create({
        userId: user._id,
        location: location || '',
        bloodType: bloodType || 'O-',
        tier: tier || 'Bronze',
        status: status || 'Pending',
        phone: phone || '',
        lastDonation: lastDonation || 'N/A',
        totalDonated: totalDonated || '0 Liters',
        details: details || '',
        avatar: avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name)}`,
      });

      results.push({
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        location: profile.location,
        bloodType: profile.bloodType,
        tier: profile.tier,
        status: profile.status,
        avatar: profile.avatar,
        phone: profile.phone,
        lastDonation: profile.lastDonation,
        totalDonated: profile.totalDonated,
        details: profile.details,
      });
    }

    res.status(201).json({ success: true, count: results.length, data: results });
  } catch (error) {
    next(error);
  }
};

export const updateDonor = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, email, ...profileFields } = req.body;

    const user = await User.findById(id);
    if (!user || user.role !== 'Donor') {
      return next(new ApiError(404, 'Donor not found.'));
    }

    if (name) user.name = name;
    if (email) user.email = email.toLowerCase().trim();
    await user.save();

    const profile = await DonorProfile.findOneAndUpdate(
      { userId: user._id },
      { $set: profileFields },
      { new: true, upsert: true }
    );

    res.status(200).json({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      location: profile.location,
      bloodType: profile.bloodType,
      tier: profile.tier,
      status: profile.status,
      avatar: profile.avatar,
      phone: profile.phone,
      lastDonation: profile.lastDonation,
      totalDonated: profile.totalDonated,
      details: profile.details,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteDonor = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user || user.role !== 'Donor') {
      return next(new ApiError(404, 'Donor not found.'));
    }

    await User.findByIdAndDelete(id);
    await DonorProfile.findOneAndDelete({ userId: id });

    res.status(200).json({ success: true, message: 'Donor deleted successfully.' });
  } catch (error) {
    next(error);
  }
};
