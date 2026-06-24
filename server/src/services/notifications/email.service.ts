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

/**
 * Sends a confirmation email when a donor logs wellness check-up metrics
 */
export const sendWellnessLoggedEmail = async (
  toEmail: string,
  donorName: string,
  milestoneName: string,
  nextCheckupName?: string,
  nextCheckupDate?: string
): Promise<void> => {
  const nextSection = nextCheckupName && nextCheckupDate
    ? `<p style="color: #334155; font-size: 14px; line-height: 1.6;">
         Your next scheduled milestone is the <strong>${nextCheckupName}</strong>, due around <strong>${nextCheckupDate}</strong>. We will send you an email reminder when it is time to log your results.
       </p>`
    : `<p style="color: #334155; font-size: 14px; line-height: 1.6;">
         You have successfully completed your 2-year post-operative wellness timeline. Thank you for your incredible life-saving contribution!
       </p>`;

  const htmlContent = `
    <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #fcfcf9;">
      <h2 style="color: #123e20; font-family: 'Syne', sans-serif; border-bottom: 2px solid #EFF2EE; padding-bottom: 12px; margin-top: 0;">Wellness Report Logged</h2>
      <p style="color: #334155; font-size: 16px; line-height: 1.6;">Hello <strong>${donorName}</strong>,</p>
      <p style="color: #334155; font-size: 14px; line-height: 1.6;">
        We have successfully received and recorded your laboratory check-up parameters for the <strong>${milestoneName}</strong>.
      </p>
      ${nextSection}
      <p style="color: #64748b; font-size: 12px; margin-top: 16px; border-top: 1px solid #EFF2EE; padding-top: 12px; margin-bottom: 0;">
        LifeLink tracks living donor wellness to ensure safety and recovery. Thank you for your altruism.
      </p>
    </div>
  `;

  await sendMail({
    to: toEmail,
    subject: `LifeLink: ${milestoneName} Logged Successfully`,
    html: htmlContent,
  });
};

/**
 * Sends a reminder email for an upcoming wellness check-up
 */
export const sendWellnessCheckupReminderEmail = async (
  toEmail: string,
  donorName: string,
  checkupName: string,
  dueDateString: string
): Promise<void> => {
  const htmlContent = `
    <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #fcfcf9;">
      <h2 style="color: #123e20; font-family: 'Syne', sans-serif; border-bottom: 2px solid #EFF2EE; padding-bottom: 12px; margin-top: 0;">Wellness Check-up Reminder</h2>
      <p style="color: #334155; font-size: 16px; line-height: 1.6;">Hello <strong>${donorName}</strong>,</p>
      <p style="color: #334155; font-size: 14px; line-height: 1.6;">
        This is a friendly reminder that your scheduled <strong>${checkupName}</strong> is approaching.
      </p>
      <p style="color: #334155; font-size: 14px; line-height: 1.6;">
        <strong>Target Date:</strong> ${dueDateString}
      </p>
      <p style="color: #334155; font-size: 14px; line-height: 1.6; margin-bottom: 24px;">
        Please visit your coordinating hospital/transplant center, get your routine blood panel completed, and log your health parameters in the LifeLink donor portal.
      </p>
      <div style="text-align: center; margin-bottom: 28px;">
        <a href="http://localhost:3000/donor/donate-organ" style="background-color: #123e20; color: #ffffff; padding: 12px 28px; font-weight: bold; border-radius: 8px; text-decoration: none; display: inline-block; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          Access Donor Portal & Log Report
        </a>
      </div>
      <p style="color: #64748b; font-size: 12px; margin-top: 16px; border-top: 1px solid #EFF2EE; padding-top: 12px; margin-bottom: 0;">
        Long-term post-operative monitoring is crucial to ensure your remaining organ adapts safely. Thank you for your incredible gift.
      </p>
    </div>
  `;

  await sendMail({
    to: toEmail,
    subject: `LifeLink Reminder: Your ${checkupName} is due`,
    html: htmlContent,
  });
};

