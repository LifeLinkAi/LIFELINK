import nodemailer from 'nodemailer';
import { logger } from '../../utils/logger';

// Create a transporter using SMTP settings from server .env config
const createTransporter = () => {
  const port = parseInt(process.env.SMTP_PORT || '2525', 10);
  const isSecure = port === 465;

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
    port: port,
    secure: isSecure,
    auth: {
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || '',
    },
  });
};

/**
 * Core sendMail function for reusability across the entire project
 */
export const sendMail = async (options: {
  to: string;
  subject: string;
  text?: string;
  html: string;
}): Promise<void> => {
  try {
    const transporter = createTransporter();
    const fromEmail = process.env.EMAIL_FROM || 'no-reply@lifelink.org';

    const mailOptions = {
      from: `"LifeLink Network" <${fromEmail}>`,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    };

    const info = await transporter.sendMail(mailOptions);
    logger.info(`📧 Email successfully sent to ${options.to}. Message ID: ${info.messageId}`);
  } catch (error: any) {
    logger.error(`❌ Failed to send email to ${options.to}: ${error.message}`);
    throw error;
  }
};

/**
 * Sends a registration invitation email to a newly added donor
 */
export const sendDonorInviteEmail = async (
  toEmail: string,
  donorName: string,
  inviteUrl: string
): Promise<void> => {
  const htmlContent = `
    <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #fcfcf9;">
      <h2 style="color: #123e20; font-family: 'Syne', sans-serif; border-bottom: 2px solid #EFF2EE; padding-bottom: 12px; margin-top: 0;">Welcome to LifeLink!</h2>
      <p style="color: #334155; font-size: 16px; line-height: 1.6;">Hello <strong>${donorName}</strong>,</p>
      <p style="color: #334155; font-size: 14px; line-height: 1.6;">
        You have been pre-registered on the LifeLink Coordination Network as a blood/organ donor by our system administrator.
      </p>
      <p style="color: #334155; font-size: 14px; line-height: 1.6; margin-bottom: 24px;">
        Please complete your account setup by setting your password using the link below:
      </p>
      <div style="text-align: center; margin-bottom: 28px;">
        <a href="${inviteUrl}" style="background-color: #123e20; color: #ffffff; padding: 12px 28px; font-weight: bold; border-radius: 8px; text-decoration: none; display: inline-block; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          Set Up Password & Activate Account
        </a>
      </div>
      <p style="color: #64748b; font-size: 12px; line-height: 1.5;">
        If the button above does not work, copy and paste the link below into your browser:<br/>
        <a href="${inviteUrl}" style="color: #2563eb;">${inviteUrl}</a>
      </p>
      <p style="color: #64748b; font-size: 12px; margin-top: 16px; border-top: 1px solid #EFF2EE; padding-top: 12px; margin-bottom: 0;">
        This invitation link is secure and will expire in 7 days.
      </p>
    </div>
  `;

  await sendMail({
    to: toEmail,
    subject: 'Complete Your LifeLink Donor Registration',
    html: htmlContent,
  });
};

/**
 * Sends a registration invitation email to a newly added hospital node
 */
export const sendHospitalInviteEmail = async (
  toEmail: string,
  hospitalName: string,
  inviteUrl: string
): Promise<void> => {
  const htmlContent = `
    <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #fcfcf9;">
      <h2 style="color: #123e20; font-family: 'Syne', sans-serif; border-bottom: 2px solid #EFF2EE; padding-bottom: 12px; margin-top: 0;">Institutional Onboarding Invitation</h2>
      <p style="color: #334155; font-size: 16px; line-height: 1.6;">Hello,</p>
      <p style="color: #334155; font-size: 14px; line-height: 1.6;">
        Your facility, <strong>${hospitalName}</strong>, has been pre-registered on the LifeLink Network by the system administrator.
      </p>
      <p style="color: #334155; font-size: 14px; line-height: 1.6; margin-bottom: 24px;">
        To activate your institutional node and access the matching and allocation dashboard, please complete your password setup using the link below:
      </p>
      <div style="text-align: center; margin-bottom: 28px;">
        <a href="${inviteUrl}" style="background-color: #123e20; color: #ffffff; padding: 12px 28px; font-weight: bold; border-radius: 8px; text-decoration: none; display: inline-block; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          Set Up Credentials & Onboard
        </a>
      </div>
      <p style="color: #64748b; font-size: 12px; line-height: 1.5;">
        If the button above does not work, copy and paste the link below into your browser:<br/>
        <a href="${inviteUrl}" style="color: #2563eb;">${inviteUrl}</a>
      </p>
      <p style="color: #64748b; font-size: 12px; margin-top: 16px; border-top: 1px solid #EFF2EE; padding-top: 12px; margin-bottom: 0;">
        This activation link is secure and will expire in 48 hours.
      </p>
    </div>
  `;

  await sendMail({
    to: toEmail,
    subject: 'Activate Your LIFELINK Hospital Node',
    html: htmlContent,
  });
};
