---
pdf_options:
  format: Letter
  margin: 25mm
  displayHeaderFooter: true
  headerTemplate: '<div style="font-size:8px;width:100%;text-align:center;color:#999;">ClearPath Dx — Platform Walkthrough Guide</div>'
  footerTemplate: '<div style="font-size:8px;width:100%;text-align:center;color:#999;">Page <span class="pageNumber"></span> of <span class="totalPages"></span></div>'
---

# ClearPath Dx — Platform Walkthrough Guide

**Version:** March 2026
**Platform URL:** https://clear-path-dx-platform.vercel.app
**Marketing Site:** https://clear-path-dx-marketing.vercel.app

---

## Quick Start

**Login URL:** https://clear-path-dx-platform.vercel.app/auth/login

All demo accounts use the password: **`p1zz4andfl!ght$`**

Three login methods are available:
1. **Password** — Email + password (default tab)
2. **Magic Link** — Sends a sign-in link to your email
3. **SMS** — Sends a verification code to your phone

---

## Demo Accounts

| Role | Email | Name |
|------|-------|------|
| Super Admin | `jon@jonspencer.us` | Jon Spencer |
| Super Admin | `justin@whisperlabs.com` | Justin Blanchard |
| Finance Admin | `finance@clearpathdx.com` | Marcus Rivera |
| Admin | `admin@clearpathdx.com` | Jessica Thompson |
| Intake Coordinator | `intake@clearpathdx.com` | David Kim |
| Scheduler | `scheduler@clearpathdx.com` | Amanda Foster |
| Account Manager | `accounts@clearpathdx.com` | Carlos Mendez |
| Community Dev Manager | `community@clearpathdx.com` | Rachel Green |
| Psychologist | `dr.psych@clearpathdx.com` | Dr. Emily Watson |
| Psychometrist | `psychometrist@clearpathdx.com` | James Park |
| ABA Provider Admin | `aba.admin@brightfutures.com` | Lisa Chang |
| ABA Provider Staff | `aba.staff@brightfutures.com` | Michael Torres |
| Pediatrician Admin | `dr.peds@valleypeds.com` | Dr. Robert Patel |
| Parent / Guardian | `parent@example.com` | Maria Gonzalez |

---

## Referral Lifecycle

Every referral flows through these stages:

```
RECEIVED → INTAKE_IN_PROGRESS → PARENT_CONTACTED → READY_TO_SCHEDULE
→ INTERVIEW_SCHEDULED → INTERVIEW_COMPLETED → REPORT_IN_REVIEW
→ REPORT_APPROVED → BILLING_SUBMITTED → DIAGNOSIS_COMPLETE
→ REPORT_DELIVERED → CLOSED
```

---

\newpage

## 1. Super Admin

**Login:** `jon@jonspencer.us` / `p1zz4andfl!ght$`

The Super Admin has full access to every feature in the platform. This is the "god mode" account for system oversight.

### Dashboard
After login, you'll see the Super Admin dashboard with key metrics:
- **Total Referrals** (with pending count)
- **Total Clients**
- **Active Cases** (with reports in review)
- **Provider count**
- **Reports in Review**
- **Pending Billing**
- **Organizations**
- **Recent Activity** feed

### Walkthrough Steps

1. **Review the Dashboard**
   - Note the metric cards at the top
   - Scroll down to see the recent activity feed (audit log)

2. **Manage Referrals** → Sidebar: *Referrals*
   - View all referrals across all organizations
   - Click any referral to see full details (child info, status history, documents)
   - Try changing a referral's status to see the workflow progression

3. **View Clients** → Sidebar: *Clients*
   - Browse all clients in the system
   - Click a client to see their profile, guardians, linked referral, and case

4. **Manage Cases** → Sidebar: *Cases*
   - View all diagnostic cases
   - Cases show assigned providers (psychologist, psychometrist, coordinator)
   - Click a case to see interviews, reports, and care coordination flags

