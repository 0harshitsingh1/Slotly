export interface BookingEmailDetails {
  bookingId: string;
  customerEmail: string;
  customerName?: string | null;
  businessName: string;
  businessSlug: string;
  serviceName: string;
  formattedTime: string; // Pre-formatted in the business's local timezone
  price: number;
}

interface SendBrevoEmailOptions {
  toEmail: string;
  toName?: string | null;
  subject: string;
  htmlContent: string;
}

/**
 * Helper to parse "Name <email@domain.com>" or "email@domain.com" into Brevo sender object
 */
function parseBrevoSender(fromStr: string): { name: string; email: string } {
  const match = fromStr.match(/^(?:"?([^"]*)"?\s)?<([^>]+)>$/);
  if (match && match[2]) {
    return { name: match[1] || "Slotly Bookings", email: match[2].trim() };
  }
  return { name: "Slotly Bookings", email: fromStr.trim() };
}

/**
 * Send transactional email using Brevo v3 REST API (https://api.brevo.com/v3/smtp/email)
 */
async function sendBrevoEmail(options: SendBrevoEmailOptions) {
  const apiKey = process.env.BREVO_API_KEY;

  // NOTE FOR BREVO CONFIGURATION:
  // BREVO_SENDER_EMAIL must match a verified sender address configured in your Brevo Dashboard (https://app.brevo.com/senders).
  // Example: BREVO_SENDER_EMAIL="your-verified-email@gmail.com" or BREVO_SENDER_EMAIL="Slotly Bookings <your-verified-email@gmail.com>"
  const senderStr =
    process.env.BREVO_SENDER_EMAIL ||
    process.env.EMAIL_FROM ||
    "onboarding@slotly.app";

  if (!apiKey) {
    console.warn("⚠️ Warning: BREVO_API_KEY is not defined in environment variables!");
    return { success: false, error: "BREVO_API_KEY is missing." };
  }

  const sender = parseBrevoSender(senderStr);

  const payload = {
    sender,
    to: [
      {
        email: options.toEmail,
        name: options.toName || "Valued Customer",
      },
    ],
    subject: options.subject,
    htmlContent: options.htmlContent,
  };

  console.log(
    `✉️ Attempting to send email via Brevo to "${options.toEmail}" from "${sender.name} <${sender.email}>"...`
  );

  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        accept: "application/json",
        "api-key": apiKey,
        "content-type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.error("❌ Brevo API Error Response:", JSON.stringify(responseData, null, 2));
      return { success: false, error: responseData };
    }

    console.log("✅ Email sent successfully via Brevo API. Message ID:", responseData.messageId);
    return { success: true, data: responseData };
  } catch (error: any) {
    console.error(
      "❌ Brevo Email Fetch Exception:",
      JSON.stringify(error, Object.getOwnPropertyNames(error), 2)
    );
    return { success: false, error };
  }
}

/**
 * Send booking CONFIRMATION HTML email via Brevo API
 */
