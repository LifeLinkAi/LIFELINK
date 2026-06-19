import { Response, NextFunction } from 'express';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
// pdf-parse is lazy-required inside uploadCertificate to avoid the known startup
// crash where the library accesses ./test/data/* at import time in ts-node-dev.
import { User } from '../models/User';
import { DonorProfile } from '../models/DonorProfile';
import { ApiError } from '../middlewares/error.middleware';
import { AuthRequest } from '../middlewares/auth.middleware';
import { sendDonorInviteEmail } from '../services/notifications/email.service';
import { logger } from '../utils/logger';

export const getDonors = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const donors = await User.find({ role: 'Donor' }).sort({ createdAt: -1 });
    const result = [];
    for (const user of donors) {
      let profile = await DonorProfile.findOne({ userId: user._id });
      if (!profile) {
        // Use findOneAndUpdate with setDefaultsOnInsert:false to prevent
        // Mongoose from inserting coordinates:[] which breaks the 2dsphere index
        profile = await DonorProfile.findOneAndUpdate(
          { userId: user._id },
          { $set: { avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(user.name)}` } },
          { new: true, upsert: true, setDefaultsOnInsert: false }
        ) as NonNullable<typeof profile>;
      }
      result.push({
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        location: (profile! as any).address ?? '',
        bloodType: profile!.bloodType,
        tier: profile!.tier,
        status: profile!.status,
        avatar: profile!.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(user.name)}`,
        phone: profile!.phone,
        lastDonation: profile!.lastDonation,
        totalDonated: profile!.totalDonated,
        details: profile!.details,
        isSetupComplete: profile!.isSetupComplete,
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
    // Generate secure random password initially so standard logins are blocked
    const tempPass = crypto.randomBytes(16).toString('hex');
    const hashedPassword = await bcrypt.hash(tempPass, salt);

    const user = await User.create({
      name,
      email: emailLower,
      password: hashedPassword,
      role: 'Donor',
    });

    // Generate invitation token and 7 days expiration
    const inviteToken = crypto.randomBytes(32).toString('hex');
    const inviteTokenExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // MERGED: use findOneAndUpdate+upsert with setDefaultsOnInsert:false to prevent
    // Mongoose from inserting coordinates:[] which breaks any geo index.
    const profile = await DonorProfile.findOneAndUpdate(
      { userId: user._id },
      {
        $set: {
          location: '',
          bloodType: 'O-',
          tier: 'Bronze',
          status: 'Pending',
          phone: '',
          lastDonation: 'N/A',
          totalDonated: '0 Liters',
          details: 'Registered donor. Setup pending.',
          avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name)}`,
          inviteToken,
          inviteTokenExpires,
          isSetupComplete: false,
        },
      },
      { new: true, upsert: true, setDefaultsOnInsert: false }
    );
    if (!profile) throw new Error('Failed to create donor profile');

    // Send donor invite email asynchronously
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
    const inviteUrl = `${clientUrl.replace(/\/$/, '')}/register?token=${inviteToken}`;

    try {
      await sendDonorInviteEmail(emailLower, name, inviteUrl);
    } catch (err) {
      console.error(`Error sending invite email to ${emailLower}:`, err);
    }

    res.status(201).json({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      location: (profile as any).address ?? '',
      bloodType: profile.bloodType,
      tier: profile.tier,
      status: profile.status,
      avatar: profile.avatar,
      phone: profile.phone,
      lastDonation: profile.lastDonation,
      totalDonated: profile.totalDonated,
      details: profile.details,
      isSetupComplete: profile.isSetupComplete,
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

      // MERGED: use findOneAndUpdate+upsert with setDefaultsOnInsert:false to prevent
      // Mongoose from inserting coordinates:[] which breaks any geo index.
      const profile = await DonorProfile.findOneAndUpdate(
        { userId: user._id },
        {
          $set: {
            location: location || '',
            bloodType: bloodType || 'O-',
            tier: tier || 'Bronze',
            status: status || 'Pending',
            phone: phone || '',
            lastDonation: lastDonation || 'N/A',
            totalDonated: totalDonated || '0 Liters',
            details: details || '',
            avatar: avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name)}`,
          },
        },
        { new: true, upsert: true, setDefaultsOnInsert: false }
      );
      if (!profile) continue;

      results.push({
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        location: (profile as any).address ?? '',
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
      { new: true, upsert: true, setDefaultsOnInsert: false }
    );

    res.status(200).json({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      location: (profile as any).address ?? '',
      bloodType: profile.bloodType,
      tier: profile.tier,
      status: profile.status,
      avatar: profile.avatar,
      phone: profile.phone,
      lastDonation: profile.lastDonation,
      totalDonated: profile.totalDonated,
      details: profile.details,
      isSetupComplete: profile.isSetupComplete,
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

export const getMeProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      return next(new ApiError(401, 'Not authenticated.'));
    }

    const user = await User.findById(req.user.id).select('-password');
    if (!user || user.role !== 'Donor') {
      return next(new ApiError(404, 'Donor user not found.'));
    }

    let profile = await DonorProfile.findOne({ userId: user._id });
    if (!profile) {
      // Use findOneAndUpdate with setDefaultsOnInsert:false to prevent
      // Mongoose from inserting coordinates:[] which breaks the 2dsphere index
      profile = await DonorProfile.findOneAndUpdate(
        { userId: user._id },
        { $set: { avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(user.name)}` } },
        { new: true, upsert: true, setDefaultsOnInsert: false }
      ) as NonNullable<typeof profile>;
    }

    res.status(200).json({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      // MERGED: donor branch provides location string + coordinates array;
      // origin branch had location:''. Both preserved here.
      location: (profile! as any).address ?? '',
      coordinates: (profile! as any).location?.coordinates || [],
      bloodType: profile!.bloodType,
      tier: profile!.tier,
      status: profile!.status,
      isAvailable: profile!.isAvailable ?? true,
      avatar: profile!.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(user.name)}`,
      phone: profile!.phone,
      lastDonation: profile!.lastDonation,
      totalDonated: profile!.totalDonated,
      details: profile!.details,
      organsWillingToDonate: profile!.organsWillingToDonate ?? [],
      isSetupComplete: profile!.isSetupComplete,
    });
  } catch (error) {
    next(error);
  }
};

export const completeDonorSetup = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      return next(new ApiError(401, 'Not authenticated.'));
    }

    const { bloodType, location, coordinates, phone } = req.body;
    if (!bloodType || !phone) {
      return next(new ApiError(400, 'Blood type and phone number are required.'));
    }

    const user = await User.findById(req.user.id);
    if (!user || user.role !== 'Donor') {
      return next(new ApiError(404, 'Donor user not found.'));
    }

    const hasValidCoords = Array.isArray(coordinates) &&
      coordinates.length === 2 &&
      typeof coordinates[0] === 'number' && typeof coordinates[1] === 'number' &&
      coordinates[0] >= -180 && coordinates[0] <= 180 &&
      coordinates[1] >= -90 && coordinates[1] <= 90;

    const updateFields: Record<string, any> = {
      bloodType,
      phone,
      isSetupComplete: true,
      status: 'Available',
    };
    if (location !== undefined) updateFields.address = location;
    if (hasValidCoords) {
      updateFields.location = {
        type: 'Point',
        coordinates: coordinates
      };
    }

    const profile = await DonorProfile.findOneAndUpdate(
      { userId: user._id },
      { $set: updateFields },
      { new: true, upsert: true, setDefaultsOnInsert: false }
    );

    res.status(200).json({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      location: (profile as any).address ?? '',
      coordinates: (profile as any).location?.coordinates || [],
      bloodType: profile.bloodType,
      tier: profile.tier,
      status: profile.status,
      avatar: profile.avatar,
      phone: profile.phone,
      lastDonation: profile.lastDonation,
      totalDonated: profile.totalDonated,
      details: profile.details,
      isSetupComplete: profile.isSetupComplete,
    });
  } catch (error) {
    next(error);
  }
};

