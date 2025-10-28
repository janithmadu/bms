// lib/mailer.ts
import nodemailer from "nodemailer";

// === COMPANY BRANDING FROM .env ===
const COMPANY_NAME = process.env.COMPANY_NAME || "Boardroom Booking";
const COMPANY_LOGO_URL = process.env.COMPANY_LOGO_URL || "";
const SUPPORT_EMAIL = process.env.COMPANY_SUPPORT_EMAIL || "support@yourcompany.com";

// === GMAIL SMTP TRANSPORTER ===
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,           // smtp.gmail.com
    port: Number(process.env.SMTP_PORT),   // 587
    secure: process.env.SMTP_SECURE === "true", // false for STARTTLS
    auth: {
        user: process.env.SMTP_USER,         // your.email@gmail.com
        pass: process.env.SMTP_PASS,         // 16-char App Password
    },
    tls: {
        rejectUnauthorized: false,
    },
});

// Optional: Verify connection on startup
if (process.env.NODE_ENV !== "production") {
    transporter.verify().catch((err) => console.warn("SMTP connection failed:", err));
}

// === HELPER: Format Date & Time ===
function formatDateTime(dateStr: string, timeStr: string) {
    const date = new Date(dateStr).toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    });
    const time = new Date(timeStr).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
    });
    return { date, time };
}