export async function sendBookingConfirmationEmail(details: BookingEmailDetails) {
  const { customerEmail, customerName, businessName, serviceName, formattedTime, price } = details;

  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const cancelUrl = `${baseUrl}/customer/bookings`;
  const nameDisplay = customerName || "Valued Customer";
  const priceDisplay = typeof price === "number" ? `$${price.toFixed(2)}` : `$${price}`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f4f5; color: #18181b; margin: 0; padding: 20px; }
          .container { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e4e4e7; }
          .header { background: #2563eb; padding: 24px; text-align: center; color: #ffffff; }
          .header h1 { margin: 0; font-size: 22px; font-weight: 700; }
          .content { padding: 24px; }
          .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 16px 0; }
          .table { width: 100%; border-collapse: collapse; }
          .label { color: #64748b; font-size: 14px; font-weight: 500; padding: 6px 0; }
          .value { color: #0f172a; font-size: 14px; font-weight: 600; text-align: right; padding: 6px 0; }
          .btn { display: inline-block; background-color: #ef4444; color: #ffffff !important; font-weight: 600; text-decoration: none; padding: 10px 20px; border-radius: 6px; font-size: 14px; text-align: center; margin-top: 12px; }
          .footer { padding: 16px; text-align: center; font-size: 12px; color: #71717a; border-top: 1px solid #f4f4f5; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Booking Confirmed!</h1>
          </div>
          <div class="content">
            <p>Hi <strong>${nameDisplay}</strong>,</p>
            <p>Your appointment with <strong>${businessName}</strong> has been successfully reserved.</p>
            
            <div class="card">
              <table class="table">
                <tr>
                  <td class="label">Business:</td>
                  <td class="value">${businessName}</td>
                </tr>
                <tr>
                  <td class="label">Service:</td>
                  <td class="value">${serviceName}</td>
                </tr>
                <tr>
                  <td class="label">Date & Time:</td>
                  <td class="value">${formattedTime}</td>
                </tr>
                <tr>
                  <td class="label">Total Price:</td>
                  <td class="value">${priceDisplay}</td>
                </tr>
              </table>
            </div>

            <p style="font-size: 14px; color: #4b5563;">Need to make a change or cancel your appointment?</p>
            <a href="${cancelUrl}" class="btn">Manage / Cancel Booking</a>
          </div>
          <div class="footer">
            <p>Sent by Slotly Appointment Scheduling</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendBrevoEmail({
    toEmail: customerEmail,
    toName: customerName,
    subject: `Booking Confirmed with ${businessName}`,
    htmlContent,
  });
}

/**
 * Send booking CANCELLATION HTML email via Brevo API
 */
export async function sendBookingCancellationEmail(details: BookingEmailDetails) {
  const { customerEmail, customerName, businessName, businessSlug, serviceName, formattedTime, price } = details;

  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const bookUrl = `${baseUrl}/${businessSlug}`;
  const nameDisplay = customerName || "Valued Customer";
  const priceDisplay = typeof price === "number" ? `$${price.toFixed(2)}` : `$${price}`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f4f5; color: #18181b; margin: 0; padding: 20px; }
          .container { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e4e4e7; }
          .header { background: #dc2626; padding: 24px; text-align: center; color: #ffffff; }
          .header h1 { margin: 0; font-size: 22px; font-weight: 700; }
          .content { padding: 24px; }
          .notice { background: #fef2f2; border-left: 4px solid #ef4444; padding: 12px; margin-bottom: 16px; border-radius: 4px; color: #991b1b; font-size: 14px; font-weight: 600; }
          .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 16px 0; }
          .table { width: 100%; border-collapse: collapse; }
          .label { color: #64748b; font-size: 14px; font-weight: 500; padding: 6px 0; }
          .value { color: #0f172a; font-size: 14px; font-weight: 600; text-align: right; padding: 6px 0; }
          .btn { display: inline-block; background-color: #2563eb; color: #ffffff !important; font-weight: 600; text-decoration: none; padding: 10px 20px; border-radius: 6px; font-size: 14px; text-align: center; margin-top: 12px; }
          .footer { padding: 16px; text-align: center; font-size: 12px; color: #71717a; border-top: 1px solid #f4f4f5; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Booking Cancelled</h1>
          </div>
          <div class="content">
            <p>Hi <strong>${nameDisplay}</strong>,</p>
            <div class="notice">
              ⚠️ Please note: Your appointment with <strong>${businessName}</strong> has been cancelled.
            </div>
            
            <div class="card">
              <table class="table">
                <tr>
                  <td class="label">Business:</td>
                  <td class="value">${businessName}</td>
                </tr>
                <tr>
                  <td class="label">Service:</td>
                  <td class="value">${serviceName}</td>
                </tr>
                <tr>
                  <td class="label">Original Date & Time:</td>
                  <td class="value">${formattedTime}</td>
                </tr>
                <tr>
                  <td class="label">Price:</td>
                  <td class="value">${priceDisplay}</td>
                </tr>
              </table>
            </div>

            <p style="font-size: 14px; color: #4b5563;">Would you like to schedule a new appointment?</p>
            <a href="${bookUrl}" class="btn">Book Another Slot</a>
          </div>
          <div class="footer">
            <p>Sent by Slotly Appointment Scheduling</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendBrevoEmail({
    toEmail: customerEmail,
    toName: customerName,
    subject: `Booking Cancelled - ${businessName}`,
    htmlContent,
  });
}

export interface PasswordResetEmailDetails {
  toEmail: string;
  resetUrl: string;
  recipientName?: string | null;
}

/**
 * Send Password Reset HTML email via Brevo API
 */
export async function sendPasswordResetEmail(details: PasswordResetEmailDetails) {
  const { toEmail, resetUrl, recipientName } = details;
  const nameDisplay = recipientName || "Valued User";

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f4f5; color: #18181b; margin: 0; padding: 20px; }
          .container { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e4e4e7; }
          .header { background: #2563eb; padding: 24px; text-align: center; color: #ffffff; }
          .header h1 { margin: 0; font-size: 22px; font-weight: 700; }
          .content { padding: 24px; }
          .btn { display: inline-block; background-color: #2563eb; color: #ffffff !important; font-weight: 600; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-size: 14px; text-align: center; margin: 20px 0; }
          .footer { padding: 16px; text-align: center; font-size: 12px; color: #71717a; border-top: 1px solid #f4f4f5; }
          .note { font-size: 13px; color: #64748b; margin-top: 16px; line-height: 1.5; }
          .url { word-break: break-all; color: #2563eb; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Reset Your Password</h1>
          </div>
          <div class="content">
            <p>Hi <strong>${nameDisplay}</strong>,</p>
            <p>We received a request to reset your password for your Slotly account.</p>
            <p>Click the button below to choose a new password. This link will expire in <strong>1 hour</strong>.</p>
            
            <div style="text-align: center;">
              <a href="${resetUrl}" class="btn">Reset Password</a>
            </div>

            <div class="note">
              <p>If you did not request a password reset, you can safely ignore this email — your password will remain unchanged.</p>
              <p>Or copy and paste this link into your browser:<br/><a href="${resetUrl}" class="url">${resetUrl}</a></p>
            </div>
          </div>
          <div class="footer">
            <p>Sent by Slotly Appointment Scheduling</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendBrevoEmail({
    toEmail,
    toName: recipientName,
    subject: "Reset your Slotly password",
    htmlContent,
  });
}