5. **Scheduling** → Sidebar: *Scheduling*
   - View all interview events
   - See provider availability
   - Create new interviews for existing cases

6. **Reports** → Sidebar: *Reports*
   - View all diagnostic reports
   - Filter by status: Draft, In Review, Approved, Delivered
   - Click a report to view content, diagnoses, and recommendations

7. **Providers** → Sidebar: *Providers*
   - View all provider profiles (psychologists and psychometrists)
   - See license info, specialties, capacity, accepting status
   - Edit provider details

8. **Organizations** → Sidebar: *Organizations*
   - View all partner organizations
   - Types: ABA Provider, Pediatrician, School, Billing Provider
   - Click to see org details, contacts, and linked referrals

9. **Coordinator Queue** → Sidebar: *My Queue*
   - See referrals awaiting parent contact
   - Log phone calls with notes
   - Advance referrals through pipeline stages

10. **Billing & Payouts** → Sidebar: *Billing* / *Payouts*
    - Review billing records with CPT codes
    - View provider payout ledger

11. **Audit Log** → Sidebar: *Audit Log*
    - See all system activity (creates, updates, logins, exports)
    - Filter by action type, user, or resource

12. **Settings** → Sidebar: *Settings*
    - Platform configuration options

---

\newpage

## 2. Admin (Operations Manager)

**Login:** `admin@clearpathdx.com` / `p1zz4andfl!ght$`

The Admin role manages day-to-day operations. Similar to Super Admin but without billing/payout management.

### Walkthrough Steps

1. **Dashboard** — Operational overview of referrals, cases, and providers
2. **Referrals** — Full CRUD access; create new referrals, update status, export
3. **Clients** — Manage client records, view guardians
4. **Cases** — Assign providers to cases, manage coordination
5. **Scheduling** — Oversee all interviews and provider availability
6. **Reports** — Review and approve diagnostic reports
7. **Providers** — Manage provider profiles and capacity
8. **Organizations** — Manage partner organizations
9. **My Queue** — Same coordinator queue as Super Admin
10. **Audit Log** — Review system activity

---

## 3. Finance Admin

**Login:** `finance@clearpathdx.com` / `p1zz4andfl!ght$`

Finance Admin focuses exclusively on billing and payouts.

### Walkthrough Steps

1. **Dashboard** — Financial metrics overview
2. **Billing** → Sidebar: *Billing*
   - View all billing records
   - See CPT codes (96130, 96131, 96136), billed amounts, claim numbers
   - Update billing status: PENDING → SUBMITTED → ACCEPTED/REJECTED → PAID
   - Track allowed amounts vs. billed amounts
3. **Payouts** → Sidebar: *Payouts*
   - View provider payout ledger
   - Approve pending payouts
   - Track payment references and payout dates
   - Status flow: PENDING → APPROVED → PAID
4. **Audit Log** — Review financial activity trail

---

\newpage

## 4. Intake Coordinator

**Login:** `intake@clearpathdx.com` / `p1zz4andfl!ght$`

The Intake Coordinator is the first person to work a new referral. Their job is to contact parents, gather information, and move referrals forward.

### Dashboard
Shows intake-specific metrics:
- **New Referrals** (RECEIVED status)
- **Intake In Progress**
- **Parent Contacted**
- **Ready to Schedule**
- **Recent Referrals** card with status badges

### Walkthrough Steps

1. **Check Dashboard** — See how many referrals need attention at each stage

2. **Open My Queue** → Sidebar: *My Queue*
   - This is the primary workspace for intake coordinators
   - Each card shows:
     - Child's name and referral number
     - Referring organization and time since received
     - Guardian name, phone, and email
     - Outreach history (attempts, last contact, response status)
     - Priority badges (Urgent, Expedited)

3. **Contact a Parent**
   - Find a referral in "RECEIVED" status
   - Click **Log Call** to record a phone call attempt
   - Add notes (e.g., "Left voicemail" or "Parent confirmed, prefers mornings")
   - Click **Save**

