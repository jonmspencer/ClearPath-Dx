import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@clearpath/database";
import {
  getSessionOrThrow,
  requirePermission,
  buildPaginationParams,
  buildPaginatedResponse,
  handleApiError,
  successResponse,
} from "@/lib/api-helpers";
import { buildReferralScopeFilter } from "@/lib/data-scoping";
import { createAuditLog } from "@/lib/audit";
import { createReferralSchema } from "@/lib/validations/referral";
import { sendOutreach } from "@/lib/outreach";
import {
  referralReceivedEmail,
  parentOutreachEmail,
} from "@clearpath/email";
import { parentInitialOutreach } from "@/lib/sms-templates";

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionOrThrow();
    requirePermission(session, "REFERRAL:LIST");

    const { searchParams } = request.nextUrl;
    const { page, pageSize, skip } = buildPaginationParams(searchParams);

    const scopeFilter = buildReferralScopeFilter(session.user as any);
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const orgId = searchParams.get("orgId");

    const where: any = { ...scopeFilter };
    if (status) where.status = status;
    if (orgId) where.referringOrgId = orgId;
    if (search) {
      where.OR = [
        { referralNumber: { contains: search, mode: "insensitive" } },
        { childFirstName: { contains: search, mode: "insensitive" } },
        { childLastName: { contains: search, mode: "insensitive" } },
      ];
    }

    const [data, total] = await Promise.all([
      prisma.referral.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { receivedAt: "desc" },
        include: {
          referringOrg: { select: { id: true, name: true } },
          referralSource: { select: { id: true, label: true, channel: true } },
        },
      }),
      prisma.referral.count({ where }),
    ]);

    return NextResponse.json(buildPaginatedResponse(data, total, page, pageSize));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionOrThrow();
    requirePermission(session, "REFERRAL:CREATE");

    const body = await request.json();
    const data = createReferralSchema.parse(body);

    // Generate referral number
    const count = await prisma.referral.count();
    const referralNumber = `REF-${(count + 1001).toString().padStart(4, "0")}`;

    const referral = await prisma.referral.create({
      data: {
        referralNumber,
        status: "RECEIVED",
        channel: data.channel,
        referringOrgId: data.referringOrgId,
        referralSourceId: data.referralSourceId || null,
        priority: data.priority,
        childFirstName: data.childFirstName,
        childLastName: data.childLastName,
        childDateOfBirth: data.childDateOfBirth || null,
        childAge: data.childAge || null,
        reasonForReferral: data.reasonForReferral || null,
        insuranceInfo: data.insuranceInfo || null,
        notes: data.notes || null,
        receivedAt: new Date(),
      },
      include: {
        referringOrg: { select: { id: true, name: true } },
      },
    });

    // Status history entry
    await prisma.referralStatusHistory.create({
      data: {
        referralId: referral.id,
        toStatus: "RECEIVED",
        changedBy: session.user.id,
      },
    });

    await createAuditLog({
      actorId: session.user.id,
      action: "CREATE",
      resource: "REFERRAL",
      resourceId: referral.id,
      newValues: { referralNumber, childName: `${data.childFirstName} ${data.childLastName}` },
    });

    // Send notification email to internal team
    const internalEmail = referralReceivedEmail({
      referralNumber,
      childName: `${data.childFirstName} ${data.childLastName}`,
      referringOrg: referral.referringOrg.name,
    });

    // Fire-and-forget: notify admins about new referral
    import("@clearpath/email").then(({ sendEmail }) =>
      sendEmail({
        to: process.env.INTAKE_NOTIFICATION_EMAIL ?? "intake@clearpathdx.com",
        subject: internalEmail.subject,
        html: internalEmail.html,
        tag: "referral-received",
      }).catch((err: unknown) => console.error("[Email] referral notification failed:", err))
    );

    // Auto-outreach to guardian if referral was created with client/guardian info
    // (This happens when a client record already exists with guardian contact info)
    try {
      const client = await prisma.client.findUnique({
        where: { referralId: referral.id },
        include: { guardians: { where: { isPrimary: true }, take: 1 } },
      });
      const guardian = client?.guardians?.[0];
      if (guardian && (guardian.email || guardian.phone)) {
        const childName = `${data.childFirstName} ${data.childLastName}`;
        const parentEmail = guardian.email
          ? parentOutreachEmail({
              parentName: `${guardian.firstName} ${guardian.lastName}`,
              childName,
              referralNumber,
            })
          : null;
        const smsMsg = guardian.phone
          ? parentInitialOutreach({
              parentName: guardian.firstName,
              childName,
              referralNumber,
            })
          : null;

        await sendOutreach({
          referralId: referral.id,
          guardianId: guardian.id,
          guardianEmail: guardian.email,
          guardianPhone: guardian.phone,
          emailSubject: parentEmail?.subject,
          emailHtml: parentEmail?.html,
          smsMessage: smsMsg ?? undefined,
          attemptNumber: 1,
        });
      }
    } catch (outreachError) {
      // Outreach should never block referral creation
      console.error("[Outreach] Auto-outreach failed:", outreachError);
    }

    return successResponse(referral, "Referral created successfully");
  } catch (error) {
    return handleApiError(error);
  }
}
