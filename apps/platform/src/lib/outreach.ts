/**
 * Outreach utility — sends emails/SMS and logs to OutreachLog.
 * Email-first approach: always sends email when available.
 * SMS sent when Twilio is configured and guardian has a phone number.
 */

import { prisma } from "@clearpath/database";
import { sendEmail } from "@clearpath/email";
import { sendSMS } from "./sms";

interface SendOutreachParams {
  referralId: string;
  guardianId?: string;
  guardianEmail?: string | null;
  guardianPhone?: string | null;
  emailSubject?: string;
  emailHtml?: string;
  smsMessage?: string;
  attemptNumber?: number;
}

export async function sendOutreach(params: SendOutreachParams): Promise<void> {
  const {
    referralId,
    guardianId,
    guardianEmail,
    guardianPhone,
    emailSubject,
    emailHtml,
    smsMessage,
    attemptNumber = 1,
  } = params;

  // Send email if we have the content and address
  if (emailSubject && emailHtml && guardianEmail) {
    try {
      await sendEmail({
        to: guardianEmail,
        subject: emailSubject,
        html: emailHtml,
        tag: "outreach",
      });
      await prisma.outreachLog.create({
        data: {
          referralId,
          guardianId: guardianId || null,
          channel: "EMAIL",
          status: "SENT",
          message: emailSubject,
          attemptNumber,
        },
      });
    } catch (error) {
      console.error("[Outreach] Email failed:", error);
      await prisma.outreachLog.create({
        data: {
          referralId,
          guardianId: guardianId || null,
          channel: "EMAIL",
          status: "FAILED",
          message: emailSubject,
          attemptNumber,
        },
      });
    }
  }

  // Send SMS if we have the message and phone number
  if (smsMessage && guardianPhone) {
    const result = await sendSMS(guardianPhone, smsMessage);
    await prisma.outreachLog.create({
      data: {
        referralId,
        guardianId: guardianId || null,
        channel: "SMS",
        status: result.success ? "SENT" : "FAILED",
        message: smsMessage,
        attemptNumber,
      },
    });
  }
}

/**
 * Get the latest outreach attempt number for a referral.
 */
export async function getLatestAttemptNumber(
  referralId: string
): Promise<number> {
  const latest = await prisma.outreachLog.findFirst({
    where: { referralId },
    orderBy: { attemptNumber: "desc" },
    select: { attemptNumber: true },
  });
  return latest?.attemptNumber ?? 0;
}
