import { NextResponse } from "next/server";
import { prisma } from "@clearpath/database";
import { getSessionOrThrow, handleApiError } from "@/lib/api-helpers";
import type { UserRole } from "@clearpath/types";

export async function GET() {
  try {
    const session = await getSessionOrThrow();
    const role = (session.user as any).activeRole as UserRole;
    const orgId = (session.user as any).activeOrganizationId;
    const userId = session.user.id;

    const stats = await getStatsForRole(role, orgId, userId);
    return NextResponse.json({ success: true, data: stats });
  } catch (error) {
    return handleApiError(error);
  }
}

async function getStatsForRole(role: string, orgId: string, userId: string) {
  switch (role) {
    case "SUPER_ADMIN":
    case "ADMIN":
      return getAdminStats();
    case "FINANCE_ADMIN":
      return getFinanceStats();
    case "INTAKE_COORDINATOR":
      return getIntakeStats();
    case "SCHEDULER":
      return getSchedulerStats();
    case "ACCOUNT_MANAGER":
      return getAccountManagerStats(orgId);
    case "COMMUNITY_DEVELOPMENT_MANAGER":
      return getCommunityDevStats();
    case "PSYCHOLOGIST":
    case "PSYCHOMETRIST":
      return getProviderStats(userId);
    case "ABA_PROVIDER_ADMIN":
    case "ABA_PROVIDER_STAFF":
      return getAbaStats(orgId);
    case "PEDIATRICIAN_ADMIN":
      return getPediatricianStats(orgId);
    case "PARENT_GUARDIAN":
      return getParentStats(userId);
    default:
      return {};
  }
}

async function getAdminStats() {
  const [
    totalReferrals, pendingReferrals, totalClients, activeCases,
    reportsInReview, pendingBilling, totalProviders, totalOrgs,
    recentActivity,
  ] = await Promise.all([
    prisma.referral.count(),
    prisma.referral.count({ where: { status: { in: ["RECEIVED", "INTAKE_IN_PROGRESS"] } } }),
    prisma.client.count(),
    prisma.diagnosticCase.count(),
    prisma.diagnosticReport.count({ where: { status: "IN_REVIEW" } }),
    prisma.billingRecord.count({ where: { status: "PENDING" } }),
    prisma.providerProfile.count(),
    prisma.organization.count({ where: { isActive: true } }),
    prisma.auditLog.findMany({
      take: 10, orderBy: { createdAt: "desc" },
      include: { actor: { select: { name: true } } },
    }),
  ]);

  return {
    totalReferrals, pendingReferrals, totalClients, activeCases,
    reportsInReview, pendingBilling, totalProviders, totalOrgs,
    recentActivity: recentActivity.map((a: any) => ({
      id: a.id, action: a.action, resource: a.resource,
      resourceId: a.resourceId, actorName: a.actor?.name, createdAt: a.createdAt.toISOString(),
    })),
  };
}

async function getFinanceStats() {
  const [
    pendingBilling, submittedBilling, paidBilling, totalBilling,
    pendingPayouts, approvedPayouts, recentActivity,
  ] = await Promise.all([
    prisma.billingRecord.count({ where: { status: "PENDING" } }),
    prisma.billingRecord.count({ where: { status: "SUBMITTED" } }),
    prisma.billingRecord.count({ where: { status: "PAID" } }),
    prisma.billingRecord.count(),
    prisma.providerPayoutLedger.count({ where: { status: "PENDING" } }),
    prisma.providerPayoutLedger.count({ where: { status: "APPROVED" } }),
    prisma.auditLog.findMany({
      where: { resource: { in: ["BillingRecord", "ProviderPayoutLedger"] } },
      take: 10, orderBy: { createdAt: "desc" },
      include: { actor: { select: { name: true } } },
    }),
  ]);

  return {
    pendingBilling, submittedBilling, paidBilling, totalBilling,
    pendingPayouts, approvedPayouts,
    recentActivity: recentActivity.map((a: any) => ({
      id: a.id, action: a.action, resource: a.resource,
      resourceId: a.resourceId, actorName: a.actor?.name, createdAt: a.createdAt.toISOString(),
    })),
  };
}