/**
 * Sends an email to the hospital notifying that a donor has accepted the organ request match.
 */
export const sendHospitalMatchNotification = async (
  toEmail: string,
  hospitalName: string,
  donorName: string,
  organType: string,
  bloodGroup: string
): Promise<void> => {
  const portalUrl = `http://localhost:3000/hospital/matching`;
  const htmlContent = `
    <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #fcfcf9;">
      <h2 style="color: #123e20; font-family: 'Syne', sans-serif; border-bottom: 2px solid #EFF2EE; padding-bottom: 12px; margin-top: 0;">Donor Match Accepted</h2>
      <p style="color: #334155; font-size: 16px; line-height: 1.6;">Hello <strong>${hospitalName}</strong> representative,</p>
      <p style="color: #334155; font-size: 14px; line-height: 1.6;">
        Living donor <strong>${donorName}</strong> has accepted the match for your <strong>${organType}</strong> request (Blood Group: <strong>${bloodGroup}</strong>).
      </p>
      <p style="color: #334155; font-size: 14px; line-height: 1.6; margin-bottom: 24px;">
        Please review the match profile in the coordination portal and verify eligibility to initiate clinical compatibility tests.
      </p>
      <div style="text-align: center; margin-bottom: 28px;">
        <a href="${portalUrl}" style="background-color: #123e20; color: #ffffff; padding: 12px 28px; font-weight: bold; border-radius: 8px; text-decoration: none; display: inline-block; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          Review Match Profile
        </a>
      </div>
      <p style="color: #64748b; font-size: 12px; margin-top: 16px; border-top: 1px solid #EFF2EE; padding-top: 12px; margin-bottom: 0;">
        LifeLink matching engine works to connect recipients with altruistic living donors.
      </p>
    </div>
  `;

  await sendMail({
    to: toEmail,
    subject: `LifeLink: Match Accepted by Donor (${organType})`,
    html: htmlContent,
  });
};

/**
 * Sends an email to the donor when the hospital schedules clinical compatibility testing.
 */
export const sendClinicalTestingNotification = async (
  toEmail: string,
  donorName: string,
  testDateStr: string,
  facilityName: string,
  instructions: string
): Promise<void> => {
  const portalUrl = `http://localhost:3000/donor/donate-organ`;
  const htmlContent = `
    <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #fcfcf9;">
      <h2 style="color: #123e20; font-family: 'Syne', sans-serif; border-bottom: 2px solid #EFF2EE; padding-bottom: 12px; margin-top: 0;">Clinical Evaluation Scheduled</h2>
      <p style="color: #334155; font-size: 16px; line-height: 1.6;">Hello <strong>${donorName}</strong>,</p>
      <p style="color: #334155; font-size: 14px; line-height: 1.6;">
        The coordinating transplant hospital has approved your profile match and scheduled your clinical evaluation and crossmatch testing.
      </p>
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 16px; border-radius: 8px; margin: 16px 0; font-size: 13px; color: #334155;">
        <strong>Testing Facility:</strong> ${facilityName}<br/>
        <strong>Scheduled Test Date & Time:</strong> ${testDateStr}<br/>
        ${instructions ? `<strong>Preparatory Instructions:</strong> ${instructions}` : ''}
      </div>
      <p style="color: #334155; font-size: 14px; line-height: 1.6; margin-bottom: 24px;">
        Please log into the donor portal to view additional medical guidelines or coordinates.
      </p>
      <div style="text-align: center; margin-bottom: 28px;">
        <a href="${portalUrl}" style="background-color: #123e20; color: #ffffff; padding: 12px 28px; font-weight: bold; border-radius: 8px; text-decoration: none; display: inline-block; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          View Donor Dashboard
        </a>
      </div>
      <p style="color: #64748b; font-size: 12px; margin-top: 16px; border-top: 1px solid #EFF2EE; padding-top: 12px; margin-bottom: 0;">
        Clinical evaluations ensure safe, compatible physiological parameters prior to legal clearance.
      </p>
    </div>
  `;

  await sendMail({
    to: toEmail,
    subject: `LifeLink: Clinical Test Scheduled on ${testDateStr}`,
    html: htmlContent,
  });
};