4. **Advance a Referral**
   - After successful contact, click **Next Stage**
   - Status progression: RECEIVED → INTAKE_IN_PROGRESS → PARENT_CONTACTED → READY_TO_SCHEDULE

5. **Filter the Queue**
   - Use the status tabs: All, Received, In Progress, Contacted
   - Use the search bar to find specific children or referral numbers

6. **View Full Referral Details** → Sidebar: *Referrals*
   - Click any referral for complete details
   - See status history, attached documents, outreach logs

7. **Manage Clients** → Sidebar: *Clients*
   - View client profiles and guardian contact info

---

\newpage

## 5. Scheduler

**Login:** `scheduler@clearpathdx.com` / `p1zz4andfl!ght$`

The Scheduler books interviews between providers and families once referrals are ready to schedule.

### Walkthrough Steps

1. **Dashboard** — See upcoming interviews, scheduled cases, provider availability

2. **Check Referrals** → Sidebar: *Referrals*
   - Look for referrals in "READY_TO_SCHEDULE" status
   - These are ready for interview booking

3. **View Provider Availability** → Sidebar: *Scheduling*
   - See which providers have open time slots
   - Dr. Emily Watson (Psychologist): Mon–Thu mornings
   - James Park (Psychometrist): Mon–Fri full days

4. **Schedule an Interview** → Sidebar: *Scheduling* → *New Interview*
   - Select a case
   - Choose interview type:
     - Parent Interview
     - Child Observation
     - School Observation
     - Testing Session
     - Feedback Session
   - Pick a provider and time slot
   - Add location and notes

5. **View Providers** → Sidebar: *Providers*
   - Check provider capacity (current vs. max weekly cases)
   - See if providers are accepting new cases
   - Review specialties and service areas

---

## 6. Account Manager

**Login:** `accounts@clearpathdx.com` / `p1zz4andfl!ght$`

Account Managers maintain relationships with partner organizations.

### Walkthrough Steps

1. **Dashboard** — Organization metrics, referral tracking
2. **Organizations** → Sidebar: *Organizations*
   - View partner organizations: Bright Futures ABA, Valley Pediatrics, Lincoln School, MedBill Pro
   - Click an organization to see contact info, referral history
3. **Referrals** — Track referral flow from partner organizations
4. **Clients** — View client records tied to partner orgs

---

\newpage

## 7. Community Development Manager

**Login:** `community@clearpathdx.com` / `p1zz4andfl!ght$`

Focuses on market development and organization partnerships.

### Walkthrough Steps

1. **Dashboard** — Organization health and referral pipeline
2. **Organizations** — View and manage partner organizations
3. **Referrals** — Monitor referral volume by source

---

## 8. Psychologist (Provider)

**Login:** `dr.psych@clearpathdx.com` / `p1zz4andfl!ght$`

Psychologists are the primary diagnosticians. They conduct evaluations, author reports, and deliver diagnoses.

### Dashboard
Shows provider-specific metrics:
- **Assigned Cases** (count)
- **Upcoming Interviews** (future, non-cancelled)
- **Draft Reports** (count)
- **Pending Payouts** (count)
- **Capacity:** Current Weekly Cases / Max Weekly Cases
- **Accepting Cases** status badge

### Walkthrough Steps

1. **Check Dashboard** — See your assigned caseload and upcoming schedule

2. **View Your Cases** → Sidebar: *Cases*
   - See only cases assigned to you
   - Click a case to see:
     - Child and family info
     - Interview schedule
     - Reports
     - Care coordination flags

3. **Check Your Schedule** → Sidebar: *Scheduling*
   - View upcoming interviews
   - See interview type, time, location, and notes

4. **Write a Report** → Sidebar: *Reports*
   - View your reports (Draft, In Review, Approved)
   - Create a new diagnostic report:
     - Select a case
     - Write findings, diagnoses, and recommendations
     - Save as Draft
   - Submit for review: change status from DRAFT → IN_REVIEW
   - After peer review: IN_REVIEW → APPROVED

