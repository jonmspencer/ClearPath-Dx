import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const hash = (pw: string) => bcrypt.hashSync(pw, 10);

async function main() {
  console.log("🌱 Seeding database...\n");

  // ============================================================
  // 1. ORGANIZATIONS
  // ============================================================
  const clearpath = await prisma.organization.create({
    data: {
      name: "ClearPath Diagnostics",
      type: "DIAGNOSTICS_OPERATOR",
      phone: "+1-555-100-0001",
      email: "info@clearpathdx.com",
      address: "100 Diagnostic Way",
      city: "Austin",
      state: "TX",
      zipCode: "78701",
      website: "https://clearpathdx.com",
    },
  });

  const brightFutures = await prisma.organization.create({
    data: {
      name: "Bright Futures ABA",
      type: "ABA_PROVIDER",
      phone: "+1-555-200-0001",
      fax: "+1-555-200-0002",
      email: "referrals@brightfuturesaba.com",
      address: "200 Therapy Lane",
      city: "Austin",
      state: "TX",
      zipCode: "78702",
      npiNumber: "1234567890",
    },
  });

  const valleyPeds = await prisma.organization.create({
    data: {
      name: "Valley Pediatrics",
      type: "PEDIATRICIAN",
      phone: "+1-555-300-0001",
      fax: "+1-555-300-0002",
      email: "office@valleypeds.com",
      address: "300 Pediatric Blvd",
      city: "Austin",
      state: "TX",
      zipCode: "78703",
      npiNumber: "0987654321",
    },
  });

  const lincolnSchool = await prisma.organization.create({
    data: {
      name: "Lincoln Elementary",
      type: "SCHOOL",
      phone: "+1-555-400-0001",
      email: "office@lincoln-elem.edu",
      address: "400 School Road",
      city: "Austin",
      state: "TX",
      zipCode: "78704",
    },
  });

  const medBill = await prisma.organization.create({
    data: {
      name: "MedBill Pro",
      type: "BILLING_PROVIDER",
      phone: "+1-555-500-0001",
      email: "billing@medbillpro.com",
      address: "500 Finance Street",
      city: "Austin",
      state: "TX",
      zipCode: "78705",
      taxId: "12-3456789",
    },
  });

  console.log("  ✓ 5 organizations created");

  // ============================================================
  // 2. USERS + ORG MEMBERSHIPS
  // ============================================================
  const password = hash("password123");

  async function createUserWithRole(
    email: string,
    name: string,
    role: string,
    orgId: string,
    extra?: { phone?: string }
  ) {
    const user = await prisma.user.create({
      data: {
        email,
        name,
        passwordHash: password,
        phone: extra?.phone,
        emailVerified: new Date(),
        isActive: true,
      },
    });
    await prisma.userOrganization.create({
      data: {
        userId: user.id,
        organizationId: orgId,
        role: role as any,
        isPrimary: true,
        isActive: true,
      },
    });
    return user;
  }

  const superAdmin = await createUserWithRole(
    "super.admin@clearpathdx.com", "Sarah Chen", "SUPER_ADMIN", clearpath.id
  );
  const financeAdmin = await createUserWithRole(
    "finance@clearpathdx.com", "Marcus Rivera", "FINANCE_ADMIN", clearpath.id
  );
  const admin = await createUserWithRole(
    "admin@clearpathdx.com", "Jessica Thompson", "ADMIN", clearpath.id
  );
  const intakeCoord = await createUserWithRole(
    "intake@clearpathdx.com", "David Kim", "INTAKE_COORDINATOR", clearpath.id
  );
  const scheduler = await createUserWithRole(
    "scheduler@clearpathdx.com", "Amanda Foster", "SCHEDULER", clearpath.id
  );
  const accountMgr = await createUserWithRole(
    "accounts@clearpathdx.com", "Carlos Mendez", "ACCOUNT_MANAGER", clearpath.id
  );

  // Set accountMgr as account manager for ABA and Peds orgs
  await prisma.organization.update({
    where: { id: brightFutures.id },
    data: { accountManagerId: accountMgr.id },
  });
  await prisma.organization.update({
    where: { id: valleyPeds.id },
    data: { accountManagerId: accountMgr.id },
  });

  const communityDev = await createUserWithRole(
    "community@clearpathdx.com", "Rachel Green", "COMMUNITY_DEVELOPMENT_MANAGER", clearpath.id
  );
  const psychologist = await createUserWithRole(
    "dr.psych@clearpathdx.com", "Dr. Emily Watson", "PSYCHOLOGIST", clearpath.id,
    { phone: "+1-555-100-1001" }
  );
  const psychometrist = await createUserWithRole(
    "psychometrist@clearpathdx.com", "James Park", "PSYCHOMETRIST", clearpath.id,
    { phone: "+1-555-100-1002" }
  );
  const abaAdmin = await createUserWithRole(
    "aba.admin@brightfutures.com", "Lisa Chang", "ABA_PROVIDER_ADMIN", brightFutures.id
  );
  const abaStaff = await createUserWithRole(
    "aba.staff@brightfutures.com", "Michael Torres", "ABA_PROVIDER_STAFF", brightFutures.id
  );
  const pedAdmin = await createUserWithRole(
    "dr.peds@valleypeds.com", "Dr. Robert Patel", "PEDIATRICIAN_ADMIN", valleyPeds.id
  );
  const parent = await createUserWithRole(
    "parent@example.com", "Maria Gonzalez", "PARENT_GUARDIAN", clearpath.id,
    { phone: "+1-555-600-0001" }
  );

  console.log("  ✓ 13 users created with org memberships");

  // ============================================================
  // 3. PROVIDER PROFILES + AVAILABILITY
  // ============================================================
  const psychProfile = await prisma.providerProfile.create({
    data: {
      userId: psychologist.id,
      organizationId: clearpath.id,
      providerType: "PSYCHOLOGIST",
      licenseNumber: "PSY-TX-12345",
      licenseState: "TX",
      npiNumber: "1122334455",
      specialties: ["Autism Spectrum Disorder", "ADHD", "Learning Disabilities"],
      yearsExperience: 12,
      bio: "Dr. Watson specializes in neurodevelopmental assessments for children ages 2-18.",
      maxWeeklyCases: 8,
      currentWeeklyCases: 3,
      isAcceptingCases: true,
      serviceRadius: 30,
      serviceZipCodes: ["78701", "78702", "78703", "78704"],
    },
  });

  const psychomProfile = await prisma.providerProfile.create({
    data: {
      userId: psychometrist.id,
      organizationId: clearpath.id,
      providerType: "PSYCHOMETRIST",
      licenseNumber: "PSM-TX-67890",
      licenseState: "TX",
      specialties: ["Cognitive Testing", "Academic Assessment"],
      yearsExperience: 5,
      bio: "James administers and scores standardized cognitive and academic assessments.",
      maxWeeklyCases: 10,
      currentWeeklyCases: 4,
      isAcceptingCases: true,
      serviceRadius: 25,
      serviceZipCodes: ["78701", "78702", "78703"],
    },
  });

  // Availability for psychologist (Mon, Tue, Wed, Thu mornings)
  const days = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY"] as const;
  for (const day of days) {
    await prisma.providerAvailability.create({
      data: {
        providerId: psychProfile.id,
        dayOfWeek: day,
        startTime: "09:00",
        endTime: "13:00",
        isRecurring: true,
      },
    });
  }

  // Availability for psychometrist (Mon-Fri full days)
  const weekdays = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"] as const;
  for (const day of weekdays) {
    await prisma.providerAvailability.create({
      data: {
        providerId: psychomProfile.id,
        dayOfWeek: day,
        startTime: "08:00",
        endTime: "17:00",
        isRecurring: true,
      },
    });
  }

  console.log("  ✓ 2 provider profiles + 9 availability slots created");

  // ============================================================
  // 4. REFERRAL SOURCES
  // ============================================================
  const abaFaxSource = await prisma.referralSource.create({
    data: {
      organizationId: brightFutures.id,
      channel: "FAX",
      identifier: "+1-555-200-0002",
      label: "Bright Futures Main Fax",
      isActive: true,
    },
  });

  const abaPortalSource = await prisma.referralSource.create({
    data: {
      organizationId: brightFutures.id,
      channel: "PORTAL",
      identifier: "brightfutures-portal",
      label: "Bright Futures Portal",
      isActive: true,
    },
  });

  const pedFaxSource = await prisma.referralSource.create({
    data: {
      organizationId: valleyPeds.id,
      channel: "FAX",
      identifier: "+1-555-300-0002",
      label: "Valley Pediatrics Fax",
      isActive: true,
    },
  });

  console.log("  ✓ 3 referral sources created");

  // ============================================================
  // 5. REFERRALS across the full lifecycle
  // ============================================================
  let refSeq = 1000;
  function nextRefNum() {
    return `REF-${++refSeq}`;
  }

  const now = new Date();
  const daysAgo = (d: number) => new Date(now.getTime() - d * 86400000);

  // Referral 1: RECEIVED (brand new)
  const ref1 = await prisma.referral.create({
    data: {
      referralNumber: nextRefNum(),
      status: "RECEIVED",
      channel: "FAX",
      referralSourceId: abaFaxSource.id,
      referringOrgId: brightFutures.id,
      priority: "STANDARD",
      childFirstName: "Ethan",
      childLastName: "Rodriguez",
      childAge: 5,
      reasonForReferral: "Concerns about social interaction and repetitive behaviors. Teachers report difficulty with transitions.",
      insuranceInfo: "Blue Cross Blue Shield - Policy #BCB-2024-5678",
      receivedAt: daysAgo(1),
    },
  });

  // Referral 2: RECEIVED (urgent)
  const ref2 = await prisma.referral.create({
    data: {
      referralNumber: nextRefNum(),
      status: "RECEIVED",
      channel: "PHONE",
      referringOrgId: valleyPeds.id,
      referralSourceId: pedFaxSource.id,
      priority: "URGENT",
      childFirstName: "Sophia",
      childLastName: "Williams",
      childAge: 3,
      childDateOfBirth: new Date("2023-03-15"),
      reasonForReferral: "Significant speech delay, no two-word combinations. Pediatrician recommends evaluation ASAP.",
      insuranceInfo: "Aetna - Policy #AET-2024-9012",
      receivedAt: daysAgo(0),
    },
  });

  // Referral 3: INTAKE_IN_PROGRESS
  const ref3 = await prisma.referral.create({
    data: {
      referralNumber: nextRefNum(),
      status: "INTAKE_IN_PROGRESS",
      channel: "PORTAL",
      referralSourceId: abaPortalSource.id,
      referringOrgId: brightFutures.id,
      priority: "STANDARD",
      childFirstName: "Liam",
      childLastName: "Chen",
      childAge: 7,
      childDateOfBirth: new Date("2019-06-20"),
      reasonForReferral: "Behavioral concerns at school. Difficulty with attention and following multi-step directions.",
      insuranceInfo: "Cigna - Policy #CIG-2024-3456",
      receivedAt: daysAgo(5),
      intakeStartedAt: daysAgo(3),
    },
  });

  // Referral 4: PARENT_CONTACTED
  const ref4 = await prisma.referral.create({
    data: {
      referralNumber: nextRefNum(),
      status: "PARENT_CONTACTED",
      channel: "FAX",
      referralSourceId: pedFaxSource.id,
      referringOrgId: valleyPeds.id,
      priority: "STANDARD",
      childFirstName: "Olivia",
      childLastName: "Martinez",
      childAge: 4,
      childDateOfBirth: new Date("2022-01-10"),
      reasonForReferral: "Suspected autism spectrum disorder. Limited eye contact, limited verbal communication.",
      insuranceInfo: "UnitedHealthcare - Policy #UHC-2024-7890",
      receivedAt: daysAgo(10),
      intakeStartedAt: daysAgo(8),
      parentContactedAt: daysAgo(6),
    },
  });

  // Referral 5: READY_TO_SCHEDULE
  const ref5 = await prisma.referral.create({
    data: {
      referralNumber: nextRefNum(),
      status: "READY_TO_SCHEDULE",
      channel: "PORTAL",
      referralSourceId: abaPortalSource.id,
      referringOrgId: brightFutures.id,
      priority: "EXPEDITED",
      childFirstName: "Noah",
      childLastName: "Johnson",
      childAge: 6,
      childDateOfBirth: new Date("2020-04-12"),
      reasonForReferral: "Re-evaluation requested. Previous diagnosis at age 3, needs updated assessment for school IEP.",
      insuranceInfo: "Humana - Policy #HUM-2024-1234",
      receivedAt: daysAgo(14),
      intakeStartedAt: daysAgo(12),
      parentContactedAt: daysAgo(10),
    },
  });

  // Referral 6: INTERVIEW_SCHEDULED
  const ref6 = await prisma.referral.create({
    data: {
      referralNumber: nextRefNum(),
      status: "INTERVIEW_SCHEDULED",
      channel: "EMAIL",
      referringOrgId: valleyPeds.id,
      priority: "STANDARD",
      childFirstName: "Emma",
      childLastName: "Davis",
      childAge: 8,
      childDateOfBirth: new Date("2018-09-05"),
      reasonForReferral: "Difficulty with reading and writing. School requests evaluation for learning disabilities.",
      insuranceInfo: "Blue Cross Blue Shield - Policy #BCB-2024-5555",
      receivedAt: daysAgo(21),
      intakeStartedAt: daysAgo(19),
      parentContactedAt: daysAgo(17),
    },
  });

  // Referral 7: INTERVIEW_COMPLETED
  const ref7 = await prisma.referral.create({
    data: {
      referralNumber: nextRefNum(),
      status: "INTERVIEW_COMPLETED",
      channel: "FAX",
      referralSourceId: abaFaxSource.id,
      referringOrgId: brightFutures.id,
      priority: "STANDARD",
      childFirstName: "Ava",
      childLastName: "Wilson",
      childAge: 5,
      childDateOfBirth: new Date("2021-07-22"),
      reasonForReferral: "Sensory processing concerns, difficulty with peer interactions.",
      insuranceInfo: "Aetna - Policy #AET-2024-6677",
      receivedAt: daysAgo(30),
      intakeStartedAt: daysAgo(28),
      parentContactedAt: daysAgo(25),
    },
  });

  // Referral 8: REPORT_IN_REVIEW
  const ref8 = await prisma.referral.create({
    data: {
      referralNumber: nextRefNum(),
      status: "REPORT_IN_REVIEW",
      channel: "PORTAL",
      referralSourceId: abaPortalSource.id,
      referringOrgId: brightFutures.id,
      priority: "STANDARD",
      childFirstName: "Lucas",
      childLastName: "Brown",
      childAge: 9,
      childDateOfBirth: new Date("2017-03-18"),
      reasonForReferral: "Academic struggles, possible ADHD. Teacher reports difficulty staying on task.",
      insuranceInfo: "Cigna - Policy #CIG-2024-8899",
      receivedAt: daysAgo(45),
      intakeStartedAt: daysAgo(43),
      parentContactedAt: daysAgo(40),
    },
  });

  // Referral 9: DIAGNOSIS_COMPLETE
  const ref9 = await prisma.referral.create({
    data: {
      referralNumber: nextRefNum(),
      status: "DIAGNOSIS_COMPLETE",
      channel: "FAX",
      referralSourceId: pedFaxSource.id,
      referringOrgId: valleyPeds.id,
      priority: "STANDARD",
      childFirstName: "Isabella",
      childLastName: "Garcia",
      childAge: 4,
      childDateOfBirth: new Date("2022-05-30"),
      reasonForReferral: "Developmental delay concerns. Limited verbal skills for age.",
      insuranceInfo: "UnitedHealthcare - Policy #UHC-2024-3344",
      receivedAt: daysAgo(60),
      intakeStartedAt: daysAgo(58),
      parentContactedAt: daysAgo(55),
    },
  });

  // Referral 10: CLOSED
  const ref10 = await prisma.referral.create({
    data: {
      referralNumber: nextRefNum(),
      status: "CLOSED",
      channel: "PHONE",
      referringOrgId: valleyPeds.id,
      priority: "STANDARD",
      childFirstName: "Mason",
      childLastName: "Taylor",
      childAge: 6,
      childDateOfBirth: new Date("2020-11-08"),
      reasonForReferral: "Behavioral assessment requested.",
      receivedAt: daysAgo(90),
      intakeStartedAt: daysAgo(88),
      parentContactedAt: daysAgo(85),
      closedAt: daysAgo(30),
      closedReason: "Evaluation complete, report delivered to family and referring provider.",
    },
  });

  console.log("  ✓ 10 referrals created across lifecycle");

  // ============================================================
  // 6. REFERRAL STATUS HISTORY (for key referrals)
  // ============================================================
  async function addStatusHistory(referralId: string, transitions: { from?: string; to: string; daysAgoVal: number }[]) {
    for (const t of transitions) {
      await prisma.referralStatusHistory.create({
        data: {
          referralId,
          fromStatus: t.from as any,
          toStatus: t.to as any,
          changedBy: intakeCoord.id,
          changedAt: daysAgo(t.daysAgoVal),
        },
      });
    }
  }

  await addStatusHistory(ref6.id, [
    { to: "RECEIVED", daysAgoVal: 21 },
    { from: "RECEIVED", to: "INTAKE_IN_PROGRESS", daysAgoVal: 19 },
    { from: "INTAKE_IN_PROGRESS", to: "PARENT_CONTACTED", daysAgoVal: 17 },
    { from: "PARENT_CONTACTED", to: "READY_TO_SCHEDULE", daysAgoVal: 15 },
    { from: "READY_TO_SCHEDULE", to: "INTERVIEW_SCHEDULED", daysAgoVal: 12 },
  ]);

  await addStatusHistory(ref9.id, [
    { to: "RECEIVED", daysAgoVal: 60 },
    { from: "RECEIVED", to: "INTAKE_IN_PROGRESS", daysAgoVal: 58 },
    { from: "INTAKE_IN_PROGRESS", to: "PARENT_CONTACTED", daysAgoVal: 55 },
    { from: "PARENT_CONTACTED", to: "READY_TO_SCHEDULE", daysAgoVal: 50 },
    { from: "READY_TO_SCHEDULE", to: "INTERVIEW_SCHEDULED", daysAgoVal: 45 },
    { from: "INTERVIEW_SCHEDULED", to: "INTERVIEW_COMPLETED", daysAgoVal: 38 },
    { from: "INTERVIEW_COMPLETED", to: "REPORT_IN_REVIEW", daysAgoVal: 30 },
    { from: "REPORT_IN_REVIEW", to: "REPORT_APPROVED", daysAgoVal: 25 },
    { from: "REPORT_APPROVED", to: "BILLING_SUBMITTED", daysAgoVal: 22 },
    { from: "BILLING_SUBMITTED", to: "DIAGNOSIS_COMPLETE", daysAgoVal: 15 },
  ]);

  console.log("  ✓ Referral status histories created");

  // ============================================================
  // 7. CLIENTS + GUARDIANS (from referrals that progressed past intake)
  // ============================================================
  const client4 = await prisma.client.create({
    data: {
      referralId: ref4.id,
      referringOrgId: valleyPeds.id,
      firstName: "Olivia",
      lastName: "Martinez",
      dateOfBirth: new Date("2022-01-10"),
      gender: "Female",
      primaryLanguage: "English/Spanish",
      address: "456 Oak Street",
      city: "Austin",
      state: "TX",
      zipCode: "78703",
      insuranceProvider: "UnitedHealthcare",
      insurancePolicyId: "UHC-2024-7890",
    },
  });

  const client5 = await prisma.client.create({
    data: {
      referralId: ref5.id,
      referringOrgId: brightFutures.id,
      firstName: "Noah",
      lastName: "Johnson",
      dateOfBirth: new Date("2020-04-12"),
      gender: "Male",
      primaryLanguage: "English",
      schoolName: "Lincoln Elementary",
      grade: "1st",
      address: "789 Maple Ave",
      city: "Austin",
      state: "TX",
      zipCode: "78704",
      insuranceProvider: "Humana",
      insurancePolicyId: "HUM-2024-1234",
    },
  });

  const client6 = await prisma.client.create({
    data: {
      referralId: ref6.id,
      referringOrgId: valleyPeds.id,
      firstName: "Emma",
      lastName: "Davis",
      dateOfBirth: new Date("2018-09-05"),
      gender: "Female",
      primaryLanguage: "English",
      schoolName: "Lincoln Elementary",
      grade: "3rd",
      address: "321 Elm Street",
      city: "Austin",
      state: "TX",
      zipCode: "78701",
      insuranceProvider: "Blue Cross Blue Shield",
      insurancePolicyId: "BCB-2024-5555",
    },
  });

  const client7 = await prisma.client.create({
    data: {
      referralId: ref7.id,
      referringOrgId: brightFutures.id,
      firstName: "Ava",
      lastName: "Wilson",
      dateOfBirth: new Date("2021-07-22"),
      gender: "Female",
      primaryLanguage: "English",
      address: "654 Pine Road",
      city: "Austin",
      state: "TX",
      zipCode: "78702",
      insuranceProvider: "Aetna",
      insurancePolicyId: "AET-2024-6677",
    },
  });

  const client8 = await prisma.client.create({
    data: {
      referralId: ref8.id,
      referringOrgId: brightFutures.id,
      firstName: "Lucas",
      lastName: "Brown",
      dateOfBirth: new Date("2017-03-18"),
      gender: "Male",
      primaryLanguage: "English",
      schoolName: "Lincoln Elementary",
      grade: "4th",
      address: "987 Cedar Lane",
      city: "Austin",
      state: "TX",
      zipCode: "78703",
      insuranceProvider: "Cigna",
      insurancePolicyId: "CIG-2024-8899",
    },
  });

  const client9 = await prisma.client.create({
    data: {
      referralId: ref9.id,
      referringOrgId: valleyPeds.id,
      firstName: "Isabella",
      lastName: "Garcia",
      dateOfBirth: new Date("2022-05-30"),
      gender: "Female",
      primaryLanguage: "Spanish",
      preferredName: "Bella",
      address: "147 Birch Blvd",
      city: "Austin",
      state: "TX",
      zipCode: "78704",
      insuranceProvider: "UnitedHealthcare",
      insurancePolicyId: "UHC-2024-3344",
    },
  });

  const client10 = await prisma.client.create({
    data: {
      referralId: ref10.id,
      referringOrgId: valleyPeds.id,
      firstName: "Mason",
      lastName: "Taylor",
      dateOfBirth: new Date("2020-11-08"),
      gender: "Male",
      primaryLanguage: "English",
      address: "258 Walnut Court",
      city: "Austin",
      state: "TX",
      zipCode: "78705",
    },
  });

  console.log("  ✓ 7 clients created");

  // Guardians
  await prisma.guardian.create({
    data: {
      clientId: client4.id,
      firstName: "Sofia",
      lastName: "Martinez",
      relationship: "Mother",
      email: "sofia.martinez@email.com",
      phone: "+1-555-601-0001",
      isPrimary: true,
    },
  });

  await prisma.guardian.create({
    data: {
      clientId: client5.id,
      firstName: "Jennifer",
      lastName: "Johnson",
      relationship: "Mother",
      email: "jennifer.johnson@email.com",
      phone: "+1-555-602-0001",
      isPrimary: true,
    },
  });

  await prisma.guardian.create({
    data: {
      clientId: client6.id,
      firstName: "Robert",
      lastName: "Davis",
      relationship: "Father",
      email: "robert.davis@email.com",
      phone: "+1-555-603-0001",
      isPrimary: true,
    },
  });

  await prisma.guardian.create({
    data: {
      clientId: client7.id,
      firstName: "Karen",
      lastName: "Wilson",
      relationship: "Mother",
      email: "karen.wilson@email.com",
      phone: "+1-555-604-0001",
      isPrimary: true,
    },
  });

  await prisma.guardian.create({
    data: {
      clientId: client8.id,
      firstName: "Thomas",
      lastName: "Brown",
      relationship: "Father",
      email: "thomas.brown@email.com",
      phone: "+1-555-605-0001",
      isPrimary: true,
    },
  });

  // Isabella Garcia's guardian is the parent user (Maria Gonzalez)
  await prisma.guardian.create({
    data: {
      clientId: client9.id,
      userId: parent.id,
      firstName: "Maria",
      lastName: "Gonzalez",
      relationship: "Mother",
      email: "parent@example.com",
      phone: "+1-555-600-0001",
      isPrimary: true,
    },
  });

  await prisma.guardian.create({
    data: {
      clientId: client9.id,
      firstName: "Jose",
      lastName: "Garcia",
      relationship: "Father",
      email: "jose.garcia@email.com",
      phone: "+1-555-606-0001",
      isPrimary: false,
    },
  });

  await prisma.guardian.create({
    data: {
      clientId: client10.id,
      firstName: "Linda",
      lastName: "Taylor",
      relationship: "Mother",
      email: "linda.taylor@email.com",
      phone: "+1-555-607-0001",
      isPrimary: true,
    },
  });

  console.log("  ✓ 8 guardians created");

  // ============================================================
  // 8. DIAGNOSTIC CASES
  // ============================================================
  let caseSeq = 2000;
  function nextCaseNum() {
    return `CASE-${++caseSeq}`;
  }

  // Case 1: Emma Davis - INTERVIEW_SCHEDULED (active, fully assigned)
  const case1 = await prisma.diagnosticCase.create({
    data: {
      caseNumber: nextCaseNum(),
      referralId: ref6.id,
      clientId: client6.id,
      priority: "STANDARD",
      coordinatorId: intakeCoord.id,
      schedulerId: scheduler.id,
      psychologistId: psychProfile.id,
      psychometristId: psychomProfile.id,
      targetCompletionDate: daysAgo(-14),
      notes: "Parent interview scheduled for next week. School observation pending.",
    },
  });

  // Case 2: Ava Wilson - INTERVIEW_COMPLETED (report pending)
  const case2 = await prisma.diagnosticCase.create({
    data: {
      caseNumber: nextCaseNum(),
      referralId: ref7.id,
      clientId: client7.id,
      priority: "STANDARD",
      coordinatorId: intakeCoord.id,
      schedulerId: scheduler.id,
      psychologistId: psychProfile.id,
      psychometristId: psychomProfile.id,
      targetCompletionDate: daysAgo(-7),
      notes: "All interviews completed. Dr. Watson working on report.",
    },
  });

  // Case 3: Lucas Brown - REPORT_IN_REVIEW
  const case3 = await prisma.diagnosticCase.create({
    data: {
      caseNumber: nextCaseNum(),
      referralId: ref8.id,
      clientId: client8.id,
      priority: "STANDARD",
      coordinatorId: intakeCoord.id,
      schedulerId: scheduler.id,
      psychologistId: psychProfile.id,
      targetCompletionDate: daysAgo(-3),
      notes: "Report submitted for peer review.",
    },
  });

  // Case 4: Isabella Garcia - DIAGNOSIS_COMPLETE
  const case4 = await prisma.diagnosticCase.create({
    data: {
      caseNumber: nextCaseNum(),
      referralId: ref9.id,
      clientId: client9.id,
      priority: "STANDARD",
      coordinatorId: intakeCoord.id,
      schedulerId: scheduler.id,
      psychologistId: psychProfile.id,
      psychometristId: psychomProfile.id,
      targetCompletionDate: daysAgo(5),
      actualCompletionDate: daysAgo(15),
      notes: "Diagnosis: Autism Spectrum Disorder, Level 2. Report delivered to family.",
    },
  });

  // Case 5: Mason Taylor - CLOSED
  const case5 = await prisma.diagnosticCase.create({
    data: {
      caseNumber: nextCaseNum(),
      referralId: ref10.id,
      clientId: client10.id,
      priority: "STANDARD",
      coordinatorId: intakeCoord.id,
      psychologistId: psychProfile.id,
      actualCompletionDate: daysAgo(30),
    },
  });

  console.log("  ✓ 5 diagnostic cases created");

  // ============================================================
  // 9. INTERVIEW EVENTS
  // ============================================================
  // Case 1: Upcoming parent interview
  await prisma.interviewEvent.create({
    data: {
      caseId: case1.id,
      providerId: psychProfile.id,
      interviewType: "PARENT_INTERVIEW",
      scheduledStart: daysAgo(-3),
      scheduledEnd: new Date(daysAgo(-3).getTime() + 90 * 60000),
      location: "ClearPath Diagnostics Office",
      notes: "Parent interview with Emma's father.",
    },
  });

  // Case 1: Upcoming testing session
  await prisma.interviewEvent.create({
    data: {
      caseId: case1.id,
      providerId: psychomProfile.id,
      interviewType: "TESTING_SESSION",
      scheduledStart: daysAgo(-5),
      scheduledEnd: new Date(daysAgo(-5).getTime() + 180 * 60000),
      location: "ClearPath Diagnostics Office",
      notes: "Cognitive and academic testing battery.",
    },
  });

  // Case 2: Completed parent interview
  await prisma.interviewEvent.create({
    data: {
      caseId: case2.id,
      providerId: psychProfile.id,
      interviewType: "PARENT_INTERVIEW",
      scheduledStart: daysAgo(10),
      scheduledEnd: new Date(daysAgo(10).getTime() + 90 * 60000),
      actualStart: daysAgo(10),
      actualEnd: new Date(daysAgo(10).getTime() + 75 * 60000),
      location: "ClearPath Diagnostics Office",
      isCompleted: true,
      notes: "Parent interview completed. Concerns about sensory processing confirmed.",
    },
  });

  // Case 4: Completed school observation
  await prisma.interviewEvent.create({
    data: {
      caseId: case4.id,
      providerId: psychProfile.id,
      interviewType: "SCHOOL_OBSERVATION",
      scheduledStart: daysAgo(40),
      scheduledEnd: new Date(daysAgo(40).getTime() + 120 * 60000),
      actualStart: daysAgo(40),
      actualEnd: new Date(daysAgo(40).getTime() + 110 * 60000),
      location: "Lincoln Elementary",
      isCompleted: true,
      notes: "Observed Isabella in classroom setting. Noted limited peer interaction.",
    },
  });

  console.log("  ✓ 4 interview events created");

  // ============================================================
  // 10. DIAGNOSTIC REPORTS
  // ============================================================
  // Report 1: DRAFT for case 2 (Ava Wilson)
  const report1 = await prisma.diagnosticReport.create({
    data: {
      caseId: case2.id,
      authorId: psychProfile.id,
      status: "DRAFT",
      reportContent: "# Diagnostic Evaluation Report\n\n## Client: Ava Wilson\n\n### Background\nAva is a 5-year-old female referred for evaluation due to sensory processing concerns...\n\n### Assessment Methods\n- ADOS-2 Module 2\n- Vineland-3\n- Sensory Profile-2\n\n### Results\n[In progress]",
      summary: "Initial draft of diagnostic evaluation for sensory processing concerns.",
      diagnoses: ["Sensory Processing Disorder (provisional)"],
    },
  });

  // Report 2: IN_REVIEW for case 3 (Lucas Brown)
  const report2 = await prisma.diagnosticReport.create({
    data: {
      caseId: case3.id,
      authorId: psychProfile.id,
      status: "IN_REVIEW",
      reportContent: "# Diagnostic Evaluation Report\n\n## Client: Lucas Brown\n\n### Background\nLucas is a 9-year-old male referred for evaluation due to academic struggles and suspected ADHD...\n\n### Assessment Methods\n- WISC-V\n- WIAT-4\n- Conners-4\n- CPT-3\n\n### Results\nCognitive testing reveals average overall intelligence (FSIQ = 102). Significant weaknesses in processing speed and working memory. Attention measures consistent with ADHD presentation.\n\n### Diagnostic Impressions\n- ADHD, Combined Presentation (F90.2)\n\n### Recommendations\n1. 504 accommodations plan\n2. Behavioral intervention\n3. Consider medication consultation with pediatrician",
      summary: "Comprehensive evaluation supporting ADHD diagnosis with academic accommodations recommended.",
      diagnoses: ["ADHD, Combined Presentation (F90.2)"],
      recommendations: "1. 504 accommodations plan including extended time, preferential seating, and movement breaks\n2. Behavioral intervention targeting organization and task completion\n3. Medication consultation with referring pediatrician\n4. Follow-up evaluation in 12 months",
      submittedAt: daysAgo(5),
    },
  });

  // Review queue item for report 2
  await prisma.reportReviewQueueItem.create({
    data: {
      reportId: report2.id,
      reviewerId: psychProfile.id,
      assignedAt: daysAgo(5),
      reviewNotes: "Pending peer review.",
    },
  });

  // Report 3: APPROVED for case 4 (Isabella Garcia)
  await prisma.diagnosticReport.create({
    data: {
      caseId: case4.id,
      authorId: psychProfile.id,
      status: "APPROVED",
      reportContent: "# Diagnostic Evaluation Report\n\n## Client: Isabella Garcia\n\n[Full report content]",
      summary: "Autism Spectrum Disorder diagnosis confirmed through comprehensive evaluation.",
      diagnoses: ["Autism Spectrum Disorder, Level 2 (F84.0)"],
      recommendations: "1. Applied Behavior Analysis (ABA) therapy\n2. Speech-language therapy\n3. Occupational therapy for sensory processing\n4. Re-evaluation in 18 months",
      submittedAt: daysAgo(25),
      approvedAt: daysAgo(20),
      deliveredAt: daysAgo(18),
    },
  });

  console.log("  ✓ 3 diagnostic reports created");

  // ============================================================
  // 11. BILLING RECORDS
  // ============================================================
  await prisma.billingRecord.create({
    data: {
      caseId: case3.id,
      organizationId: clearpath.id,
      status: "PENDING",
      cptCode: "96136",
      billedAmount: 275.00,
      payerName: "Cigna",
      claimNumber: "CLM-2024-001",
      notes: "Psychological testing - first hour",
    },
  });

  await prisma.billingRecord.create({
    data: {
      caseId: case4.id,
      organizationId: clearpath.id,
      status: "SUBMITTED",
      cptCode: "96130",
      billedAmount: 350.00,
      allowedAmount: 320.00,
      payerName: "UnitedHealthcare",
      claimNumber: "CLM-2024-002",
      submittedAt: daysAgo(18),
      notes: "Psychological evaluation",
    },
  });

  await prisma.billingRecord.create({
    data: {
      caseId: case5.id,
      organizationId: clearpath.id,
      status: "PAID",
      cptCode: "96131",
      billedAmount: 300.00,
      allowedAmount: 280.00,
      paidAmount: 280.00,
      payerName: "Aetna",
      claimNumber: "CLM-2024-003",
      submittedAt: daysAgo(60),
      paidAt: daysAgo(35),
      notes: "Psychological evaluation - each additional hour",
    },
  });

  console.log("  ✓ 3 billing records created");

  // ============================================================
  // 12. PROVIDER PAYOUT LEDGER
  // ============================================================
  await prisma.providerPayoutLedger.create({
    data: {
      caseId: case4.id,
      providerId: psychProfile.id,
      status: "PENDING",
      amount: 450.00,
      description: "Diagnostic evaluation - Isabella Garcia (CASE-2004)",
    },
  });

  await prisma.providerPayoutLedger.create({
    data: {
      caseId: case5.id,
      providerId: psychProfile.id,
      status: "PAID",
      amount: 400.00,
      description: "Diagnostic evaluation - Mason Taylor (CASE-2005)",
      approvedBy: financeAdmin.id,
      approvedAt: daysAgo(28),
      paidAt: daysAgo(25),
      paymentRef: "PAY-2024-0001",
    },
  });

  console.log("  ✓ 2 payout ledger entries created");

  // ============================================================
  // 13. CARE COORDINATION FLAGS
  // ============================================================
  await prisma.careCoordinationFlag.create({
    data: {
      clientId: client6.id,
      caseId: case1.id,
      severity: "WARNING",
      title: "Insurance authorization expiring",
      description: "Insurance pre-authorization expires in 10 days. Need to complete evaluation before expiry.",
    },
  });

  await prisma.careCoordinationFlag.create({
    data: {
      clientId: client9.id,
      caseId: case4.id,
      severity: "INFO",
      title: "Spanish interpreter needed",
      description: "Family's primary language is Spanish. Interpreter needed for feedback session.",
      isResolved: true,
      resolvedBy: intakeCoord.id,
      resolvedAt: daysAgo(20),
    },
  });

  await prisma.careCoordinationFlag.create({
    data: {
      clientId: client8.id,
      caseId: case3.id,
      severity: "URGENT",
      title: "School IEP meeting deadline",
      description: "School has an IEP meeting scheduled in 2 weeks. Report must be completed before then.",
    },
  });

  console.log("  ✓ 3 care coordination flags created");

  // ============================================================
  // 14. SCHOOL CONTACTS + PEDIATRICIAN PREFERENCES
  // ============================================================
  await prisma.schoolContact.create({
    data: {
      organizationId: lincolnSchool.id,
      name: "Patricia Hernandez",
      title: "Special Education Coordinator",
      email: "p.hernandez@lincoln-elem.edu",
      phone: "+1-555-400-0010",
      preferredContactMethod: "email",
    },
  });

  await prisma.pediatricianContactPreference.create({
    data: {
      organizationId: valleyPeds.id,
      prefersFax: true,
      prefersEmail: true,
      prefersPortal: false,
      prefersPhone: false,
      faxNumber: "+1-555-300-0002",
      emailAddress: "reports@valleypeds.com",
      notes: "Prefers receiving reports via secure fax. Email for non-PHI correspondence.",
    },
  });

  console.log("  ✓ School contacts + pediatrician preferences created");

  // ============================================================
  // 15. AUDIT LOG ENTRIES
  // ============================================================
  const auditEntries = [
    { actorId: superAdmin.id, action: "LOGIN" as const, resource: "SESSION", metadata: { ip: "192.168.1.100" }, createdAt: daysAgo(1) },
    { actorId: intakeCoord.id, action: "CREATE" as const, resource: "REFERRAL", resourceId: ref1.id, newValues: { referralNumber: ref1.referralNumber }, createdAt: daysAgo(1) },
    { actorId: intakeCoord.id, action: "CREATE" as const, resource: "REFERRAL", resourceId: ref2.id, newValues: { referralNumber: ref2.referralNumber }, createdAt: daysAgo(0) },
    { actorId: intakeCoord.id, action: "UPDATE" as const, resource: "REFERRAL", resourceId: ref3.id, oldValues: { status: "RECEIVED" }, newValues: { status: "INTAKE_IN_PROGRESS" }, createdAt: daysAgo(3) },
    { actorId: admin.id, action: "CREATE" as const, resource: "USER", resourceId: abaStaff.id, newValues: { email: abaStaff.email }, createdAt: daysAgo(10) },
    { actorId: psychologist.id, action: "READ_PHI" as const, resource: "CLIENT", resourceId: client8.id, metadata: { field: "diagnosticReport" }, createdAt: daysAgo(5) },
    { actorId: financeAdmin.id, action: "UPDATE" as const, resource: "PAYOUT", newValues: { status: "PAID" }, createdAt: daysAgo(25) },
    { actorId: abaAdmin.id, action: "LOGIN" as const, resource: "SESSION", metadata: { ip: "10.0.0.50" }, createdAt: daysAgo(2) },
  ];

  for (const entry of auditEntries) {
    await prisma.auditLog.create({
      data: {
        actorId: entry.actorId,
        action: entry.action,
        resource: entry.resource,
        resourceId: entry.resourceId ?? null,
        oldValues: entry.oldValues ?? undefined,
        newValues: entry.newValues ?? undefined,
        metadata: entry.metadata ?? undefined,
        createdAt: entry.createdAt,
      },
    });
  }

  console.log("  ✓ 8 audit log entries created");

  console.log("\n✅ Seed complete!\n");
  console.log("Test accounts (password: password123):");
  console.log("  Super Admin:  super.admin@clearpathdx.com");
  console.log("  Admin:        admin@clearpathdx.com");
  console.log("  Intake:       intake@clearpathdx.com");
  console.log("  Scheduler:    scheduler@clearpathdx.com");
  console.log("  Psychologist: dr.psych@clearpathdx.com");
  console.log("  ABA Admin:    aba.admin@brightfutures.com");
  console.log("  Parent:       parent@example.com");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
