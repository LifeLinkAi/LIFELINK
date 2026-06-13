import { logger } from '../../utils/logger';

/**
 * Core sendMail function for reusability across the entire project using SendGrid API
 */
export const sendMail = async (options: {
  to: string;
  subject: string;
  text?: string;
  html: string;
}): Promise<void> => {
  try {
    const apiKey = process.env.SENDGRID_API_KEY;
    if (!apiKey) {
      throw new Error('SENDGRID_API_KEY environment variable is not defined.');
    }

    const fromEmail = process.env.EMAIL_FROM || 'lifelinkai4@gmail.com';

    // Send HTTP POST request to SendGrid API
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: [{ email: options.to }],
          },
        ],
        from: { 
          email: fromEmail.trim(), 
          name: 'LifeLink Network' 
        },
        subject: options.subject,
        content: [
          {
            type: 'text/html',
            value: options.html,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`SendGrid API error (${response.status}): ${errorText}`);
    }

    logger.info(`📧 Email successfully sent to ${options.to} via SendGrid API`);
  } catch (error: any) {
    logger.error(`❌ Failed to send email to ${options.to} via SendGrid: ${error.message}`);
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

/**
 * Sends an urgent donor notification when a new patient request matches a donor.
 */
export const sendDonorRequestNotification = async (
  toEmail: string,
  donorName: string,
  requestDetails: { urgency?: string; type?: string; bloodGroup?: string; organType?: string; facility?: string; patientName?: string },
  inviteUrl: string
): Promise<void> => {
  const subject = `URGENT: New ${requestDetails.type || 'Donation'} Request`;
  const htmlContent = `
    <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #fee2e2; border-radius: 12px; background-color: #fff8f8;">
      <h2 style="color: #7f1d1d; font-family: 'Syne', sans-serif; margin-top: 0;">URGENT: New ${requestDetails.type || 'Donation'} Request</h2>
      <p style="color: #334155; font-size: 16px; line-height: 1.6;">Hello <strong>${donorName}</strong>,</p>
      <p style="color: #334155; font-size: 14px; line-height: 1.6;">
        A new ${requestDetails.type || 'donation'} request requires immediate attention. Below are the details:
      </p>
      <ul style="color: #334155; font-size: 14px; line-height: 1.6;">
        ${requestDetails.patientName ? `<li><strong>Patient:</strong> ${requestDetails.patientName}</li>` : ''}
        ${requestDetails.facility ? `<li><strong>Facility:</strong> ${requestDetails.facility}</li>` : ''}
        ${requestDetails.urgency ? `<li><strong>Urgency:</strong> ${requestDetails.urgency}</li>` : ''}
        ${requestDetails.bloodGroup ? `<li><strong>Blood Group:</strong> ${requestDetails.bloodGroup}</li>` : ''}
        ${requestDetails.organType ? `<li><strong>Organ:</strong> ${requestDetails.organType}</li>` : ''}
      </ul>
      <div style="text-align: center; margin: 18px 0;">
        <a href="${inviteUrl}" style="background-color: #7f1d1d; color: #ffffff; padding: 12px 22px; font-weight: bold; border-radius: 8px; text-decoration: none; display: inline-block;">
          View Request & Respond
        </a>
      </div>
      <p style="color: #64748b; font-size: 12px;">If the button above does not work, copy and paste the link below into your browser:<br/><a href="${inviteUrl}" style="color: #2563eb;">${inviteUrl}</a></p>
      <p style="color: #64748b; font-size: 12px; margin-top: 12px; border-top: 1px solid #fee2e2; padding-top: 12px;">This invitation link will expire in 24 hours.</p>
    </div>
  `;

  await sendMail({ to: toEmail, subject, html: htmlContent });
};