/**
 * Sends an email to the donor if the clinical match is rejected.
 */
export const sendClinicalTestingFailedNotification = async (
  toEmail: string,
  donorName: string,
  organType: string
): Promise<void> => {
  const portalUrl = `http://localhost:3000/donor/donate-organ`;
  const htmlContent = `
    <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #fee2e2; border-radius: 12px; background-color: #fffcfc;">
      <h2 style="color: #991b1b; font-family: 'Syne', sans-serif; border-bottom: 2px solid #fee2e2; padding-bottom: 12px; margin-top: 0;">Clinical Evaluation Update</h2>
      <p style="color: #334155; font-size: 16px; line-height: 1.6;">Hello <strong>${donorName}</strong>,</p>
      <p style="color: #334155; font-size: 14px; line-height: 1.6;">
        We regret to inform you that your clinical compatibility results for the matched <strong>${organType}</strong> transplant did not meet the required compatibility criteria.
      </p>
      <p style="color: #334155; font-size: 14px; line-height: 1.6; margin-bottom: 24px;">
        To protect donor safety and recipient outcomes, the coordination system has dissolved this match. Your donor profile has been restored to 'Available' for future compatible patients.
      </p>
      <div style="text-align: center; margin-bottom: 28px;">
        <a href="${portalUrl}" style="background-color: #991b1b; color: #ffffff; padding: 12px 28px; font-weight: bold; border-radius: 8px; text-decoration: none; display: inline-block; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          Access Donor Portal
        </a>
      </div>
      <p style="color: #64748b; font-size: 12px; margin-top: 16px; border-top: 1px solid #fee2e2; padding-top: 12px; margin-bottom: 0;">
        Thank you for your sincere willingness to save a life.
      </p>
    </div>
  `;

  await sendMail({
    to: toEmail,
    subject: `LifeLink Update: Clinical Match Assessment`,
    html: htmlContent,
  });
};

/**
 * Sends an email to the donor when clinical testing passes and legal consent deed is ready.
 */
export const sendLegalDeedReadyNotification = async (
  toEmail: string,
  donorName: string,
  organType: string
): Promise<void> => {
  const portalUrl = `http://localhost:3000/donor/donate-organ`;
  const htmlContent = `
    <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #fcfcf9;">
      <h2 style="color: #123e20; font-family: 'Syne', sans-serif; border-bottom: 2px solid #EFF2EE; padding-bottom: 12px; margin-top: 0;">Legal Consent Deed Ready for Signing</h2>
      <p style="color: #334155; font-size: 16px; line-height: 1.6;">Hello <strong>${donorName}</strong>,</p>
      <p style="color: #334155; font-size: 14px; line-height: 1.6;">
        Great news! Your clinical compatibility tests for the <strong>${organType}</strong> donation have passed all verification checkpoints successfully.
      </p>
      <p style="color: #334155; font-size: 14px; line-height: 1.6; margin-bottom: 24px;">
        To proceed, you are now required to review the formal legal consent deed and sign the agreement within the donor portal.
      </p>
      <div style="text-align: center; margin-bottom: 28px;">
        <a href="${portalUrl}" style="background-color: #123e20; color: #ffffff; padding: 12px 28px; font-weight: bold; border-radius: 8px; text-decoration: none; display: inline-block; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          Sign Legal Consent Deed
        </a>
      </div>
      <p style="color: #64748b; font-size: 12px; margin-top: 16px; border-top: 1px solid #EFF2EE; padding-top: 12px; margin-bottom: 0;">
        Under national regulations, living organ donation requires signed documentation and committee clearances.
      </p>
    </div>
  `;

  await sendMail({
    to: toEmail,
    subject: `LifeLink: Legal Consent Deed Ready for Signature`,
    html: htmlContent,
  });
};

