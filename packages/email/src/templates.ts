// Shared email wrapper
function emailLayout(content: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background: #f5f5f5; color: #333; }
    .container { max-width: 560px; margin: 40px auto; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .header { background: #1e293b; padding: 24px 32px; }
    .header h1 { color: #fff; font-size: 20px; margin: 0; font-weight: 600; }
    .body { padding: 32px; }
    .footer { padding: 16px 32px; background: #f9fafb; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280; }
    .btn { display: inline-block; background: #2563eb; color: #fff !important; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 500; margin: 16px 0; }
    .muted { color: #6b7280; font-size: 14px; }
    p { line-height: 1.6; margin: 0 0 16px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>ClearPath Diagnostics</h1>
    </div>
    <div class="body">
      ${content}
    </div>
    <div class="footer">
      <p style="margin:0;">This is an automated message from ClearPath Diagnostics. Please do not reply directly.</p>
    </div>
  </div>
</body>
</html>`;
}

// ─── Auth ──────────────────────────────────────────────

export function magicLinkEmail(url: string): { subject: string; html: string } {
  return {
    subject: "Sign in to ClearPath Diagnostics",
    html: emailLayout(`
      <p>Click the button below to sign in to your ClearPath Diagnostics account.</p>
      <a href="${url}" class="btn">Sign In</a>
      <p class="muted">This link expires in 10 minutes. If you didn't request this, you can safely ignore this email.</p>
      <p class="muted" style="font-size:12px; word-break:break-all;">Or copy this link: ${url}</p>
    `),
  };
}

// ─── Referrals ──────────────────────────────────────────

export function referralReceivedEmail(data: {
  referralNumber: string;
  childName: string;
  referringOrg: string;
}): { subject: string; html: string } {
  return {
    subject: `New Referral Received: ${data.referralNumber}`,
    html: emailLayout(`
      <p>A new referral has been received and requires attention.</p>
      <table style="width:100%; border-collapse:collapse; margin:16px 0;">
        <tr><td style="padding:8px 0; color:#6b7280;">Referral #</td><td style="padding:8px 0; font-weight:500;">${data.referralNumber}</td></tr>
        <tr><td style="padding:8px 0; color:#6b7280;">Child</td><td style="padding:8px 0; font-weight:500;">${data.childName}</td></tr>
        <tr><td style="padding:8px 0; color:#6b7280;">Referring Org</td><td style="padding:8px 0; font-weight:500;">${data.referringOrg}</td></tr>
      </table>
      <p>Please log in to review and process this referral.</p>
    `),
  };
}

export function referralStatusUpdateEmail(data: {
  referralNumber: string;
  childName: string;
  newStatus: string;
  updatedBy: string;
}): { subject: string; html: string } {
  return {
    subject: `Referral ${data.referralNumber} — Status Update: ${data.newStatus}`,
    html: emailLayout(`
      <p>A referral status has been updated.</p>
      <table style="width:100%; border-collapse:collapse; margin:16px 0;">
        <tr><td style="padding:8px 0; color:#6b7280;">Referral #</td><td style="padding:8px 0; font-weight:500;">${data.referralNumber}</td></tr>
        <tr><td style="padding:8px 0; color:#6b7280;">Child</td><td style="padding:8px 0; font-weight:500;">${data.childName}</td></tr>
        <tr><td style="padding:8px 0; color:#6b7280;">New Status</td><td style="padding:8px 0; font-weight:500;">${data.newStatus}</td></tr>
        <tr><td style="padding:8px 0; color:#6b7280;">Updated By</td><td style="padding:8px 0; font-weight:500;">${data.updatedBy}</td></tr>
      </table>
    `),
  };
}

// ─── Scheduling ──────────────────────────────────────────

export function interviewScheduledEmail(data: {
  childName: string;
  interviewType: string;
  date: string;
  time: string;
  location: string;
  providerName: string;
}): { subject: string; html: string } {
  return {
    subject: `Interview Scheduled: ${data.childName} — ${data.interviewType}`,
    html: emailLayout(`
      <p>An interview has been scheduled.</p>
      <table style="width:100%; border-collapse:collapse; margin:16px 0;">
        <tr><td style="padding:8px 0; color:#6b7280;">Child</td><td style="padding:8px 0; font-weight:500;">${data.childName}</td></tr>
        <tr><td style="padding:8px 0; color:#6b7280;">Type</td><td style="padding:8px 0; font-weight:500;">${data.interviewType}</td></tr>
        <tr><td style="padding:8px 0; color:#6b7280;">Date</td><td style="padding:8px 0; font-weight:500;">${data.date}</td></tr>
        <tr><td style="padding:8px 0; color:#6b7280;">Time</td><td style="padding:8px 0; font-weight:500;">${data.time}</td></tr>
        <tr><td style="padding:8px 0; color:#6b7280;">Location</td><td style="padding:8px 0; font-weight:500;">${data.location}</td></tr>
        <tr><td style="padding:8px 0; color:#6b7280;">Provider</td><td style="padding:8px 0; font-weight:500;">${data.providerName}</td></tr>
      </table>
    `),
  };
}

// ─── Reports ──────────────────────────────────────────

export function reportReadyEmail(data: {
  childName: string;
  caseNumber: string;
  reportStatus: string;
}): { subject: string; html: string } {
  return {
    subject: `Diagnostic Report Ready: ${data.childName} (${data.caseNumber})`,
    html: emailLayout(`
      <p>A diagnostic report is ready for review.</p>
      <table style="width:100%; border-collapse:collapse; margin:16px 0;">
        <tr><td style="padding:8px 0; color:#6b7280;">Child</td><td style="padding:8px 0; font-weight:500;">${data.childName}</td></tr>
        <tr><td style="padding:8px 0; color:#6b7280;">Case #</td><td style="padding:8px 0; font-weight:500;">${data.caseNumber}</td></tr>
        <tr><td style="padding:8px 0; color:#6b7280;">Status</td><td style="padding:8px 0; font-weight:500;">${data.reportStatus}</td></tr>
      </table>
      <p>Please log in to review the report.</p>
    `),
  };
}

// ─── Billing ──────────────────────────────────────────

export function payoutProcessedEmail(data: {
  providerName: string;
  amount: string;
  caseNumber: string;
  paymentRef: string;
}): { subject: string; html: string } {
  return {
    subject: `Payout Processed: ${data.amount} for ${data.caseNumber}`,
    html: emailLayout(`
      <p>A payout has been processed for your account.</p>
      <table style="width:100%; border-collapse:collapse; margin:16px 0;">
        <tr><td style="padding:8px 0; color:#6b7280;">Provider</td><td style="padding:8px 0; font-weight:500;">${data.providerName}</td></tr>
        <tr><td style="padding:8px 0; color:#6b7280;">Amount</td><td style="padding:8px 0; font-weight:500;">${data.amount}</td></tr>
        <tr><td style="padding:8px 0; color:#6b7280;">Case #</td><td style="padding:8px 0; font-weight:500;">${data.caseNumber}</td></tr>
        <tr><td style="padding:8px 0; color:#6b7280;">Payment Ref</td><td style="padding:8px 0; font-weight:500;">${data.paymentRef}</td></tr>
      </table>
    `),
  };
}

// ─── Parent Outreach ──────────────────────────────────

export function parentOutreachEmail(data: {
  parentName: string;
  childName: string;
  referralNumber: string;
}): { subject: string; html: string } {
  return {
    subject: `ClearPath Diagnostics — Referral Received for ${data.childName}`,
    html: emailLayout(`
      <p>Dear ${data.parentName},</p>
      <p>We've received a referral for <strong>${data.childName}</strong> (Ref: ${data.referralNumber}) for a diagnostic evaluation through ClearPath Diagnostics.</p>
      <p>Our team will be reaching out to you shortly to gather some information and get the process started. In the meantime, if you have any questions, please don't hesitate to contact us.</p>
      <p><strong>What to expect next:</strong></p>
      <ul style="margin:16px 0; padding-left:24px; line-height:1.8;">
        <li>A care coordinator will contact you to collect some basic information</li>
        <li>We'll work with your insurance to verify coverage</li>
        <li>We'll schedule the evaluation at a time and location convenient for you</li>
      </ul>
      <p>We look forward to supporting your family through this process.</p>
    `),
  };
}

// ─── Care Coordination ──────────────────────────────────

export function careCoordinationFlagEmail(data: {
  childName: string;
  caseNumber: string;
  severity: string;
  title: string;
  description: string;
}): { subject: string; html: string } {
  const severityColor =
    data.severity === "URGENT" ? "#dc2626" :
    data.severity === "WARNING" ? "#f59e0b" : "#3b82f6";

  return {
    subject: `[${data.severity}] Care Flag: ${data.title} — ${data.childName}`,
    html: emailLayout(`
      <p style="display:inline-block; background:${severityColor}; color:#fff; padding:4px 12px; border-radius:4px; font-size:12px; font-weight:600; margin-bottom:16px;">${data.severity}</p>
      <p><strong>${data.title}</strong></p>
      <p>${data.description}</p>
      <table style="width:100%; border-collapse:collapse; margin:16px 0;">
        <tr><td style="padding:8px 0; color:#6b7280;">Child</td><td style="padding:8px 0; font-weight:500;">${data.childName}</td></tr>
        <tr><td style="padding:8px 0; color:#6b7280;">Case #</td><td style="padding:8px 0; font-weight:500;">${data.caseNumber}</td></tr>
      </table>
      <p>Please log in to review this flag and take action.</p>
    `),
  };
}
