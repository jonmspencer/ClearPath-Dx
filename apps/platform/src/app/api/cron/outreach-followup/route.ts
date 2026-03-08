import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@clearpath/database";
import { sendOutreach, getLatestAttemptNumber } from "@/lib/outreach";
import { parentFollowUp } from "@/lib/sms-templates";
import { parentOutreachEmail } from "@clearpath/email";

const MAX_ATTEMPTS = 5;
const HOURS_BETWEEN_ATTEMPTS = 24;

/**
 * Vercel Cron endpoint — daily outreach follow-up.
 * Finds referrals in early statuses with no recent response,
 * and sends follow-up SMS/email to guardians.
 */
export async function GET(request: NextRequest) {
  // Verify cron secret to prevent unauthorized access
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const cutoff = new Date(Date.now() - HOURS_BETWEEN_ATTEMPTS * 60 * 60 * 1000);

    // Find referrals that need follow-up:
    // - Status is RECEIVED or INTAKE_IN_PROGRESS
    // - Has a client with guardians
    // - No RESPONDED outreach logs
    // - Last outreach was sent before the cutoff
    const referrals = await prisma.referral.findMany({
      where: {
        status: { in: ["RECEIVED", "INTAKE_IN_PROGRESS"] },
        client: {
          guardians: { some: {} },
        },
        // Exclude referrals where guardian already responded
        outreachLogs: {
          none: { status: "RESPONDED" },
        },
      },
      include: {
        client: {
          include: {
            guardians: {
              where: { isPrimary: true },
              take: 1,
            },
          },
        },
        outreachLogs: {
          orderBy: { sentAt: "desc" },
          take: 1,
        },
      },
    });

    let sentCount = 0;
    let skippedCount = 0;

    for (const referral of referrals) {
      const guardian = referral.client?.guardians?.[0];
      if (!guardian || (!guardian.email && !guardian.phone)) {
        skippedCount++;
        continue;
      }

      // Check if we've exceeded max attempts
      const attemptNumber = await getLatestAttemptNumber(referral.id);
      if (attemptNumber >= MAX_ATTEMPTS) {
        skippedCount++;
        continue;
      }

      // Check if enough time has passed since last outreach
      const lastOutreach = referral.outreachLogs[0];
      if (lastOutreach && lastOutreach.sentAt > cutoff) {
        skippedCount++;
        continue;
      }

      const childName = `${referral.childFirstName} ${referral.childLastName}`;
      const nextAttempt = attemptNumber + 1;

      const emailData = guardian.email
        ? parentOutreachEmail({
            parentName: `${guardian.firstName} ${guardian.lastName}`,
            childName,
            referralNumber: referral.referralNumber,
          })
        : null;

      const smsMsg = guardian.phone
        ? parentFollowUp({
            parentName: guardian.firstName,
            childName,
            attemptNumber: nextAttempt,
          })
        : null;

      await sendOutreach({
        referralId: referral.id,
        guardianId: guardian.id,
        guardianEmail: guardian.email,
        guardianPhone: guardian.phone,
        emailSubject: emailData?.subject,
        emailHtml: emailData?.html,
        smsMessage: smsMsg ?? undefined,
        attemptNumber: nextAttempt,
      });

      sentCount++;
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      referralsProcessed: referrals.length,
      outreachSent: sentCount,
      skipped: skippedCount,
    });
  } catch (error) {
    console.error("[Cron] Outreach follow-up error:", error);
    return NextResponse.json(
      { error: "Internal error during outreach follow-up" },
      { status: 500 }
    );
  }
}
