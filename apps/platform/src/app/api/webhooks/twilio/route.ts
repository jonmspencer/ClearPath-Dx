import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@clearpath/database";

/**
 * Twilio inbound SMS webhook.
 * Matches incoming phone → Guardian → updates OutreachLog.
 * No auth required — Twilio sends requests with its own validation.
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const from = formData.get("From") as string;
    const body = (formData.get("Body") as string)?.trim();

    if (!from || !body) {
      return NextResponse.json({ error: "Missing From or Body" }, { status: 400 });
    }

    // Normalize phone number (strip leading +1 for US numbers)
    const normalizedPhone = from.replace(/^\+1/, "").replace(/\D/g, "");

    // Find guardian by phone number
    const guardian = await prisma.guardian.findFirst({
      where: {
        OR: [
          { phone: from },
          { phone: normalizedPhone },
          { phone: `+1${normalizedPhone}` },
          { phone: { contains: normalizedPhone } },
        ],
      },
      include: {
        client: {
          include: {
            referral: true,
          },
        },
      },
    });

    if (!guardian) {
      console.warn(`[Twilio Webhook] No guardian found for phone: ${from}`);
      // Return TwiML empty response
      return new NextResponse(
        '<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
        { headers: { "Content-Type": "text/xml" } }
      );
    }

    const referralId = guardian.client?.referral?.id;

    if (referralId) {
      // Update the most recent SENT outreach log to RESPONDED
      const latestOutreach = await prisma.outreachLog.findFirst({
        where: {
          referralId,
          guardianId: guardian.id,
          channel: "SMS",
          status: { in: ["SENT", "DELIVERED"] },
        },
        orderBy: { sentAt: "desc" },
      });

      if (latestOutreach) {
        await prisma.outreachLog.update({
          where: { id: latestOutreach.id },
          data: {
            status: "RESPONDED",
            respondedAt: new Date(),
            response: body,
          },
        });
      }

      // If the response looks like a confirmation (YES), update referral status
      const isConfirmation = /^(yes|y|confirm|ok|sure)/i.test(body);
      if (isConfirmation) {
        const referral = guardian.client?.referral;
        if (referral && referral.status === "RECEIVED") {
          await prisma.referral.update({
            where: { id: referralId },
            data: {
              status: "INTAKE_IN_PROGRESS",
              intakeStartedAt: new Date(),
            },
          });
          await prisma.referralStatusHistory.create({
            data: {
              referralId,
              fromStatus: "RECEIVED",
              toStatus: "INTAKE_IN_PROGRESS",
              changedBy: null,
              note: "Parent confirmed via SMS",
            },
          });
        }
      }
    }

    // Return empty TwiML response
    return new NextResponse(
      '<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
      { headers: { "Content-Type": "text/xml" } }
    );
  } catch (error) {
    console.error("[Twilio Webhook] Error:", error);
    return new NextResponse(
      '<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
      { headers: { "Content-Type": "text/xml" }, status: 200 }
    );
  }
}
