import { Request as DonationRequest } from '../../models/Request';
import { DonorProfile } from '../../models/DonorProfile';
import { User } from '../../models/User';
import { WellnessLog } from '../../models/WellnessLog';
import { sendWellnessCheckupReminderEmail } from './email.service';
import { notify } from './notify.service';
import { logger } from '../../utils/logger';

/**
 * Checks all living donors with successful organ transplants and determines if they are due for their next check-up.
 * Sends check-up reminder emails sequentially (one by one) when due dates are reached.
 */
export const checkWellnessReminders = async (): Promise<void> => {
  try {
    logger.info('⏳ Running living donor wellness check-up reminder scan...');

    // Find all successful organ transplant requests
    const successfulRequests = await DonationRequest.find({
      status: 'TRANSPLANT_SUCCESSFUL',
      type: 'Organ'
    });

    logger.info(`🔍 Found ${successfulRequests.length} successful organ transplant procedures to evaluate.`);

    for (const reqDoc of successfulRequests) {
      if (!reqDoc.acceptedDonorId) continue;
      if (!reqDoc.surgicalOutcome?.surgeryCompletedAt) continue;

      const profile = await DonorProfile.findById(reqDoc.acceptedDonorId);
      if (!profile) continue;

      const user = await User.findById(profile.userId);
      if (!user || !user.email) continue;

      // Find all logged wellness logs for this specific transplant request
      const logs = await WellnessLog.find({
        donorId: profile._id,
        requestId: reqDoc._id
      });

      const loggedMilestones = new Set(logs.map(log => log.milestone));

      // Defined checkup milestones with sequence, target offset (days), and names
      const milestones: { key: '1_MONTH' | '6_MONTH' | '1_YEAR' | '2_YEAR'; offsetDays: number; name: string }[] = [
        { key: '1_MONTH', offsetDays: 30, name: '1 Month Check-up' },
        { key: '6_MONTH', offsetDays: 180, name: '6 Month Check-up' },
        { key: '1_YEAR', offsetDays: 365, name: '1 Year Assessment' },
        { key: '2_YEAR', offsetDays: 730, name: '2 Year Assessment' },
      ];

      // Find the first unlogged milestone in chronological order (enforces "one by one" progression)
      const nextMilestone = milestones.find(m => !loggedMilestones.has(m.key));
      if (!nextMilestone) {
        // All milestones logged for this donor
        continue;
      }

      // Calculate exact target due date based on surgery completion date
      const surgeryDate = new Date(reqDoc.surgicalOutcome.surgeryCompletedAt);
      const targetDate = new Date(surgeryDate.getTime() + nextMilestone.offsetDays * 24 * 60 * 60 * 1000);
      const today = new Date();

      if (today >= targetDate) {
        // Check if we already sent a reminder email for this specific milestone
        const sentReminders = (profile as any).sentWellnessReminders || [];
        if (!sentReminders.includes(nextMilestone.key)) {
          const targetDateStr = targetDate.toLocaleDateString(undefined, { dateStyle: 'long' });
          logger.info(`📧 Sending ${nextMilestone.name} reminder email to donor: ${user.email} (Target: ${targetDateStr})`);

          try {
            await sendWellnessCheckupReminderEmail(
              user.email,
              user.name || 'Donor',
              nextMilestone.name,
              targetDateStr
            );

            await notify({
              recipientId: profile.userId.toString(),
              recipientRole: 'Donor',
              type: 'wellness_reminder',
              title: 'Wellness Check-up Due',
              message: `Your ${nextMilestone.name} is due. Please log your metrics.`,
              priority: 'high',
              actionUrl: `/donor/donate-organ`,
            });

            // Record reminder as sent to prevent duplicate alerts
            await DonorProfile.updateOne(
              { _id: profile._id },
              { $addToSet: { sentWellnessReminders: nextMilestone.key } }
            );

            logger.info(`✅ Wellness reminder recorded for donor ID: ${profile._id}, milestone: ${nextMilestone.key}`);
          } catch (mailErr: any) {
            logger.error(`❌ Failed to send reminder email to ${user.email}: ${mailErr.message}`);
          }
        }
      }
    }
    logger.info('✅ Wellness check-up reminder scan completed.');
  } catch (error: any) {
    logger.error(`❌ Error in checkWellnessReminders job: ${error.message}`);
  }
};

/**
 * Starts the automated check-up scheduler.
 * Runs on startup (after a 10s boot cooldown) and then periodically every 24 hours.
 */
export const startWellnessScheduler = (): void => {
  logger.info('⚙️ Starting Living Donor Wellness Reminder Scheduler service...');

  // Immediate run-hook (after 10s delay to let server initialize)
  setTimeout(() => {
    logger.info('🚀 Triggering initial startup wellness reminder check...');
    checkWellnessReminders().catch(err => logger.error(`Initial wellness check failed: ${err.message}`));
  }, 10000);

  // Daily interval check (every 24 hours)
  setInterval(() => {
    logger.info('🚀 Triggering periodic daily wellness reminder check...');
    checkWellnessReminders().catch(err => logger.error(`Periodic wellness check failed: ${err.message}`));
  }, 24 * 60 * 60 * 1000);
};
