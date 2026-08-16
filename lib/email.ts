import { Resend } from "resend";

// 1. Initialize Resend client using environment variable
const resend = new Resend(process.env.RESEND_API_KEY || "re_dummy_key");

// 2. Default sandbox sender address for Resend testing
// NOTE FOR PRODUCTION: Resend's default "onboarding@resend.dev" only sends to your own registered account email in test mode.
// To send confirmation/cancellation emails to external customers, verify a custom domain in your Resend Dashboard (https://resend.com/domains)
// and set process.env.EMAIL_FROM to your domain sender (e.g., "Slotly <bookings@yourdomain.com>").
const FROM_EMAIL = process.env.EMAIL_FROM || "Slotly <onboarding@resend.dev>";
const BASE_URL = process.env.NEXTAUTH_URL || "http://localhost:3000";

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

/**
 * Send booking CONFIRMATION HTML email via Resend API
 */
export async function sendBookingConfirmationEmail(details: BookingEmailDetails) {
  const { customerEmail, customerName, businessName, serviceName, formattedTime, price } = details;

  const cancelUrl = `${BASE_URL}/customer/bookings`;
  const nameDisplay = customerName || "Valued Customer";
  const priceDisplay = typeof price === "number" ? `$${price.toFixed(2)}` : `$${price}`;

  const html = `
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

  // Wrapped in try/catch so email failure does NOT fail the booking process
  try {
    const data = await resend.emails.send({
      from: FROM_EMAIL,
      to: customerEmail,
      subject: `Booking Confirmed with ${businessName}`,
      html,
    });
    return { success: true, data };
  } catch (error) {
    console.error("Failed to send booking confirmation email:", error);
    return { success: false, error };
  }
}

/**
 * Send booking CANCELLATION HTML email via Resend API
 */
export async function sendBookingCancellationEmail(details: BookingEmailDetails) {
  const { customerEmail, customerName, businessName, businessSlug, serviceName, formattedTime, price } = details;

  const bookUrl = `${BASE_URL}/${businessSlug}`;
  const nameDisplay = customerName || "Valued Customer";
  const priceDisplay = typeof price === "number" ? `$${price.toFixed(2)}` : `$${price}`;

  const html = `
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

  // Wrapped in try/catch so email failure does NOT fail the cancellation process
  try {
    const data = await resend.emails.send({
      from: FROM_EMAIL,
      to: customerEmail,
      subject: `Booking Cancelled - ${businessName}`,
      html,
    });
    return { success: true, data };
  } catch (error) {
    console.error("Failed to send booking cancellation email:", error);
    return { success: false, error };
  }
}