// === 1. BOOKING RECEIVED EMAIL ===
export async function sendBookingReceivedEmail({
    to,
    bookerName,
    eventTitle,
    date,
    startTime,
    endTime,
    boardroomName,
    locationName,
}: {
    to: string;
    bookerName: string;
    eventTitle: string;
    date: string;
    startTime: string;
    endTime: string;
    boardroomName: string;
    locationName: string;
}) {
    const { date: fmtDate, time: start } = formatDateTime(date, startTime);
    const { time: end } = formatDateTime(endTime, endTime);

    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; background: #fff;">
      ${COMPANY_LOGO_URL ? `<div style="text-align: center; margin-bottom: 20px;"><img src="${COMPANY_LOGO_URL}" alt="${COMPANY_NAME}" width="120" style="max-width: 100%; height: auto;" /></div>` : ""}
      
      <h2 style="color: #1a1a1a; text-align: center; margin-top: 0;">Booking Request Received</h2>
      
      <p style="font-size: 16px; color: #333;">Hi <strong>${bookerName}</strong>,</p>
      
      <p style="font-size: 16px; color: #333;">Thank you for your booking request. We have successfully received your details.</p>
      
      <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0; font-size: 15px;">
        <h3 style="margin: 0 0 10px 0; color: #1a1a1a;">Booking Details</h3>
        <ul style="margin: 0; padding-left: 20px; color: #444;">
          <li><strong>Event:</strong> ${eventTitle}</li>
          <li><strong>Date:</strong> ${fmtDate}</li>
          <li><strong>Time:</strong> ${start} – ${end}</li>
          <li><strong>Boardroom:</strong> ${boardroomName}</li>
          <li><strong>Location:</strong> ${locationName}</li>
        </ul>
      </div>
      
      <p style="font-size: 16px; color: #333;">
        <strong>Status:</strong> 
        <span style="color: #f59e0b; font-weight: bold;">Pending Review</span>
      </p>
      
      <p style="font-size: 16px; color: #333;">
        We will review your request and send you a <strong>final confirmation</strong> within <strong>24 hours</strong>.
      </p>
      
      <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;">
      
      <p style="font-size: 12px; color: #777; text-align: center;">
        © ${new Date().getFullYear()} <strong>${COMPANY_NAME}</strong>. All rights reserved.<br>
        Need help? Contact us at 
        <a href="mailto:${SUPPORT_EMAIL}" style="color: #1a90ff; text-decoration: none;">${SUPPORT_EMAIL}</a>
      </p>
    </div>
  `;

    await transporter.sendMail({
        from: `"${COMPANY_NAME}" <${process.env.SMTP_FROM}>`,
        to,
        replyTo: SUPPORT_EMAIL,
        subject: `Booking Request Received – ${eventTitle}`,
        html,
    });
}

// === 2. BOOKING CONFIRMED EMAIL ===
export async function sendBookingConfirmedEmail({
    to,
    bookerName,
    eventTitle,
    date,
    startTime,
    endTime,
    boardroomName,
    locationName,
}: {
    to: string;
    bookerName: string;
    eventTitle: string;
    date: string;
    startTime: string;
    endTime: string;
    boardroomName: string;
    locationName: string;
}) {
    const { date: fmtDate, time: start } = formatDateTime(date, startTime);
    const { time: end } = formatDateTime(endTime, endTime);

    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; background: #fff;">
      ${COMPANY_LOGO_URL ? `<div style="text-align: center; margin-bottom: 20px;"><img src="${COMPANY_LOGO_URL}" alt="${COMPANY_NAME}" width="120" style="max-width: 100%; height: auto;" /></div>` : ""}
      
      <h2 style="color: #16a34a; text-align: center; margin-top: 0;">Booking Confirmed!</h2>
      
      <p style="font-size: 16px; color: #333;">Hi <strong>${bookerName}</strong>,</p>
      
      <p style="font-size: 16px; color: #333;">Great news! Your boardroom booking has been <strong>officially confirmed</strong>.</p>
      
      <div style="background: #f0fdf4; padding: 15px; border-radius: 8px; margin: 20px 0; font-size: 15px; border: 1px solid #bbf7d0;">
        <h3 style="margin: 0 0 10px 0; color: #166534;">Confirmed Booking Details</h3>
        <ul style="margin: 0; padding-left: 20px; color: #166534;">
          <li><strong>Event:</strong> ${eventTitle}</li>
          <li><strong>Date:</strong> ${fmtDate}</li>
          <li><strong>Time:</strong> ${start} – ${end}</li>
          <li><strong>Boardroom:</strong> ${boardroomName}</li>
          <li><strong>Location:</strong> ${locationName}</li>
        </ul>
      </div>
      
      <p style="font-size: 16px; color: #333;">
        You're all set! The room is reserved under your name.
      </p>
      
      <p style="font-size: 16px; color: #333;">
        If you need to cancel or modify, please contact us at least <strong>24 hours in advance</strong>.
      </p>
      
      <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;">
      
      <p style="font-size: 12px; color: #777; text-align: center;">
        © ${new Date().getFullYear()} <strong>${COMPANY_NAME}</strong>. All rights reserved.<br>
        Questions? Reach us at 
        <a href="mailto:${SUPPORT_EMAIL}" style="color: #16a34a; text-decoration: none;">${SUPPORT_EMAIL}</a>
      </p>
    </div>
  `;

    await transporter.sendMail({
        from: `"${COMPANY_NAME}" <${process.env.SMTP_FROM}>`,
        to,
        replyTo: SUPPORT_EMAIL,
        subject: `Booking Confirmed: ${eventTitle}`,
        html,
    });
}

