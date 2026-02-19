"use client";

import * as React from "react";
import { cn } from "../lib/utils";
import { ReferralStatus } from "@clearpath/types";

const STATUS_CONFIG: Record<
  ReferralStatus,
  { label: string; colorClass: string; shortLabel: string }
> = {
  [ReferralStatus.RECEIVED]: {
    label: "Received",
    shortLabel: "Received",
    colorClass: "bg-[var(--color-status-received)]",
  },
  [ReferralStatus.INTAKE_IN_PROGRESS]: {
    label: "Intake In Progress",
    shortLabel: "Intake",
    colorClass: "bg-[var(--color-status-in-progress)]",
  },
  [ReferralStatus.PARENT_CONTACTED]: {
    label: "Parent Contacted",
    shortLabel: "Contacted",
    colorClass: "bg-[var(--color-status-in-progress)]",
  },
  [ReferralStatus.READY_TO_SCHEDULE]: {
    label: "Ready to Schedule",
    shortLabel: "Ready",
    colorClass: "bg-[var(--color-status-scheduled)]",
  },
  [ReferralStatus.INTERVIEW_SCHEDULED]: {
    label: "Interview Scheduled",
    shortLabel: "Scheduled",
    colorClass: "bg-[var(--color-status-scheduled)]",
  },
  [ReferralStatus.INTERVIEW_COMPLETED]: {
    label: "Interview Completed",
    shortLabel: "Interviewed",
    colorClass: "bg-[var(--color-status-completed)]",
  },
  [ReferralStatus.REPORT_IN_REVIEW]: {
    label: "Report In Review",
    shortLabel: "In Review",
    colorClass: "bg-[var(--color-status-review)]",
  },
  [ReferralStatus.REPORT_APPROVED]: {
    label: "Report Approved",
    shortLabel: "Approved",
    colorClass: "bg-[var(--color-status-completed)]",
  },
  [ReferralStatus.BILLING_SUBMITTED]: {
    label: "Billing Submitted",
    shortLabel: "Billing",
    colorClass: "bg-[var(--color-status-billing)]",
  },
  [ReferralStatus.DIAGNOSIS_COMPLETE]: {
    label: "Diagnosis Complete",
    shortLabel: "Complete",
    colorClass: "bg-[var(--color-status-completed)]",
  },
  [ReferralStatus.REPORT_DELIVERED]: {
    label: "Report Delivered",
    shortLabel: "Delivered",
    colorClass: "bg-[var(--color-status-completed)]",
  },
  [ReferralStatus.CLOSED]: {
    label: "Closed",
    shortLabel: "Closed",
    colorClass: "bg-[var(--color-status-closed)]",
  },
};

const STATUS_ORDER = Object.values(ReferralStatus);

interface StatusTimelineProps {
  currentStatus: ReferralStatus;
  className?: string;
  compact?: boolean;
}

export function StatusTimeline({
  currentStatus,
  className,
  compact = false,
}: StatusTimelineProps) {
  const currentIndex = STATUS_ORDER.indexOf(currentStatus);

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {STATUS_ORDER.map((status, index) => {
        const config = STATUS_CONFIG[status];
        const isCompleted = index < currentIndex;
        const isCurrent = index === currentIndex;
        const isPending = index > currentIndex;

        return (
          <React.Fragment key={status}>
            <div className="flex flex-col items-center gap-1">
              <div
                className={cn(
                  "flex h-3 w-3 items-center justify-center rounded-full transition-all",
                  isCompleted && config.colorClass,
                  isCurrent && cn(config.colorClass, "ring-2 ring-offset-2 ring-primary"),
                  isPending && "bg-muted"
                )}
              />
              {!compact && (
                <span
                  className={cn(
                    "text-[10px] leading-tight text-center max-w-[60px]",
                    isCurrent ? "font-semibold text-foreground" : "text-muted-foreground"
                  )}
                >
                  {config.shortLabel}
                </span>
              )}
            </div>
            {index < STATUS_ORDER.length - 1 && (
              <div
                className={cn(
                  "h-0.5 flex-1 min-w-[8px] transition-all",
                  index < currentIndex ? config.colorClass : "bg-muted"
                )}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

export function getStatusConfig(status: ReferralStatus) {
  return STATUS_CONFIG[status];
}

export { STATUS_CONFIG, STATUS_ORDER };