/**
 * Sends an email to the hospital representative when the donor signs the legal deed.
 */
export const sendHospitalLegalReviewNotification = async (
  toEmail: string,
  hospitalName: string,
  donorName: string,
  organType: string
): Promise<void> => {
  const portalUrl = `http://localhost:3000/hospital/matching`;
  const htmlContent = `
    <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #fcfcf9;">
      <h2 style="color: #123e20; font-family: 'Syne', sans-serif; border-bottom: 2px solid #EFF2EE; padding-bottom: 12px; margin-top: 0;">Donor Signature Received - Action Required</h2>
      <p style="color: #334155; font-size: 16px; line-height: 1.6;">Hello <strong>${hospitalName}</strong> Representative,</p>
      <p style="color: #334155; font-size: 14px; line-height: 1.6;">
        Living donor <strong>${donorName}</strong> has signed the legal consent deed for the <strong>${organType}</strong> transplant.
      </p>
      <p style="color: #334155; font-size: 14px; line-height: 1.6; margin-bottom: 24px;">
        Please access the hospital matching panel, sign the institutional consent section, and log the ethics committee clearance details to schedule the surgery date.
      </p>
      <div style="text-align: center; margin-bottom: 28px;">
        <a href="${portalUrl}" style="background-color: #123e20; color: #ffffff; padding: 12px 28px; font-weight: bold; border-radius: 8px; text-decoration: none; display: inline-block; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          Institutional Sign & Schedule
        </a>
      </div>
      <p style="color: #64748b; font-size: 12px; margin-top: 16px; border-top: 1px solid #EFF2EE; padding-top: 12px; margin-bottom: 0;">
        LifeLink coordination handles secure legal document archiving.
      </p>
    </div>
  `;

  await sendMail({
    to: toEmail,
    subject: `LifeLink: Legal Signature Received from Donor (${donorName})`,
    html: htmlContent,
  });
};

/**
 * Sends an email to the donor when surgery is scheduled.
 */
export const sendSurgeryScheduledNotification = async (
  toEmail: string,
  donorName: string,
  organType: string,
  dateStr: string,
  leadSurgeon: string,
  operatingRoom: string
): Promise<void> => {
  const portalUrl = `http://localhost:3000/donor/donate-organ`;
  const htmlContent = `
    <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #fcfcf9;">
      <h2 style="color: #123e20; font-family: 'Syne', sans-serif; border-bottom: 2px solid #EFF2EE; padding-bottom: 12px; margin-top: 0;">Transplant Surgery Scheduled</h2>
      <p style="color: #334155; font-size: 16px; line-height: 1.6;">Hello <strong>${donorName}</strong>,</p>
      <p style="color: #334155; font-size: 14px; line-height: 1.6;">
        All legal and ethical clearances are complete. Your transplant surgery has been officially scheduled.
      </p>
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 16px; border-radius: 8px; margin: 16px 0; font-size: 13px; color: #334155;">
        <strong>Procedure Type:</strong> ${organType} Donation<br/>
        <strong>Surgery Date & Time:</strong> ${dateStr}<br/>
        <strong>Operating Suite:</strong> ${operatingRoom}<br/>
        <strong>Lead Surgeon:</strong> ${leadSurgeon}
      </div>
      <p style="color: #334155; font-size: 14px; line-height: 1.6; margin-bottom: 24px;">
        Please review the preoperative preparation directives in the donor portal.
      </p>
      <div style="text-align: center; margin-bottom: 28px;">
        <a href="${portalUrl}" style="background-color: #123e20; color: #ffffff; padding: 12px 28px; font-weight: bold; border-radius: 8px; text-decoration: none; display: inline-block; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          View Pre-op Checklist
        </a>
      </div>
      <p style="color: #64748b; font-size: 12px; margin-top: 16px; border-top: 1px solid #EFF2EE; padding-top: 12px; margin-bottom: 0;">
        Preoperative clearances and safety instructions must be strictly followed.
      </p>
    </div>
  `;

  await sendMail({
    to: toEmail,
    subject: `LifeLink: Transplant Surgery Scheduled for ${dateStr}`,
    html: htmlContent,
  });
};

