/**
 * SMS message templates for parent outreach and scheduling.
 * Keep messages under 160 chars when possible for single-segment SMS.
 */

export function parentInitialOutreach(data: {
  parentName: string;
  childName: string;
  referralNumber: string;
}): string {
  return `Hi ${data.parentName}, this is ClearPath Diagnostics. We received a referral (${data.referralNumber}) for ${data.childName}. Please reply YES to confirm you'd like to proceed, or call us at your convenience.`;
}

export function parentFollowUp(data: {
  parentName: string;
  childName: string;
  attemptNumber: number;
}): string {
  return `Hi ${data.parentName}, this is ClearPath Diagnostics following up about ${data.childName}'s diagnostic evaluation. We'd love to help — please reply YES or call us to get started.`;
}

export function appointmentReminder(data: {
  parentName: string;
  childName: string;
  date: string;
  time: string;
  location: string;
}): string {
  return `Reminder: ${data.childName} has an appointment on ${data.date} at ${data.time} at ${data.location}. Reply YES to confirm or NO to reschedule.`;
}

export function appointmentConfirmation(data: {
  parentName: string;
  childName: string;
  date: string;
  time: string;
}): string {
  return `Hi ${data.parentName}, please confirm ${data.childName}'s appointment tomorrow (${data.date}) at ${data.time}. Reply YES to confirm or NO to cancel.`;
}
