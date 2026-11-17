"use strict";
const nodemailer = require("nodemailer");

function createTransport() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) return null;

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT) || 587,
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
}

async function _send({ deviceEui, subject, text, notificationEmail }) {
  const transport = createTransport();
  if (!transport) {
    console.warn("[mailer] SMTP not configured — skipping email notification");
    return { success: false, error: "SMTP not configured" };
  }

  const recipient = notificationEmail || process.env.NOTIFICATION_EMAIL;
  if (!recipient) {
    console.warn("[mailer] No recipient email configured — skipping notification for device", deviceEui);
    return { success: false, error: "no recipient" };
  }

  try {
    await transport.sendMail({ from: process.env.SMTP_USER, to: recipient, subject, text });
    console.log("[mailer] Email sent successfully to", recipient);
    return { success: true, recipient };
  } catch (err) {
    console.error("[mailer] Failed to send email:", err.message);
    return { success: false, error: err.message };
  }
}

async function sendTemperatureAlert({ deviceEui, type, message, temperature, minC, maxC, notificationEmail }) {
  const subject =
    type === "tempTooHigh"
      ? `ALERT: Temperature too high on device ${deviceEui}`
      : `ALERT: Temperature too low on device ${deviceEui}`;

  const text = [
    `Device: ${deviceEui}`,
    `Reading: ${temperature}°C`,
    `Allowed range: ${minC}°C – ${maxC}°C`,
    ``,
    message,
  ].join("\n");

  return _send({ deviceEui, subject, text, notificationEmail });
}

async function sendBatteryLowAlert({ deviceEui, voltage, batteryLowV, notificationEmail }) {
  const subject = `ALERT: Battery low on device ${deviceEui}`;
  const text = [
    `Device: ${deviceEui}`,
    `Battery voltage: ${voltage}V`,
    `Threshold: ${batteryLowV}V`,
  ].join("\n");

  return _send({ deviceEui, subject, text, notificationEmail });
}

module.exports = { sendTemperatureAlert, sendBatteryLowAlert };
