import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { DonorProfile } from '../models/DonorProfile';
import { HospitalProfile } from '../models/HospitalProfile';
import { ApiError } from '../middlewares/error.middleware';
import { AuthRequest } from '../middlewares/auth.middleware';

const generateToken = (userId: string, email: string, role: string): string => {
  const secret = process.env.JWT_SECRET || 'dev_jwt_secret_key_change_in_production_123456789';
  const expires = (process.env.JWT_EXPIRES_IN || '7d') as any;
  return jwt.sign({ id: userId, email, role }, secret, { expiresIn: expires });
};

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { name, email, password, role } = req.body;

  try {
    if (!name || !email || !password || !role) {
      return next(new ApiError(400, 'Name, email, password, and role are required.'));
    }

    const emailLower = email.toLowerCase().trim();

    const existingUser = await User.findOne({ email: emailLower });
    if (existingUser) {
      return next(new ApiError(400, 'Email address is already registered.'));
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email: emailLower,
      password: hashedPassword,
      role,
    });

    const token = generateToken(user._id.toString(), user.email, user.role);

    // Set token in HTTP-only cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return next(new ApiError(400, 'Email and password are required.'));
    }

    const emailLower = email.toLowerCase().trim();

    const user = await User.findOne({ email: emailLower });
    if (!user) {
      return next(new ApiError(401, 'Invalid email or password.'));
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return next(new ApiError(401, 'Invalid email or password.'));
    }

    const token = generateToken(user._id.toString(), user.email, user.role);

    // Set token in HTTP-only cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const me = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      return next(new ApiError(401, 'Not authenticated.'));
    }

    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return next(new ApiError(404, 'User not found.'));
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    res.clearCookie('token');
    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const getInviteDetails = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { token } = req.query;

  try {
    if (!token) {
      return next(new ApiError(400, 'Invitation token is required.'));
    }

    let profile: any = await DonorProfile.findOne({ inviteToken: token });
    if (!profile) {
      profile = await HospitalProfile.findOne({ inviteToken: token });
    }

    if (!profile) {
      return next(new ApiError(400, 'Invalid invitation token.'));
    }

    if (!profile.inviteTokenExpires || new Date() > profile.inviteTokenExpires) {
      return next(new ApiError(400, 'Invitation token has expired.'));
    }

    const user = await User.findById(profile.userId);
    if (!user) {
      return next(new ApiError(404, 'Associated user account not found.'));
    }

    res.status(200).json({
      success: true,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    next(error);
  }
};

export const completeSetup = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { token, password } = req.body;

  try {
    if (!token || !password) {
      return next(new ApiError(400, 'Token and password are required.'));
    }

    let profile: any = await DonorProfile.findOne({ inviteToken: token });
    let isHospital = false;

    if (!profile) {
      profile = await HospitalProfile.findOne({ inviteToken: token });
      if (profile) {
        isHospital = true;
      }
    }

    if (!profile) {
      return next(new ApiError(400, 'Invalid invitation token.'));
    }

    if (!profile.inviteTokenExpires || new Date() > profile.inviteTokenExpires) {
      return next(new ApiError(400, 'Invitation token has expired.'));
    }

    const user = await User.findById(profile.userId);
    if (!user) {
      return next(new ApiError(404, 'Associated user account not found.'));
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user.password = hashedPassword;
    await user.save();

    if (isHospital) {
      // Hospitals remain 'Pending' until they complete setup wizard
      profile.inviteToken = null;
      profile.inviteTokenExpires = null;
    } else {
      profile.status = 'Available';
      profile.inviteToken = null;
      profile.inviteTokenExpires = null;
    }
    await profile.save();

    const jwtToken = generateToken(user._id.toString(), user.email, user.role);

    res.cookie('token', jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      message: 'Account setup completed successfully.',
      token: jwtToken,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};