export const bulkInviteDonors = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { users } = req.body;
    if (!users || !Array.isArray(users)) {
      return next(new ApiError(400, 'users array is required for bulk invite operations.'));
    }

    const invited = [];
    const skipped = [];

    const salt = await bcrypt.genSalt(10);

    for (const u of users) {
      const { name, email } = u;
      if (!name || !email) continue;
      const emailLower = email.toLowerCase().trim();

      const existingUser = await User.findOne({ email: emailLower });
      if (existingUser) {
        skipped.push({ name, email: emailLower, reason: 'Already registered.' });
        continue;
      }

      // Generate random secure password
      const tempPass = crypto.randomBytes(16).toString('hex');
      const hashedPassword = await bcrypt.hash(tempPass, salt);

      const user = await User.create({
        name,
        email: emailLower,
        password: hashedPassword,
        role: 'Donor',
      });

      const inviteToken = crypto.randomBytes(32).toString('hex');
      const inviteTokenExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

      // MERGED: use findOneAndUpdate+upsert with setDefaultsOnInsert:false
      await DonorProfile.findOneAndUpdate(
        { userId: user._id },
        {
          $set: {
            bloodType: 'O-',
            tier: 'Bronze',
            status: 'Pending',
            phone: '',
            lastDonation: 'N/A',
            totalDonated: '0 Liters',
            details: 'Registered donor. Setup pending.',
            avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name)}`,
            inviteToken,
            inviteTokenExpires,
            isSetupComplete: false,
          },
        },
        { upsert: true, setDefaultsOnInsert: false }
      );

      const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
      const inviteUrl = `${clientUrl.replace(/\/$/, '')}/register?token=${inviteToken}`;

      try {
        await sendDonorInviteEmail(emailLower, name, inviteUrl);
      } catch (err: any) {
        logger.error(`Error sending bulk invite email to ${emailLower}: ${err.message}`);
      }

      invited.push({ id: user._id.toString(), name, email: emailLower });
    }

    res.status(200).json({
      success: true,
      invitedCount: invited.length,
      skippedCount: skipped.length,
      invited,
      skipped,
    });
  } catch (error) {
    next(error);
  }
};

// ── Helpers for certificate date extraction ──────────────────────────────────

const MONTH_NAMES: Record<string, number> = {
  january: 1, february: 2, march: 3, april: 4, may: 5, june: 6,
  july: 7, august: 8, september: 9, october: 10, november: 11, december: 12,
  jan: 1, feb: 2, mar: 3, apr: 4, jun: 6, jul: 7, aug: 8,
  sep: 9, oct: 10, nov: 11, dec: 12,
};

const MONTH_DISPLAY = [
  '', 'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function isValidDate(day: number, month: number, year: number): boolean {
  if (month < 1 || month > 12 || day < 1 || year < 1900 || year > 2100) return false;
  const d = new Date(year, month - 1, day);
  return d.getFullYear() === year && d.getMonth() === month - 1 && d.getDate() === day;
}

function normalizeDate(day: number, month: number, year: number): string {
  return `${day} ${MONTH_DISPLAY[month]} ${year}`;
}

/**
 * Extract the most likely donation date from raw PDF text.
 * Priority:
 *   1. Date appearing near a donation keyword
 *   2. Latest valid date found anywhere in the document
 */
function extractDonationDate(text: string): string | null {
  // Collapse whitespace variants so multi-space PDFs don't break patterns
  const normalized = text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/[ \t]+/g, ' ');  // collapse multiple spaces → single space

  interface DateCandidate {
    day: number; month: number; year: number;
    index: number; priority: number;
  }

  const candidates: DateCandidate[] = [];

  // ─── Broad donation-keyword patterns ─────────────────────────────────────
  const DONATION_KEYWORDS =
    /(?:last\s+donation|donation\s+date|date\s+of\s+donation|donated\s+on|donated\s+date|certificate\s+date|blood\s+donation\s+date|donation:|date:|on\s*:)/i;

  // ─── Date format patterns ──────────────────────────────────────────────────
  // Each entry: [regex, parser fn returning {day,month,year} or null]
  type ParseResult = { day: number; month: number; year: number } | null;

  const FORMATS: Array<{ re: RegExp; parse: (m: RegExpExecArray) => ParseResult }> = [
    // 1. DD/MM/YYYY  DD-MM-YYYY  DD.MM.YYYY
    {
      re: /\b(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})\b/g,
      parse: (m) => ({ day: +m[1], month: +m[2], year: +m[3] }),
    },
    // 2. MM/DD/YYYY  (try both interpretations, valid one wins)
    {
      re: /\b(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})\b/g,
      parse: (m) => ({ day: +m[2], month: +m[1], year: +m[3] }),  // swap day/month
    },
    // 3. YYYY-MM-DD  YYYY/MM/DD
    {
      re: /\b(\d{4})[\/\-](\d{2})[\/\-](\d{2})\b/g,
      parse: (m) => ({ day: +m[3], month: +m[2], year: +m[1] }),
    },
    // 4. DD Month YYYY  e.g. "14 March 2024" or "14 Mar 2024"
    {
      re: /\b(\d{1,2})\s+(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|oct|nov|dec)\.?\s+(\d{4})\b/gi,
      parse: (m) => ({ day: +m[1], month: MONTH_NAMES[m[2].toLowerCase()] ?? 0, year: +m[3] }),
    },
    // 5. Month DD, YYYY  e.g. "March 14, 2024" or "Mar 14 2024"
    {
      re: /\b(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|oct|nov|dec)\.?\s+(\d{1,2}),?\s+(\d{4})\b/gi,
      parse: (m) => ({ day: +m[2], month: MONTH_NAMES[m[1].toLowerCase()] ?? 0, year: +m[3] }),
    },
    // 6. DD Month YY  e.g. "14 Mar 24" (two-digit year)
    {
      re: /\b(\d{1,2})\s+(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|oct|nov|dec)\.?\s+(\d{2})\b/gi,
      parse: (m) => ({ day: +m[1], month: MONTH_NAMES[m[2].toLowerCase()] ?? 0, year: 2000 + +m[3] }),
    },
  ];

  const seen = new Set<string>();  // deduplicate identical dates

  for (const { re, parse } of FORMATS) {
    re.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = re.exec(normalized)) !== null) {
      const parsed = parse(match);
      if (!parsed) continue;
      const { day, month, year } = parsed;
      if (!isValidDate(day, month, year)) continue;

      const key = `${day}-${month}-${year}`;
      if (seen.has(key)) continue;
      seen.add(key);

      // Expanded context window: 300 chars before + 50 chars after
      const ctxBefore = normalized.slice(Math.max(0, match.index - 300), match.index);
      const ctxAfter  = normalized.slice(match.index, match.index + 50);
      const hasDonationKeyword = DONATION_KEYWORDS.test(ctxBefore) || DONATION_KEYWORDS.test(ctxAfter);

      candidates.push({
        day, month, year,
        index: match.index,
        priority: hasDonationKeyword ? 2 : 1,
      });
    }
  }

  if (candidates.length === 0) return null;

  // Sort: donation-keyword matches first (priority 2), then by date descending (latest first)
  candidates.sort((a, b) => {
    if (b.priority !== a.priority) return b.priority - a.priority;
    const aTs = new Date(a.year, a.month - 1, a.day).getTime();
    const bTs = new Date(b.year, b.month - 1, b.day).getTime();
    return bTs - aTs;
  });

  const best = candidates[0];
  return normalizeDate(best.day, best.month, best.year);
}

/**
 * Extract the blood group from raw PDF text.
 */
function extractBloodGroup(text: string): string | null {
  const normalized = text.toLowerCase().replace(/[\s_]+/g, ' ');

  // Search for explicit labels first like "blood group: A+" or "blood type: O positive"
  const labelPatterns = [
    /(?:blood\s+group|blood\s+type|group|type)\s*[:\-]?\s*\b(ab|a|b|o)\s*([+\-]|positive|negative|pos|neg)\b/i,
    /\b(ab|a|b|o)\s*(?:group|type|blood)\b/i,
  ];

  for (const pattern of labelPatterns) {
    const match = pattern.exec(normalized);
    if (match) {
      const group = match[1].toUpperCase();
      const rh = match[2].toLowerCase();
      const sign = (rh.includes('-') || rh.includes('neg')) ? '-' : '+';
      return `${group}${sign}`;
    }
  }

  // Standalone patterns e.g. "O+" or "A-" or "AB+"
  const standalonePattern = /\b(ab|a|b|o)\s*([+\-])\b/i;
  const match = standalonePattern.exec(text);
  if (match) {
    return `${match[1].toUpperCase()}${match[2]}`;
  }

  // Text based positive/negative without symbol
  const textPattern = /\b(ab|a|b|o)\s+(positive|negative|pos|neg)\b/i;
  const textMatch = textPattern.exec(normalized);
  if (textMatch) {
    const group = textMatch[1].toUpperCase();
    const rh = textMatch[2].toLowerCase();
    const sign = rh.includes('neg') ? '-' : '+';
    return `${group}${sign}`;
  }

  return null;
}

// ── uploadCertificate controller ─────────────────────────────────────────────

export const uploadCertificate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      return next(new ApiError(401, 'Not authenticated.'));
    }

    if (!req.file) {
      return next(new ApiError(400, 'No file uploaded.'));
    }

    // Validate MIME type
    if (req.file.mimetype !== 'application/pdf') {
      return next(new ApiError(400, 'Only PDF files are accepted.'));
    }

    // Validate size (10 MB)
    if (req.file.size > 10 * 1024 * 1024) {
      return next(new ApiError(400, 'File size must not exceed 10 MB.'));
    }

    // Generate unique filename: certificate_<timestamp>_<6-char-uuid-fragment>.pdf
    const uniqueSuffix = crypto.randomBytes(3).toString('hex'); // 6 hex chars
    const uniqueFilename = `certificate_${Date.now()}_${uniqueSuffix}.pdf`;
    logger.info(`Processing certificate upload: ${uniqueFilename} for donor ${req.user.id}`);

    // Parse PDF using unpdf — handles malformed XRef tables that crash pdf-parse
    let rawText = '';
    try {
      const { getDocumentProxy, extractText } = await import('unpdf');
      const pdf = await getDocumentProxy(new Uint8Array(req.file.buffer));
      const result = await extractText(pdf, { mergePages: true });
      rawText = result.text || '';
    } catch (parseErr: any) {
      logger.error(`PDF parse error for ${uniqueFilename}: ${parseErr.message}`);
      return next(new ApiError(422, 'Unable to read the PDF. The file may be corrupted or password-protected.'));
    }

    if (!rawText.trim()) {
      logger.warn(`PDF ${uniqueFilename} contained no extractable text.`);
      return next(new ApiError(422, 'The PDF contains no readable text. Please upload a text-based (non-scanned) PDF.'));
    }

    // Log a preview of the extracted text for debugging
    logger.info(`PDF text preview (first 400 chars): ${rawText.replace(/\s+/g, ' ').substring(0, 400)}`);

    // Extract donation date
    const lastDonationDate = extractDonationDate(rawText);
    if (!lastDonationDate) {
      logger.warn(`No donation date found in ${uniqueFilename}. Text sample: ${rawText.replace(/\s+/g, ' ').substring(0, 200)}`);
      return next(new ApiError(422, 'No donation date found in this certificate. Please ensure the PDF contains a date in a standard format (e.g. 14/03/2024 or 14 March 2024).'));
    }

    logger.info(`Extracted donation date "${lastDonationDate}" from ${uniqueFilename}`);

    // Extract blood group
    const extractedBloodType = extractBloodGroup(rawText);
    
    const updateQuery: Record<string, any> = { lastDonation: lastDonationDate };
    if (extractedBloodType) {
      updateQuery.bloodType = extractedBloodType;
      logger.info(`Extracted blood type "${extractedBloodType}" from ${uniqueFilename}`);
    }

    // ── Persist the extracted date and blood group to the donor's profile in MongoDB ──────────
    await DonorProfile.findOneAndUpdate(
      { userId: req.user.id },
      { $set: updateQuery },
      { new: true }
    );
    logger.info(`Saved lastDonation and bloodType update to profile for donor ${req.user.id}`);

    res.status(200).json({
      success: true,
      lastDonationDate,
      extractedBloodGroup: extractedBloodType || undefined,
    });
  } catch (error: any) {
    logger.error(`uploadCertificate unexpected error: ${error.message}`);
    next(error);
  }
};
