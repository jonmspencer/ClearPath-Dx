import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        destructive: "border-transparent bg-destructive text-destructive-foreground",
        outline: "text-foreground",
        // Status variants for referral lifecycle
        received: "border-transparent bg-[var(--color-status-received)] text-white",
        "in-progress": "border-transparent bg-[var(--color-status-in-progress)] text-white",
        scheduled: "border-transparent bg-[var(--color-status-scheduled)] text-white",
        completed: "border-transparent bg-[var(--color-status-completed)] text-white",
        review: "border-transparent bg-[var(--color-status-review)] text-white",
        billing: "border-transparent bg-[var(--color-status-billing)] text-white",
        closed: "border-transparent bg-[var(--color-status-closed)] text-white",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
