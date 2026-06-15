"use strict";
const https = require("https");

async function sendTemperatureAlert({ deviceEui, type, message, temperature, minC, maxC, notificationEmail }) {
  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  if (!RESEND_API_KEY) {
    console.warn("[mailer] RESEND_API_KEY not set — skipping email notification");
    return;
  }

  const recipient = notificationEmail || process.env.NOTIFICATION_EMAIL;
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

  const payload = JSON.stringify({
    from: "uuMonitor <onboarding@resend.dev>",
    to: [recipient],
    subject,
    text: body,
  });

  return new Promise((resolve) => {
    const req = https.request(
      {
        hostname: "api.resend.com",
        path: "/emails",
        method: "POST",
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(payload),
        },
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            console.log("[mailer] Email sent successfully to", recipient);
          } else {
            console.error("[mailer] Resend API error:", res.statusCode, data);
          }
          resolve();
        });
      },
    );
    req.on("error", (err) => {
      console.error("[mailer] Failed to send email alert:", err.message);
      resolve();
    });
    req.write(payload);
    req.end();
  });
}

module.exports = { sendTemperatureAlert };