async function getIntakeStats() {
  const [
    receivedReferrals, intakeInProgress, parentContacted, readyToSchedule,
    totalClients, recentReferrals,
  ] = await Promise.all([
    prisma.referral.count({ where: { status: "RECEIVED" } }),
    prisma.referral.count({ where: { status: "INTAKE_IN_PROGRESS" } }),
    prisma.referral.count({ where: { status: "PARENT_CONTACTED" } }),
    prisma.referral.count({ where: { status: "READY_TO_SCHEDULE" } }),
    prisma.client.count(),
    prisma.referral.findMany({
      take: 10, orderBy: { createdAt: "desc" },
      select: { id: true, referralNumber: true, childFirstName: true, childLastName: true, status: true, createdAt: true },
    }),
  ]);

  return {
    receivedReferrals, intakeInProgress, parentContacted, readyToSchedule, totalClients,
    recentReferrals: recentReferrals.map((r: any) => ({
      id: r.id, referralNumber: r.referralNumber,
      childName: `${r.childFirstName} ${r.childLastName}`,
      status: r.status, createdAt: r.createdAt.toISOString(),
    })),
  };
}

async function getSchedulerStats() {
  const now = new Date();
  const [
    readyToSchedule, upcomingInterviews, todayInterviews, completedInterviews,
    availableProviders, recentInterviews,
  ] = await Promise.all([
    prisma.referral.count({ where: { status: "READY_TO_SCHEDULE" } }),
    prisma.interviewEvent.count({ where: { scheduledStart: { gte: now }, isCancelled: false, isCompleted: false } }),
    prisma.interviewEvent.count({
      where: {
        scheduledStart: { gte: new Date(now.toDateString()), lt: new Date(new Date(now.toDateString()).getTime() + 86400000) },
        isCancelled: false,
      },
    }),
    prisma.interviewEvent.count({ where: { isCompleted: true } }),
    prisma.providerProfile.count({ where: { isAcceptingCases: true } }),
    prisma.interviewEvent.findMany({
      take: 10, orderBy: { scheduledStart: "asc" },
      where: { scheduledStart: { gte: now }, isCancelled: false },
      include: { diagnosticCase: { select: { caseNumber: true, client: { select: { firstName: true, lastName: true } } } } },
    }),
  ]);

  return {
    readyToSchedule, upcomingInterviews, todayInterviews, completedInterviews, availableProviders,
    recentInterviews: recentInterviews.map((i: any) => ({
      id: i.id, caseNumber: i.diagnosticCase.caseNumber,
      clientName: `${i.diagnosticCase.client.firstName} ${i.diagnosticCase.client.lastName}`,
      type: i.interviewType, scheduledStart: i.scheduledStart.toISOString(),
    })),
  };
}

async function getAccountManagerStats(orgId: string) {
  const [totalOrgs, activeReferrals, totalClients, activeCases] = await Promise.all([
    prisma.organization.count({ where: { isActive: true } }),
    prisma.referral.count({ where: { status: { notIn: ["CLOSED", "DIAGNOSIS_COMPLETE", "REPORT_DELIVERED"] } } }),
    prisma.client.count(),
    prisma.diagnosticCase.count(),
  ]);

  return { totalOrgs, activeReferrals, totalClients, activeCases };
}

async function getCommunityDevStats() {
  const [totalOrgs, schoolOrgs, abaOrgs, pediatricianOrgs, totalReferrals] = await Promise.all([
    prisma.organization.count({ where: { isActive: true } }),
    prisma.organization.count({ where: { type: "SCHOOL", isActive: true } }),
    prisma.organization.count({ where: { type: "ABA_PROVIDER", isActive: true } }),
    prisma.organization.count({ where: { type: "PEDIATRICIAN", isActive: true } }),
    prisma.referral.count(),
  ]);

  return { totalOrgs, schoolOrgs, abaOrgs, pediatricianOrgs, totalReferrals };
}

