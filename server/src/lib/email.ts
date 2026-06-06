import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const EMAIL_FROM = process.env.EMAIL_FROM || 'noreply@snipfit.in';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Base HTML template
const baseTemplate = (content: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SNIPFIT Gym</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      background-color: #0A0A0A;
      color: #ffffff;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: linear-gradient(135deg, #FF6B2C 0%, #FF8C42 100%);
      padding: 20px;
      text-align: center;
      border-radius: 12px 12px 0 0;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: bold;
      color: #ffffff;
    }
    .content {
      background-color: #1A1A1A;
      border: 1px solid #2A2A2A;
      border-radius: 0 0 12px 12px;
      padding: 30px;
      margin-top: 2px;
    }
    .button {
      display: inline-block;
      background: linear-gradient(135deg, #FF6B2C 0%, #FF8C42 100%);
      color: #ffffff;
      text-decoration: none;
      padding: 12px 30px;
      border-radius: 8px;
      font-weight: bold;
      margin: 20px 0;
    }
    .footer {
      text-align: center;
      padding: 20px;
      color: #888;
      font-size: 12px;
      margin-top: 20px;
    }
    .footer a {
      color: #FF6B2C;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>SNIPFIT</h1>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p>SNIPFIT Gym, Rohini, New Delhi | <a href="mailto:info@snipfit.in">info@snipfit.in</a></p>
      <p>This email was sent to you because you have a SNIPFIT account.</p>
    </div>
  </div>
</body>
</html>
`;

// 1. Welcome email
export const sendWelcomeEmail = async (to: string, name: string): Promise<void> => {
  if (!resend) {
    console.log('Resend API key not configured, skipping email');
    return;
  }

  try {
    const content = `
      <h2 style="margin-top: 0;">Welcome to SNIPFIT, ${name}! 💪</h2>
      <p>Thank you for joining SNIPFIT Gym! We're excited to be part of your fitness journey.</p>
      <p>With your membership, you can now:</p>
      <ul>
        <li>🏋️ Book gym classes with expert trainers</li>
        <li>📊 Track your workouts and progress</li>
        <li>📅 View the class schedule and manage bookings</li>
        <li>🎯 Set and achieve your fitness goals</li>
      </ul>
      <a href="${FRONTEND_URL}/dashboard" class="button">Go to Dashboard</a>
      <p>If you have any questions, feel free to reach out to our team.</p>
      <p>See you at the gym!</p>
      <p>Team SNIPFIT</p>
    `;

    await resend.emails.send({
      from: EMAIL_FROM,
      to,
      subject: 'Welcome to SNIPFIT! 💪',
      html: baseTemplate(content),
    });
  } catch (error) {
    console.error('Failed to send welcome email:', error);
    throw error;
  }
};

// 2. Booking confirmation
export const sendBookingConfirmation = async (to: string, data: {
  name: string,
  className: string,
  trainerName: string,
  date: string,
  startTime: string,
  endTime: string,
  location: string
}): Promise<void> => {
  if (!resend) {
    console.log('Resend API key not configured, skipping email');
    return;
  }
  try {
    const content = `
      <h2 style="margin-top: 0;">Booking Confirmed: ${data.className} ✅</h2>
      <p>Hi ${data.name},</p>
      <p>Your booking has been confirmed! Here are the details:</p>
      <div style="background: #2A2A2A; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Class:</strong> ${data.className}</p>
        <p><strong>Trainer:</strong> ${data.trainerName}</p>
        <p><strong>Date:</strong> ${data.date}</p>
        <p><strong>Time:</strong> ${data.startTime} - ${data.endTime}</p>
        <p><strong>Location:</strong> ${data.location}</p>
      </div>
      <p>Don't forget to arrive 10 minutes early!</p>
      <a href="${FRONTEND_URL}/member/bookings" class="button">View My Bookings</a>
      <p>See you at the gym!</p>
    `;

    await resend.emails.send({
      from: EMAIL_FROM,
      to,
      subject: `Booking Confirmed: ${data.className}`,
      html: baseTemplate(content),
    });
  } catch (error) {
    console.error('Failed to send booking confirmation email:', error);
    throw error;
  }
};

// 3. Booking cancellation
export const sendBookingCancellation = async (to: string, data: {
  name: string,
  className: string,
  date: string
}): Promise<void> => {
  if (!resend) {
    console.log('Resend API key not configured, skipping email');
    return;
  }
  try {
    const content = `
      <h2 style="margin-top: 0;">Booking Cancelled: ${data.className}</h2>
      <p>Hi ${data.name},</p>
      <p>Your booking for ${data.className} on ${data.date} has been cancelled.</p>
      <p>If you didn't cancel this booking or would like to reschedule, please contact our team.</p>
      <a href="${FRONTEND_URL}/member/classes" class="button">Book Another Class</a>
      <p>We hope to see you soon!</p>
    `;

    await resend.emails.send({
      from: EMAIL_FROM,
      to,
      subject: `Booking Cancelled: ${data.className}`,
      html: baseTemplate(content),
    });
  } catch (error) {
    console.error('Failed to send booking cancellation email:', error);
    throw error;
  }
};

// 4. Membership expiry warning
export const sendExpiryWarning = async (to: string, data: {
  name: string,
  plan: string,
  expiryDate: string,
  daysLeft: number
}): Promise<void> => {
  if (!resend) {
    console.log('Resend API key not configured, skipping email');
    return;
  }
  try {
    const urgencyClass = data.daysLeft <= 3 ? 'color: #FF6B2C; font-size: 28px;' : '';
    const urgencyText = data.daysLeft <= 3 ? '⚠️ RENEW NOW!' : 'Time to renew?';

    const content = `
      <h2 style="margin-top: 0;">⚠️ Your SNIPFIT ${data.plan} Membership Expires Soon</h2>
      <p>Hi ${data.name},</p>
      <p style="${urgencyClass} font-weight: bold; text-align: center; margin: 30px 0;">
        ${data.daysLeft} DAYS REMAINING
      </p>
      <p>Your ${data.plan} membership will expire on <strong>${data.expiryDate}</strong>.</p>
      ${data.daysLeft <= 3 ? `
        <p style="color: #FF6B2C; font-weight: bold;">⚠️ Don't lose access to your fitness journey!</p>
        <p>Without renewal, you will lose:</p>
        <ul>
          <li>🏋️ Access to gym equipment</li>
          <li>📅 Class booking privileges</li>
          <li>🎯 Progress tracking features</li>
        </ul>
      ` : `
        <p>Renew now to continue your fitness journey without interruption.</p>
      `}
      <a href="${FRONTEND_URL}/renew" class="button">Renew Membership</a>
      <p>If you have any questions about your membership or renewal options, feel free to contact us.</p>
      <p>We'd love to keep seeing you at the gym!</p>
    `;

    await resend.emails.send({
      from: EMAIL_FROM,
      to,
      subject: `⚠️ Your SNIPFIT ${data.plan} membership expires in ${data.daysLeft} days`,
      html: baseTemplate(content),
    });
  } catch (error) {
    console.error('Failed to send expiry warning email:', error);
    throw error;
  }
};

// 5. Payment confirmation
export const sendPaymentConfirmation = async (to: string, data: {
  name: string,
  plan: string,
  amount: number,
  transactionId: string,
  startDate: string,
  endDate: string
}): Promise<void> => {
  if (!resend) {
    console.log('Resend API key not configured, skipping email');
    return;
  }
  try {
    const content = `
      <h2 style="margin-top: 0;">Payment Confirmed — SNIPFIT ${data.plan} Membership ✅</h2>
      <p>Hi ${data.name},</p>
      <p>Your payment has been processed successfully! Thank you for renewing your membership.</p>
      <div style="background: #2A2A2A; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Membership Plan:</strong> ${data.plan}</p>
        <p><strong>Amount Paid:</strong> ₹${data.amount.toLocaleString()}</p>
        <p><strong>Transaction ID:</strong> ${data.transactionId}</p>
        <p><strong>Valid From:</strong> ${data.startDate}</p>
        <p><strong>Valid Until:</strong> ${data.endDate}</p>
      </div>
      <p>Your membership is now active. You can start booking classes and tracking your workouts right away!</p>
      <a href="${FRONTEND_URL}/member/dashboard" class="button">View Dashboard</a>
      <p>See you at the gym!</p>
      <p>Team SNIPFIT</p>
    `;

    await resend.emails.send({
      from: EMAIL_FROM,
      to,
      subject: `Payment Confirmed — SNIPFIT ${data.plan} Membership`,
      html: baseTemplate(content),
    });
  } catch (error) {
    console.error('Failed to send payment confirmation email:', error);
    throw error;
  }
};

// 6. Password reset
export const sendPasswordResetEmail = async (to: string, data: {
  name: string,
  resetLink: string
}): Promise<void> => {
  if (!resend) {
    console.log('Resend API key not configured, skipping email');
    return;
  }
  try {
    const content = `
      <h2 style="margin-top: 0;">Reset Your SNIPFIT Password</h2>
      <p>Hi ${data.name},</p>
      <p>We received a request to reset your SNIPFIT account password.</p>
      <p>If you didn't make this request, you can safely ignore this email.</p>
      <p>To reset your password, click the button below:</p>
      <a href="${data.resetLink}" class="button">Reset Password</a>
      <p style="color: #888; font-size: 14px;">⚠️ This link will expire in 1 hour for security.</p>
      <p>If you have any trouble resetting your password, please contact our support team.</p>
      <p>Team SNIPFIT</p>
    `;

    await resend.emails.send({
      from: EMAIL_FROM,
      to,
      subject: 'Reset your SNIPFIT password',
      html: baseTemplate(content),
    });
  } catch (error) {
    console.error('Failed to send password reset email:', error);
    throw error;
  }
};

// 7. Admin invitation
export const sendAdminInvitation = async (to: string, data: {
  inviterName: string,
  acceptLink: string,
  expiryHours: number
}): Promise<void> => {
  if (!resend) {
    console.log('Resend API key not configured, skipping email');
    return;
  }

  try {
    const content = `
      <h2 style="margin-top: 0;">🎉 You're Invited to Become a SNIPFIT Admin!</h2>
      <p>Hi there,</p>
      <p><strong>${data.inviterName}</strong> has invited you to become an administrator at SNIPFIT Gym.</p>
      
      <div style="background: #2A2A2A; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #FF6B2C;">
        <p><strong>What this means:</strong></p>
        <ul>
          <li>🔧 Access to admin dashboard</li>
          <li>👥 Manage member accounts</li>
          <li>📊 View gym statistics and analytics</li>
          <li>📅 Manage class schedules and bookings</li>
          <li>💳 Monitor payments and memberships</li>
        </ul>
      </div>
      
      <p>This invitation expires in <strong>${data.expiryHours} hours</strong>.</p>
      <a href="${data.acceptLink}" class="button">Accept Admin Invitation</a>
      <p>If you have any questions about this invitation, contact ${data.inviterName} or our team.</p>
      <p>We're excited to have you join the SNIPFIT team!</p>
    `;

    await resend.emails.send({
      from: EMAIL_FROM,
      to,
      subject: '🎉 Admin Invitation - SNIPFIT Gym',
      html: baseTemplate(content),
    });
  } catch (error) {
    console.error('Failed to send admin invitation email:', error);
    throw error;
  }
};

// 8. Admin invitation accepted
export const sendAdminInvitationAccepted = async (to: string, data: {
  newAdminName: string,
  newAdminEmail: string
}): Promise<void> => {
  if (!resend) {
    console.log('Resend API key not configured, skipping email');
    return;
  }

  try {
    const content = `
      <h2 style="margin-top: 0;">✅ Admin Invitation Accepted</h2>
      <p><strong>${data.newAdminName}</strong> (${data.newAdminEmail}) has accepted your admin invitation.</p>
      <p>They now have full admin access to the SNIPFIT system.</p>
      <div style="background: #2A2A2A; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Next steps:</strong></p>
        <ul>
          <li>📋 Ensure they understand their responsibilities</li>
          <li>🔐 Help them set up their 6-digit admin security code</li>
          <li>📚 Provide training on admin dashboard usage</li>
        </ul>
      </div>
      <p>If this wasn't authorized, please contact our support team immediately.</p>
    `;

    await resend.emails.send({
      from: EMAIL_FROM,
      to,
      subject: '✅ Admin Invitation Accepted - SNIPFIT',
      html: baseTemplate(content),
    });
  } catch (error) {
    console.error('Failed to send admin invitation accepted email:', error);
    throw error;
  }
};
