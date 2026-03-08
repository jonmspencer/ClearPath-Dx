/**
 * Adds demo data for the coordinator queue to an EXISTING seeded database.
 * Safe to run on production — only creates new records, never deletes.
 *
 * Usage: npx tsx prisma/seed-coordinator-queue.ts
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🎯 Seeding coordinator queue demo data...\n");

  const now = new Date();
  const daysAgo = (d: number) => new Date(now.getTime() - d * 86400000);
  const hoursAgo = (h: number) => new Date(now.getTime() - h * 3600000);

  // Find existing referrals in early stages
  const receivedReferrals = await prisma.referral.findMany({
    where: { status: { in: ["RECEIVED", "INTAKE_IN_PROGRESS"] } },
    include: { client: true },
  });

  console.log(`  Found ${receivedReferrals.length} referrals in early stages`);

  // Find the intake coordinator for outreach logs
  const intakeCoord = await prisma.user.findFirst({
    where: { email: "intake@clearpathdx.com" },
  });

  // Find referring orgs
  const valleyPeds = await prisma.organization.findFirst({
    where: { name: "Valley Pediatrics" },
  });
  const brightFutures = await prisma.organization.findFirst({
    where: { name: "Bright Futures ABA" },
  });

  if (!valleyPeds || !brightFutures) {
    console.error("❌ Missing expected organizations. Run the main seed first.");
    return;
  }

  // Add clients + guardians to referrals that don't have them
  for (const ref of receivedReferrals) {
    if (ref.client) {
      console.log(`  ⏭  ${ref.referralNumber} already has a client, skipping`);
      continue;
    }

    const client = await prisma.client.create({
      data: {
        referralId: ref.id,
        referringOrgId: ref.referringOrgId,
        firstName: ref.childFirstName,
        lastName: ref.childLastName,
        dateOfBirth: ref.childDateOfBirth ?? new Date("2021-06-15"),
        gender: ["Male", "Female"][Math.floor(Math.random() * 2)],
        primaryLanguage: "English",
        city: "Austin",
        state: "TX",
        zipCode: "78701",
        insuranceProvider: ref.insuranceInfo?.split(" - ")[0] ?? "Unknown",
      },
    });

    // Create a primary guardian with realistic contact info
    const guardianFirstNames = ["Sarah", "Michael", "Jessica", "David", "Emily", "James"];
    const gFirst = guardianFirstNames[Math.floor(Math.random() * guardianFirstNames.length)];
    const gLast = ref.childLastName;
    const areaCode = String(Math.floor(Math.random() * 90 + 10));
    const lineNum = String(Math.floor(Math.random() * 9000 + 1000));
    const phoneNum = `+1-555-7${areaCode}-${lineNum}`;

    await prisma.guardian.create({
      data: {
        clientId: client.id,
        firstName: gFirst,
        lastName: gLast,
        relationship: "Mother",
        email: `${gFirst.toLowerCase()}.${gLast.toLowerCase()}@email.com`,
        phone: phoneNum,
        isPrimary: true,
      },
    });

    console.log(`  ✓ Added client + guardian for ${ref.referralNumber} (${ref.childFirstName} ${ref.childLastName})`);
  }

  // Now add some outreach logs to make the queue interesting
  const allQueueReferrals = await prisma.referral.findMany({
    where: { status: { in: ["RECEIVED", "INTAKE_IN_PROGRESS", "PARENT_CONTACTED"] } },
    include: {
      client: { include: { guardians: { where: { isPrimary: true }, take: 1 } } },
      outreachLogs: true,
    },
  });

  for (const ref of allQueueReferrals) {
    const guardian = ref.client?.guardians?.[0];
    if (!guardian) continue;
    if (ref.outreachLogs.length > 0) {
      console.log(`  ⏭  ${ref.referralNumber} already has outreach logs, skipping`);
      continue;
    }

    // Different scenarios for different referrals to make the demo interesting
    if (ref.status === "RECEIVED") {
      // Brand new — initial outreach sent, no response yet
      await prisma.outreachLog.create({
        data: {
          referralId: ref.id,
          guardianId: guardian.id,
          channel: "EMAIL",
          status: "SENT",
          message: `ClearPath Diagnostics — Referral Received for ${ref.childFirstName}`,
          sentAt: hoursAgo(36),
          attemptNumber: 1,
        },
      });
      if (guardian.phone) {
        await prisma.outreachLog.create({
          data: {
            referralId: ref.id,
            guardianId: guardian.id,
            channel: "SMS",
            status: "SENT",
            message: `Hi ${guardian.firstName}, this is ClearPath Diagnostics. We received a referral for ${ref.childFirstName}. Please reply YES to proceed.`,
            sentAt: hoursAgo(36),
            attemptNumber: 1,
          },
        });
      }
      console.log(`  ✓ Added initial outreach (no response) for ${ref.referralNumber}`);
    }

    if (ref.status === "INTAKE_IN_PROGRESS") {
      // Multiple attempts — 2 outreach attempts, no response yet
      await prisma.outreachLog.create({
        data: {
          referralId: ref.id,
          guardianId: guardian.id,
          channel: "SMS",
          status: "SENT",
          message: `Hi ${guardian.firstName}, this is ClearPath Diagnostics. We received a referral for ${ref.childFirstName}. Please reply YES to proceed.`,
          sentAt: hoursAgo(72),
          attemptNumber: 1,
        },
      });
      await prisma.outreachLog.create({
        data: {
          referralId: ref.id,
          guardianId: guardian.id,
          channel: "SMS",
          status: "SENT",
          message: `Hi ${guardian.firstName}, following up about ${ref.childFirstName}'s diagnostic evaluation. Please reply YES or call us.`,
          sentAt: hoursAgo(48),
          attemptNumber: 2,
        },
      });
      await prisma.outreachLog.create({
        data: {
          referralId: ref.id,
          guardianId: guardian.id,
          channel: "PHONE_CALL",
          status: "NO_RESPONSE",
          message: "Phone call attempted — no answer, left voicemail",
          sentAt: hoursAgo(24),
          attemptNumber: 3,
        },
      });
      console.log(`  ✓ Added 3 outreach attempts (no response) for ${ref.referralNumber}`);
    }

    if (ref.status === "PARENT_CONTACTED") {
      // Parent responded — outreach worked!
      await prisma.outreachLog.create({
        data: {
          referralId: ref.id,
          guardianId: guardian.id,
          channel: "SMS",
          status: "RESPONDED",
          message: `Hi ${guardian.firstName}, this is ClearPath Diagnostics. We received a referral for ${ref.childFirstName}. Please reply YES to proceed.`,
          sentAt: daysAgo(7),
          respondedAt: daysAgo(7),
          response: "Yes please, we'd like to proceed",
          attemptNumber: 1,
        },
      });
      await prisma.outreachLog.create({
        data: {
          referralId: ref.id,
          guardianId: guardian.id,
          channel: "PHONE_CALL",
          status: "RESPONDED",
          message: "Intake call completed — gathered insurance and scheduling preferences",
          sentAt: daysAgo(6),
          respondedAt: daysAgo(6),
          response: "Parent available Mon/Wed mornings. Prefers Austin North location.",
          attemptNumber: 2,
        },
      });
      console.log(`  ✓ Added successful outreach for ${ref.referralNumber}`);
    }
  }

  // Add 3 more fresh referrals specifically for the queue demo
  const newRefs = [
    {
      childFirst: "Aiden", childLast: "Patel",
      age: 4, reason: "Speech delay and limited social engagement. Daycare provider raised concerns.",
      insurance: "Aetna - Policy #AET-2026-1111",
      guardianFirst: "Priya", guardianLast: "Patel", guardianRel: "Mother",
      phone: "+1-555-801-2345", email: "priya.patel@email.com",
      status: "RECEIVED" as const, receivedDaysAgo: 0, priority: "URGENT" as const,
      org: valleyPeds,
    },
    {
      childFirst: "Chloe", childLast: "Thompson",
      age: 6, reason: "Teacher reports difficulty following instructions, frequent meltdowns during transitions.",
      insurance: "Blue Cross - Policy #BCB-2026-2222",
      guardianFirst: "Mark", guardianLast: "Thompson", guardianRel: "Father",
      phone: "+1-555-802-3456", email: "mark.thompson@email.com",
      status: "RECEIVED" as const, receivedDaysAgo: 2, priority: "STANDARD" as const,
      org: brightFutures,
    },
    {
      childFirst: "Jayden", childLast: "Kim",
      age: 3, reason: "No words at 36 months. Pediatrician recommends comprehensive developmental evaluation.",
      insurance: "UnitedHealthcare - Policy #UHC-2026-3333",
      guardianFirst: "Soo-jin", guardianLast: "Kim", guardianRel: "Mother",
      phone: "+1-555-803-4567", email: "soojin.kim@email.com",
      status: "RECEIVED" as const, receivedDaysAgo: 1, priority: "EXPEDITED" as const,
      org: valleyPeds,
    },
  ];

  // Get current referral count for numbering
  const refCount = await prisma.referral.count();

  for (let i = 0; i < newRefs.length; i++) {
    const r = newRefs[i];
    const refNum = `REF-${(refCount + i + 1001).toString().padStart(4, "0")}`;

    const ref = await prisma.referral.create({
      data: {
        referralNumber: refNum,
        status: r.status,
        channel: "FAX",
        referringOrgId: r.org.id,
        priority: r.priority,
        childFirstName: r.childFirst,
        childLastName: r.childLast,
        childAge: r.age,
        reasonForReferral: r.reason,
        insuranceInfo: r.insurance,
        receivedAt: daysAgo(r.receivedDaysAgo),
      },
    });

    await prisma.referralStatusHistory.create({
      data: {
        referralId: ref.id,
        toStatus: "RECEIVED",
        changedBy: intakeCoord?.id ?? null,
        changedAt: daysAgo(r.receivedDaysAgo),
      },
    });

    const client = await prisma.client.create({
      data: {
        referralId: ref.id,
        referringOrgId: r.org.id,
        firstName: r.childFirst,
        lastName: r.childLast,
        dateOfBirth: new Date(`${2026 - r.age}-06-15`),
        primaryLanguage: "English",
        city: "Austin",
        state: "TX",
        zipCode: "78701",
        insuranceProvider: r.insurance.split(" - ")[0],
      },
    });

    await prisma.guardian.create({
      data: {
        clientId: client.id,
        firstName: r.guardianFirst,
        lastName: r.guardianLast,
        relationship: r.guardianRel,
        email: r.email,
        phone: r.phone,
        isPrimary: true,
      },
    });

    console.log(`  ✓ Created ${refNum}: ${r.childFirst} ${r.childLast} (${r.priority}) — guardian: ${r.guardianFirst} ${r.guardianLast}`);
  }

  console.log("\n✅ Coordinator queue demo data seeded!");
  console.log("\nThe queue should now show ~6-8 referrals with guardian contact info and outreach history.");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
