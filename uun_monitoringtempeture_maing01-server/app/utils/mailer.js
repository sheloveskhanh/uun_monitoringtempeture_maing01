"use strict";
const nodemailer = require("nodemailer");

const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const NOTIFICATION_EMAIL = process.env.NOTIFICATION_EMAIL || SMTP_USER;

let transporter = null;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });
  }
  return transporter;
}

async function sendTemperatureAlert({ deviceEui, type, message, temperature, minC, maxC, notificationEmail }) {
  if (!SMTP_USER || !SMTP_PASS) {
    console.warn("[mailer] SMTP_USER or SMTP_PASS not set — skipping email notification");
    return;
  }
  const recipient = notificationEmail || NOTIFICATION_EMAIL;
  if (!recipient) {
    console.warn("[mailer] No recipient email configured — skipping notification for device", deviceEui);
    return;
  }

  const subject =
    type === "tempTooHigh"
      ? `ALERT: Temperature too high on device ${deviceEui}`
      : `ALERT: Temperature too low on device ${deviceEui}`;

  const body = [
    `Device: ${deviceEui}`,
    `Reading: ${temperature}°C`,
    `Allowed range: ${minC}°C – ${maxC}°C`,
    ``,
    message,
  ].join("\n");

  try {
    await getTransporter().sendMail({
      from: `"uuMonitor" <${SMTP_USER}>`,
      to: recipient,
      subject,
      text: body,
    });
  } catch (err) {
    console.error("[mailer] Failed to send email alert:", err.message, err.stack);
  }
}

module.exports = { sendTemperatureAlert };