5. **View Clients** → Sidebar: *Clients*
   - Read-only access to client profiles for your assigned cases

6. **Check Payouts** → Sidebar: *Payouts*
   - View your payout history
   - See pending, approved, and paid amounts

---

\newpage

## 9. Psychometrist (Provider)

**Login:** `psychometrist@clearpathdx.com` / `p1zz4andfl!ght$`

Psychometrists administer standardized tests and assist with evaluations. Similar to Psychologists but with read-only report access.

### Walkthrough Steps

1. **Dashboard** — Same provider dashboard (assigned cases, interviews, payouts, capacity)

2. **View Your Cases** → Sidebar: *Cases*
   - See cases you're assigned to as psychometrist
   - View interview schedule and care coordination flags

3. **Check Your Schedule** → Sidebar: *Scheduling*
   - View your upcoming testing sessions and observations

4. **View Reports** → Sidebar: *Reports*
   - Read-only access to reports on your assigned cases
   - You can see report content but cannot create or edit reports

5. **View Clients** → Sidebar: *Clients*
   - Read-only access to your assigned clients

6. **Check Payouts** → Sidebar: *Payouts*
   - View your payout history and pending amounts

---

## 10. ABA Provider Admin

**Login:** `aba.admin@brightfutures.com` / `p1zz4andfl!ght$`

ABA Provider Admins see only data related to their organization (Bright Futures ABA). They track referrals they've submitted and monitor diagnostic progress.

### Dashboard
Organization-scoped metrics:
- **Total Referrals** (for Bright Futures ABA only)
- **Active Referrals** (not closed/complete)
- **Completed Cases**
- **Reports Delivered**

### Walkthrough Steps

1. **Dashboard** — See your organization's referral and case metrics

2. **View Your Referrals** → Sidebar: *Referrals*
   - See only referrals from Bright Futures ABA
   - Track status progression for each child
   - Note: You can view but not create referrals

3. **View Clients** → Sidebar: *Clients*
   - See clients referred by your organization

4. **Organization Profile** → Sidebar: *Organizations*
   - View and update your organization's information

5. **View Users** → Sidebar: *Users*
   - See users in your organization

---

\newpage

## 11. ABA Provider Staff

**Login:** `aba.staff@brightfutures.com` / `p1zz4andfl!ght$`

ABA Provider Staff have a simplified view compared to their admin. They can track referrals and view clients but cannot manage org settings.

### Walkthrough Steps

1. **Dashboard** — Organization-scoped referral and case status
2. **Referrals** — View referrals from Bright Futures ABA
3. **Clients** — View clients referred by your organization

---

## 12. Pediatrician Admin

**Login:** `dr.peds@valleypeds.com` / `p1zz4andfl!ght$`

Pediatrician Admins represent referring pediatrician offices. They track diagnostic progress for children they've referred.

### Walkthrough Steps

1. **Dashboard** — See referral metrics for Valley Pediatrics

2. **View Referrals** → Sidebar: *Referrals*
   - See referrals originating from Valley Pediatrics
   - Track diagnostic status for each referred child

3. **View Clients** → Sidebar: *Clients*
   - See clients your practice has referred

4. **Organization Profile** → Sidebar: *Organizations*
   - View your practice information

---

\newpage

## 13. Parent / Guardian

**Login:** `parent@example.com` / `p1zz4andfl!ght$`

Parents have the most focused view — they see only their child's information. This is Maria Gonzalez, parent of Isabella Garcia.

