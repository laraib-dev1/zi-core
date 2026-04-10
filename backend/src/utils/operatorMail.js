import nodemailer from "nodemailer";

function hasMailConfig() {
  return (
    !!process.env.SMTP_HOST &&
    !!process.env.SMTP_PORT &&
    !!process.env.SMTP_USER &&
    !!process.env.SMTP_PASS
  );
}

function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT || 587) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

export async function sendOperatorAccessEmail({
  to,
  name,
  granted,
  tabs,
  changedBy,
}) {
  if (!hasMailConfig()) return;
  const transporter = createTransporter();
  const from = process.env.SMTP_FROM || process.env.SMTP_USER;

  const subject = granted
    ? "Admin panel access granted"
    : "Admin panel access updated";
  const tabsText = Array.isArray(tabs) && tabs.length ? tabs.join(", ") : "No tabs assigned yet";
  const html = `
    <div>
      <p>Hello ${name || "User"},</p>
      <p>Your admin panel access has been updated by ${changedBy || "an administrator"}.</p>
      <p><strong>Access:</strong> ${granted ? "Granted" : "Removed / Disabled"}</p>
      <p><strong>Allowed tabs:</strong> ${tabsText}</p>
      <p>If this change is unexpected, please contact support.</p>
    </div>
  `;

  await transporter.sendMail({ from, to, subject, html });
}

export async function sendOperatorCredentialEmail({
  to,
  name,
  emailChanged,
  passwordChanged,
  changedBy,
}) {
  if (!hasMailConfig()) return;
  const transporter = createTransporter();
  const from = process.env.SMTP_FROM || process.env.SMTP_USER;

  const changes = [];
  if (emailChanged) changes.push("email");
  if (passwordChanged) changes.push("password");

  const subject = "Your account login details were updated";
  const html = `
    <div>
      <p>Hello ${name || "User"},</p>
      <p>Your login ${changes.join(" and ")} ${
    changes.length > 1 ? "were" : "was"
  } updated by ${changedBy || "an administrator"}.</p>
      <p>If this change is unexpected, please contact support immediately.</p>
    </div>
  `;

  await transporter.sendMail({ from, to, subject, html });
}