/**
 * Sends an email to the donor confirming transplant outcome.
 */
export const sendTransplantOutcomeNotification = async (
  toEmail: string,
  donorName: string,
  organType: string,
  isSuccess: boolean
): Promise<void> => {
  const portalUrl = `http://localhost:3000/donor/donate-organ`;
  const htmlContent = isSuccess
    ? `
      <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #d4af37; border-radius: 12px; background-color: #fbf9f5;">
        <h2 style="color: #1e293b; font-family: 'Syne', sans-serif; border-bottom: 2px solid #EFF2EE; padding-bottom: 12px; margin-top: 0;">Transplant Successful - Thank You</h2>
        <p style="color: #334155; font-size: 16px; line-height: 1.6;">Hello <strong>${donorName}</strong>,</p>
        <p style="color: #334155; font-size: 14px; line-height: 1.6;">
          Your transplant surgery has completed successfully! Your heroic gift has been received, and you have saved a life today.
        </p>
        <p style="color: #334155; font-size: 14px; line-height: 1.6; margin-bottom: 24px;">
          Your **Certificate of Honor** has been issued and is available for download. Additionally, your **Long-Term Wellness Dashboard** is now active to support you throughout your recovery.
        </p>
        <div style="text-align: center; margin-bottom: 28px;">
          <a href="${portalUrl}" style="background-color: #1e293b; color: #ffffff; padding: 12px 28px; font-weight: bold; border-radius: 8px; text-decoration: none; display: inline-block; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
            Access Recovery Dashboard
          </a>
        </div>
        <p style="color: #64748b; font-size: 12px; margin-top: 16px; border-top: 1px solid #EFF2EE; padding-top: 12px; margin-bottom: 0;">
          LifeLink tracks living donor recovery for a mandatory period of two years. Thank you for your incredible altruism.
        </p>
      </div>
    `
    : `
      <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #fee2e2; border-radius: 12px; background-color: #fffcfc;">
        <h2 style="color: #991b1b; font-family: 'Syne', sans-serif; border-bottom: 2px solid #fee2e2; padding-bottom: 12px; margin-top: 0;">Transplant Procedure Status Update</h2>
        <p style="color: #334155; font-size: 16px; line-height: 1.6;">Hello <strong>${donorName}</strong>,</p>
        <p style="color: #334155; font-size: 14px; line-height: 1.6;">
          We are writing to inform you that your scheduled transplant surgery for the <strong>${organType}</strong> request could not be completed successfully due to clinical challenges during the operation.
        </p>
        <p style="color: #334155; font-size: 14px; line-height: 1.6; margin-bottom: 24px;">
          Our primary concern is your recovery. Please consult your medical team for direct clinical support and updates. Your availability status has been reset.
        </p>
        <div style="text-align: center; margin-bottom: 28px;">
          <a href="${portalUrl}" style="background-color: #991b1b; color: #ffffff; padding: 12px 28px; font-weight: bold; border-radius: 8px; text-decoration: none; display: inline-block;">
            Access Portal
          </a>
        </div>
      </div>
    `;

  await sendMail({
    to: toEmail,
    subject: isSuccess ? `LifeLink: Transplant Surgery Completed Successfully` : `LifeLink Update: Surgical Procedure Status`,
    html: htmlContent,
  });
};
