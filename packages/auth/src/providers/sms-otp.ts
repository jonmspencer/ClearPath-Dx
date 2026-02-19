import { prisma } from "@clearpath/database";
import crypto from "crypto";

/**
 * SMS OTP is implemented as custom API routes, not a native Auth.js provider.
 *
 * Flow:
 * 1. POST /api/auth/otp/send   → generateOTP + sendSMS
 * 2. POST /api/auth/otp/verify → verifyOTP + create session
 */

export async function generateOTP(phone: string): Promise<string> {
  const otp = crypto.randomInt(100000, 999999).toString();
  const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  // Clean up any existing tokens for this phone
  await prisma.verificationToken.deleteMany({
    where: { identifier: phone },
  });

  await prisma.verificationToken.create({
    data: { identifier: phone, token: otp, expires },
  });

  return otp;
}

export async function verifyOTP(
  phone: string,
  otp: string
): Promise<boolean> {
  const record = await prisma.verificationToken.findFirst({
    where: {
      identifier: phone,
      token: otp,
      expires: { gt: new Date() },
    },
  });

  if (!record) return false;

  // Delete used token
  await prisma.verificationToken.delete({
    where: { identifier_token: { identifier: phone, token: otp } },
  });

  return true;
}

export async function sendSMS(
  phone: string,
  message: string
): Promise<void> {
  // In development, log to console
  if (process.env.NODE_ENV === "development") {
    console.log(`[SMS OTP] To: ${phone}, Message: ${message}`);
    return;
  }

  // Production: Twilio integration
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_PHONE_NUMBER;

  if (!accountSid || !authToken || !fromNumber) {
    throw new Error("Twilio credentials not configured");
  }

  // Dynamic import to avoid bundling Twilio in dev
  const twilio = await import("twilio");
  const client = twilio.default(accountSid, authToken);
  await client.messages.create({
    body: message,
    from: fromNumber,
    to: phone,
  });
}