async function getProviderStats(userId: string) {
  const profile = await prisma.providerProfile.findUnique({ where: { userId } });
  if (!profile) return { assignedCases: 0, upcomingInterviews: 0, draftReports: 0, pendingPayouts: 0 };

  const now = new Date();
  const [assignedCases, upcomingInterviews, draftReports, pendingPayouts] = await Promise.all([
    prisma.diagnosticCase.count({
      where: { OR: [{ psychologistId: profile.id }, { psychometristId: profile.id }] },
    }),
    prisma.interviewEvent.count({
      where: { providerId: profile.id, scheduledStart: { gte: now }, isCancelled: false, isCompleted: false },
    }),
    prisma.diagnosticReport.count({ where: { authorId: profile.id, status: "DRAFT" } }),
    prisma.providerPayoutLedger.count({ where: { providerId: profile.id, status: "PENDING" } }),
  ]);

  return {
    assignedCases, upcomingInterviews, draftReports, pendingPayouts,
    maxWeeklyCases: profile.maxWeeklyCases,
    currentWeeklyCases: profile.currentWeeklyCases,
    isAcceptingCases: profile.isAcceptingCases,
  };
}

async function getAbaStats(orgId: string) {
  const [totalReferrals, activeReferrals, completedCases, reportsDelivered] = await Promise.all([
    prisma.referral.count({ where: { referringOrgId: orgId } }),
    prisma.referral.count({ where: { referringOrgId: orgId, status: { notIn: ["CLOSED", "DIAGNOSIS_COMPLETE", "REPORT_DELIVERED"] } } }),
    prisma.referral.count({ where: { referringOrgId: orgId, status: { in: ["DIAGNOSIS_COMPLETE", "REPORT_DELIVERED", "CLOSED"] } } }),
    prisma.referral.count({ where: { referringOrgId: orgId, status: "REPORT_DELIVERED" } }),
  ]);

  return { totalReferrals, activeReferrals, completedCases, reportsDelivered };
}

async function getPediatricianStats(orgId: string) {
  const [totalReferrals, activeReferrals, completedCases, reportsDelivered] = await Promise.all([
    prisma.referral.count({ where: { referringOrgId: orgId } }),
    prisma.referral.count({ where: { referringOrgId: orgId, status: { notIn: ["CLOSED", "DIAGNOSIS_COMPLETE", "REPORT_DELIVERED"] } } }),
    prisma.referral.count({ where: { referringOrgId: orgId, status: { in: ["DIAGNOSIS_COMPLETE", "REPORT_DELIVERED", "CLOSED"] } } }),
    prisma.referral.count({ where: { referringOrgId: orgId, status: "REPORT_DELIVERED" } }),
  ]);

  return { totalReferrals, activeReferrals, completedCases, reportsDelivered };
}

async function getParentStats(userId: string) {
  const guardian = await prisma.guardian.findUnique({ where: { userId } });
  if (!guardian) return { childName: null, caseStatus: null, upcomingInterviews: 0, reportReady: false };

  const client = await prisma.client.findUnique({
    where: { id: guardian.clientId },
    include: {
      diagnosticCases: {
        take: 1,
        orderBy: { createdAt: "desc" },
        include: {
          referral: { select: { status: true } },
          interviews: { where: { isCancelled: false, isCompleted: false, scheduledStart: { gte: new Date() } }, orderBy: { scheduledStart: "asc" }, take: 3 },
          report: { select: { status: true } },
        },
      },
    },
  });

  if (!client) return { childName: null, caseStatus: null, upcomingInterviews: 0, reportReady: false };

  const latestCase = client.diagnosticCases[0];

  return {
    childName: `${client.firstName} ${client.lastName}`,
    caseStatus: latestCase?.referral?.status ?? null,
    caseNumber: latestCase?.caseNumber ?? null,
    upcomingInterviews: latestCase?.interviews?.length ?? 0,
    nextInterview: latestCase?.interviews?.[0]?.scheduledStart?.toISOString() ?? null,
    reportReady: latestCase?.report?.status === "DELIVERED" || latestCase?.report?.status === "APPROVED",
  };
}