### Dashboard
Child-focused view:
- **Title:** "Isabella's Progress" (child's first name)
- **Current Case Status** — referral status badge
- **Upcoming Appointments** — count
- **Report Status** — "Ready" or "In Progress"
- **Next 3 upcoming interviews** with formatted dates and times

### Walkthrough Steps

1. **View Dashboard** — See Isabella's current status
   - Check the referral status badge (where in the process you are)
   - See if any upcoming appointments are scheduled
   - Check if the diagnostic report is ready

2. **That's it!**
   - The parent portal is intentionally simple
   - Parents can view their child's progress but cannot modify anything
   - All scheduling, reporting, and communication is handled by ClearPath staff

---

## 14. Provider Registration (New User)

**URL:** https://clear-path-dx-platform.vercel.app/auth/register/provider
*(Also linked from the marketing site and the login page)*

This is the self-service onboarding flow for new psychometrists and psychologists.

### Walkthrough Steps

1. **Navigate to the registration page**
   - From the login page, click "Join the network" at the bottom
   - Or go directly to `/auth/register/provider`

2. **Step 1: Create Your Account**
   - Enter your full name
   - Enter your email address
   - Enter your phone number (optional)
   - Choose a password (minimum 8 characters)
   - Confirm your password
   - Click **Next**

3. **Step 2: Professional Details**
   - Select provider type: **Psychologist** or **Psychometrist**
   - Enter your license number (optional)
   - Enter your license state (optional, e.g., "TX")
   - Enter your NPI number (optional)
   - Enter your specialties (optional, e.g., "Autism, ADHD, Learning Disabilities")
   - Enter years of experience (optional)
   - Click **Create Account**

4. **Success!**
   - You'll see a "Registration Complete" confirmation
   - Click **Go to Sign In** to log in with your new credentials

---

\newpage

## End-to-End Demo Scenarios

### Scenario A: Full Referral-to-Report Flow

This walks through a referral from intake to final report delivery, touching multiple roles.

| Step | Role | Action |
|------|------|--------|
| 1 | Intake Coordinator | Open My Queue, find a new referral |
| 2 | Intake Coordinator | Click "Log Call", add notes about parent contact |
| 3 | Intake Coordinator | Click "Next Stage" to advance to PARENT_CONTACTED |
| 4 | Intake Coordinator | Click "Next Stage" again to advance to READY_TO_SCHEDULE |
| 5 | Scheduler | Go to Scheduling, create a new interview for the case |
| 6 | Psychologist | Check dashboard, see the new upcoming interview |
| 7 | Psychologist | After evaluation, go to Reports → create a new report |
| 8 | Psychologist | Write findings, save as Draft, then submit for review |
| 9 | Admin | Go to Reports, review and approve the report |
| 10 | Finance Admin | Go to Billing, submit the insurance claim |
| 11 | Finance Admin | Go to Payouts, approve the provider payout |
| 12 | Parent | Log in, see updated status on dashboard |

### Scenario B: Provider Onboarding

| Step | Action |
|------|--------|
| 1 | Visit the marketing site at `/for-providers` |
| 2 | Click "Apply Now" — redirected to platform registration |
| 3 | Complete the 2-step registration form |
| 4 | Log in with new credentials |
| 5 | See provider dashboard (empty — no cases assigned yet) |
| 6 | Admin assigns a case to the new provider |
| 7 | Provider sees the case appear on their dashboard |

### Scenario C: ABA Provider Tracking

| Step | Role | Action |
|------|------|--------|
| 1 | ABA Provider Admin | Log in as `aba.admin@brightfutures.com` |
| 2 | ABA Provider Admin | View dashboard — see org-scoped metrics |
| 3 | ABA Provider Admin | Go to Referrals — see only Bright Futures referrals |
| 4 | ABA Provider Admin | Click a referral to track diagnostic progress |

---

## Data Scoping Rules

| Scope | Roles | What They See |
|-------|-------|---------------|
| **Full Platform** | Super Admin, Admin, Intake Coordinator, Scheduler, Account Manager, Community Dev, Finance Admin | All records (filtered by permission) |
| **Organization** | ABA Provider Admin, ABA Provider Staff, Pediatrician Admin | Only records from their organization |
| **Self / Assigned** | Psychologist, Psychometrist, Parent/Guardian | Only records assigned or linked to them |

---

*This guide was generated for demo and training purposes. All accounts use shared test credentials and should not be used in production.*
