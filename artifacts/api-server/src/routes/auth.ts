import { Router } from "express";
import nodemailer from "nodemailer";

declare module "express-session" {
  interface SessionData {
    user?: { email: string; name: string };
  }
}

const router = Router();

type OtpEntry = { otp: string; expiresAt: number; name: string; attempts: number };
const otpStore = new Map<string, OtpEntry>();

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function getTransporter() {
  const { SMTP_HOST, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) return null;
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT ?? "587"),
    secure: process.env.SMTP_SECURE === "true",
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
}

async function sendOtpEmail(to: string, otp: string, name: string) {
  const transport = getTransporter();
  if (!transport) return false;
  try {
    await transport.sendMail({
      from: process.env.SMTP_FROM ?? process.env.SMTP_USER,
      to,
      subject: "Your SecureShield Verification Code",
      html: `
        <div style="font-family:Inter,sans-serif;background:#0a0a0f;color:#fff;padding:40px;border-radius:16px;max-width:480px;margin:auto">
          <div style="display:flex;align-items:center;gap:12px;margin-bottom:32px">
            <div style="width:40px;height:40px;background:#3b82f6;border-radius:10px;display:flex;align-items:center;justify-content:center">
              <svg width="22" height="22" fill="none" stroke="white" stroke-width="2.5" viewBox="0 0 24 24"><path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.35C17.25 22.15 21 17.25 21 12V7l-9-5z"/></svg>
            </div>
            <span style="font-size:20px;font-weight:700">SecureShield</span>
          </div>
          <h2 style="margin:0 0 8px;font-size:22px">Hi ${name},</h2>
          <p style="color:#94a3b8;margin:0 0 28px">Here is your one-time verification code. It expires in 5 minutes.</p>
          <div style="background:#1e293b;border-radius:12px;padding:24px;text-align:center;letter-spacing:12px;font-size:40px;font-weight:700;font-family:monospace;color:#3b82f6">
            ${otp}
          </div>
          <p style="color:#64748b;font-size:13px;margin-top:24px">If you did not request this, you can safely ignore this email.</p>
        </div>
      `,
    });
    return true;
  } catch {
    return false;
  }
}

router.post("/auth/send-otp", async (req, res) => {
  const { email, name } = req.body as { email?: string; name?: string };
  if (!email || !email.includes("@")) {
    res.status(400).json({ error: "Valid email required." });
    return;
  }
  const safeName = (name ?? email.split("@")[0]).trim();
  const otp = generateOtp();
  otpStore.set(email.toLowerCase(), {
    otp,
    expiresAt: Date.now() + 5 * 60 * 1000,
    name: safeName,
    attempts: 0,
  });

  const sent = await sendOtpEmail(email, otp, safeName);
  const isDev = !getTransporter();

  res.json({
    message: sent ? "OTP sent to your email." : "OTP generated (demo mode — no SMTP configured).",
    ...(isDev ? { devOtp: otp } : {}),
  });
});

router.post("/auth/verify-otp", (req, res) => {
  const { email, otp } = req.body as { email?: string; otp?: string };
  if (!email || !otp) {
    res.status(400).json({ error: "Email and OTP required." });
    return;
  }
  const entry = otpStore.get(email.toLowerCase());
  if (!entry) {
    res.status(400).json({ error: "No OTP found for this email. Please request a new code." });
    return;
  }
  if (Date.now() > entry.expiresAt) {
    otpStore.delete(email.toLowerCase());
    res.status(400).json({ error: "This OTP has expired. Please request a new code." });
    return;
  }
  entry.attempts++;
  if (entry.attempts > 5) {
    otpStore.delete(email.toLowerCase());
    res.status(429).json({ error: "Too many incorrect attempts. Please request a new code." });
    return;
  }
  if (entry.otp !== otp.trim()) {
    res.status(400).json({ error: `Incorrect code. ${5 - entry.attempts} attempt${5 - entry.attempts !== 1 ? "s" : ""} remaining.` });
    return;
  }
  otpStore.delete(email.toLowerCase());
  const user = { email: email.toLowerCase(), name: entry.name };
  req.session.user = user;
  res.json({ user });
});

router.get("/auth/me", (req, res) => {
  res.json({ user: req.session.user ?? null });
});

router.post("/auth/logout", (req, res) => {
  req.session.destroy(() => {
    res.json({ message: "Logged out." });
  });
});

export default router;
