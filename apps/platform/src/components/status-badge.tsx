import { Badge } from "@clearpath/ui/components/badge";
import { cn } from "@clearpath/ui/lib/utils";

const REFERRAL_STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  RECEIVED: { label: "Received", className: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300" },
  INTAKE_IN_PROGRESS: { label: "Intake", className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300" },
  PARENT_CONTACTED: { label: "Parent Contacted", className: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300" },
  READY_TO_SCHEDULE: { label: "Ready to Schedule", className: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300" },
  INTERVIEW_SCHEDULED: { label: "Scheduled", className: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300" },
  INTERVIEW_COMPLETED: { label: "Interview Done", className: "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300" },
  REPORT_IN_REVIEW: { label: "In Review", className: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300" },
  REPORT_APPROVED: { label: "Approved", className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300" },
  BILLING_SUBMITTED: { label: "Billing", className: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300" },
  DIAGNOSIS_COMPLETE: { label: "Complete", className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" },
  REPORT_DELIVERED: { label: "Delivered", className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" },
  CLOSED: { label: "Closed", className: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300" },
};

const REPORT_STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  DRAFT: { label: "Draft", className: "bg-gray-100 text-gray-800" },
  IN_REVIEW: { label: "In Review", className: "bg-amber-100 text-amber-800" },
  REVISION_REQUESTED: { label: "Revision Needed", className: "bg-red-100 text-red-800" },
  APPROVED: { label: "Approved", className: "bg-green-100 text-green-800" },
  DELIVERED: { label: "Delivered", className: "bg-emerald-100 text-emerald-800" },
};

const BILLING_STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  PENDING: { label: "Pending", className: "bg-gray-100 text-gray-800" },
  SUBMITTED: { label: "Submitted", className: "bg-blue-100 text-blue-800" },
  ACCEPTED: { label: "Accepted", className: "bg-green-100 text-green-800" },
  REJECTED: { label: "Rejected", className: "bg-red-100 text-red-800" },
  PAID: { label: "Paid", className: "bg-emerald-100 text-emerald-800" },
  WRITTEN_OFF: { label: "Written Off", className: "bg-gray-100 text-gray-600" },
};

const PAYOUT_STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  PENDING: { label: "Pending", className: "bg-gray-100 text-gray-800" },
  APPROVED: { label: "Approved", className: "bg-blue-100 text-blue-800" },
  PAID: { label: "Paid", className: "bg-green-100 text-green-800" },
  VOIDED: { label: "Voided", className: "bg-red-100 text-red-800" },
};

const PRIORITY_CONFIG: Record<string, { label: string; className: string }> = {
  STANDARD: { label: "Standard", className: "bg-gray-100 text-gray-700" },
  URGENT: { label: "Urgent", className: "bg-red-100 text-red-800" },
  EXPEDITED: { label: "Expedited", className: "bg-orange-100 text-orange-800" },
};

const FLAG_SEVERITY_CONFIG: Record<string, { label: string; className: string }> = {
  INFO: { label: "Info", className: "bg-blue-100 text-blue-800" },
  WARNING: { label: "Warning", className: "bg-yellow-100 text-yellow-800" },
  URGENT: { label: "Urgent", className: "bg-orange-100 text-orange-800" },
  CRITICAL: { label: "Critical", className: "bg-red-100 text-red-800" },
};

type StatusType = "referral" | "report" | "billing" | "payout" | "priority" | "flag";

const CONFIG_MAP: Record<StatusType, Record<string, { label: string; className: string }>> = {
  referral: REFERRAL_STATUS_CONFIG,
  report: REPORT_STATUS_CONFIG,
  billing: BILLING_STATUS_CONFIG,
  payout: PAYOUT_STATUS_CONFIG,
  priority: PRIORITY_CONFIG,
  flag: FLAG_SEVERITY_CONFIG,
};

interface StatusBadgeProps {
  status: string;
  type: StatusType;
  className?: string;
}

export function StatusBadge({ status, type, className }: StatusBadgeProps) {
  const config = CONFIG_MAP[type]?.[status];
  if (!config) {
    return <Badge variant="outline" className={className}>{status}</Badge>;
  }
  return (
    <Badge variant="outline" className={cn("border-0 font-medium", config.className, className)}>
      {config.label}
    </Badge>
  );
}