// === 3. BOOKING CANCELLED EMAIL ===
export async function sendBookingCancelledEmail({
    to,
    bookerName,
    eventTitle,
    date,
    startTime,
    endTime,
    boardroomName,
    locationName,
}: {
    to: string;
    bookerName: string;
    eventTitle: string;
    date: string;
    startTime: string;
    endTime: string;
    boardroomName: string;
    locationName: string;
}) {
    const { date: fmtDate, time: start } = formatDateTime(date, startTime);
    const { time: end } = formatDateTime(endTime, endTime);

    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; background: #fff;">
      ${COMPANY_LOGO_URL ? `<div style="text-align: center; margin-bottom: 20px;"><img src="${COMPANY_LOGO_URL}" alt="${COMPANY_NAME}" width="120" style="max-width: 100%; height: auto;" /></div>` : ""}
      
      <h2 style="color: #dc2626; text-align: center; margin-top: 0;">Booking Cancelled</h2>
      
      <p style="font-size: 16px; color: #333;">Hi <strong>${bookerName}</strong>,</p>
      
      <p style="font-size: 16px; color: #333;">Your booking has been <strong>cancelled</strong> as requested.</p>
      
      <div style="background: #fef2f2; padding: 15px; border-radius: 8px; margin: 20px 0; font-size: 15px; border: 1px solid #fecaca;">
        <h3 style="margin: 0 0 10px 0; color: #991b1b;">Cancelled Booking</h3>
        <ul style="margin: 0; padding-left: 20px; color: #991b1b;">
          <li><strong>Event:</strong> ${eventTitle}</li>
          <li><strong>Date:</strong> ${fmtDate}</li>
          <li><strong>Time:</strong> ${start} – ${end}</li>
          <li><strong>Boardroom:</strong> ${boardroomName}</li>
          <li><strong>Location:</strong> ${locationName}</li>
        </ul>
      </div>
      
      <p style="font-size: 16px; color: #333;">
        <strong>Tokens have been refunded</strong> to your account.
      </p>
      
      <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;">
      
      <p style="font-size: 12px; color: #777; text-align: center;">
        © ${new Date().getFullYear()} <strong>${COMPANY_NAME}</strong>. All rights reserved.<br>
        Need help? Contact us at 
        <a href="mailto:${SUPPORT_EMAIL}" style="color: #dc2626; text-decoration: none;">${SUPPORT_EMAIL}</a>
      </p>
    </div>
  `;

    await transporter.sendMail({
        from: `"${COMPANY_NAME}" <${process.env.SMTP_FROM}>`,
        to,
        replyTo: SUPPORT_EMAIL,
        subject: `Booking Cancelled: ${eventTitle}`,
        html,
    });
}

// === 4. BOOKING RE-CONFIRMED EMAIL ===
export async function sendBookingReconfirmedEmail({
    to,
    bookerName,
    eventTitle,
    date,
    startTime,
    endTime,
    boardroomName,
    locationName,
}: {
    to: string;
    bookerName: string;
    eventTitle: string;
    date: string;
    startTime: string;
    endTime: string;
    boardroomName: string;
    locationName: string;
}) {
    const { date: fmtDate, time: start } = formatDateTime(date, startTime);
    const { time: end } = formatDateTime(endTime, endTime);

    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; background: #fff;">
      ${COMPANY_LOGO_URL ? `<div style="text-align: center; margin-bottom: 20px;"><img src="${COMPANY_LOGO_URL}" alt="${COMPANY_NAME}" width="120" style="max-width: 100%; height: auto;" /></div>` : ""}
      
      <h2 style="color: #16a34a; text-align: center; margin-top: 0;">Booking Re-Confirmed!</h2>
      
      <p style="font-size: 16px; color: #333;">Hi <strong>${bookerName}</strong>,</p>
      
      <p style="font-size: 16px; color: #333;">Your previously cancelled booking has been <strong>re-confirmed</strong>.</p>
      
      <div style="background: #f0fdf4; padding: 15px; border-radius: 8px; margin: 20px 0; font-size: 15px; border: 1px solid #bbf7d0;">
        <h3 style="margin: 0 0 10px 0; color: #166534;">Re-Confirmed Booking</h3>
        <ul style="margin: 0; padding-left: 20px; color: #166534;">
          <li><strong>Event:</strong> ${eventTitle}</li>
          <li><strong>Date:</strong> ${fmtDate}</li>
          <li><strong>Time:</strong> ${start} – ${end}</li>
          <li><strong>Boardroom:</strong> ${boardroomName}</li>
          <li><strong>Location:</strong> ${locationName}</li>
        </ul>
      </div>
      
      <p style="font-size: 16px; color: #333;">
        <strong>Tokens have been deducted</strong> from your account.
      </p>
      
      <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;">
      
      <p style="font-size: 12px; color: #777; text-align: center;">
        © ${new Date().getFullYear()} <strong>${COMPANY_NAME}</strong>. All rights reserved.<br>
        Questions? Reach us at 
        <a href="mailto:${SUPPORT_EMAIL}" style="color: #16a34a; text-decoration: none;">${SUPPORT_EMAIL}</a>
      </p>
    </div>
  `;

    await transporter.sendMail({
        from: `"${COMPANY_NAME}" <${process.env.SMTP_FROM}>`,
        to,
        replyTo: SUPPORT_EMAIL,
        subject: `Booking Re-Confirmed: ${eventTitle}`,
        html,
    });
}