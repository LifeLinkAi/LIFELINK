import { Response, NextFunction } from 'express';
import { Request as RequestModel } from '../models/Request';
import { DonorProfile } from '../models/DonorProfile';
import { DonorResponse } from '../models/DonorResponse';
import { DonationRecord } from '../models/DonationRecord';
import { User } from '../models/User';
import { ApiError } from '../middlewares/error.middleware';
import { AuthRequest } from '../middlewares/auth.middleware';
import { sendMail } from '../services/notifications/email.service';
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

    const filter: Record<string, any> = {};
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
 *   - Creates/updates DonorResponse
 *   - Creates a DonationRecord (status: Pending)
 *   - Sends email notification to request originator (fire-and-forget)
 */
export const respondToRequest = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) return next(new ApiError(401, 'Not authenticated.'));

    const { id } = req.params;
    const { action } = req.body;

    if (!['ACCEPTED', 'DECLINED'].includes(action)) {
      return next(new ApiError(400, "action must be 'ACCEPTED' or 'DECLINED'."));
    }

    const request = await RequestModel.findById(id).lean();
    if (!request) return next(new ApiError(404, 'Request not found.'));

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
      // Fetch donor profile for blood type
      const profile = await DonorProfile.findOne({ userId: req.user.id });
      const donorUser = await User.findById(req.user.id).select('name email');

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

      // Fire-and-forget email to the request originator
      if ((request as any).requestedBy) {
        User.findById((request as any).requestedBy)
          .select('name email')
          .then((requester) => {
            if (!requester?.email) return;
            sendMail({
              to: requester.email,
              subject: 'LifeLink — A Donor Has Accepted Your Request',
              html: `
                <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px;border:1px solid #e2e8f0;border-radius:12px;">
                  <h2 style="color:#123e20;margin-top:0;">Donation Request Accepted ✓</h2>
                  <p>Hello <strong>${requester.name}</strong>,</p>
                  <p>
                    Good news — donor <strong>${donorUser?.name ?? 'A donor'}</strong> has accepted your
                    <strong>${(request as any).type}</strong> request for 
                    <strong>${(request as any).bloodGroup}</strong> at
                    <strong>${(request as any).facility ?? 'your facility'}</strong>.
                  </p>
                  <p style="color:#64748b;font-size:12px;margin-top:24px;border-top:1px solid #e2e8f0;padding-top:12px;">
                    Request ID: ${id} · LifeLink Coordination Network
                  </p>
                </div>
              `,
            }).catch((err: Error) => {
              logger.error(`Failed to send acceptance email: ${err.message}`);
            });
          })
          .catch(() => {});
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
