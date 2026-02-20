import { z } from "zod";

export const createReferralSchema = z.object({
  channel: z.enum(["FAX", "PHONE", "PORTAL", "EMAIL", "WALK_IN"]),
  referringOrgId: z.string().min(1, "Referring organization is required"),
  referralSourceId: z.string().optional(),
  priority: z.enum(["STANDARD", "URGENT", "EXPEDITED"]).default("STANDARD"),
  childFirstName: z.string().min(1, "Child's first name is required"),
  childLastName: z.string().min(1, "Child's last name is required"),
  childDateOfBirth: z.coerce.date().optional(),
  childAge: z.coerce.number().int().min(0).max(25).optional(),
  reasonForReferral: z.string().optional(),
  insuranceInfo: z.string().optional(),
  notes: z.string().optional(),
});

export const updateReferralSchema = z.object({
  status: z.enum([
    "RECEIVED", "INTAKE_IN_PROGRESS", "PARENT_CONTACTED", "READY_TO_SCHEDULE",
    "INTERVIEW_SCHEDULED", "INTERVIEW_COMPLETED", "REPORT_IN_REVIEW",
    "REPORT_APPROVED", "BILLING_SUBMITTED", "DIAGNOSIS_COMPLETE",
    "REPORT_DELIVERED", "CLOSED",
  ]).optional(),
  priority: z.enum(["STANDARD", "URGENT", "EXPEDITED"]).optional(),
  childFirstName: z.string().min(1).optional(),
  childLastName: z.string().min(1).optional(),
  childDateOfBirth: z.coerce.date().optional(),
  childAge: z.coerce.number().int().min(0).max(25).optional(),
  reasonForReferral: z.string().optional(),
  insuranceInfo: z.string().optional(),
  notes: z.string().optional(),
  closedReason: z.string().optional(),
});

export type CreateReferralInput = z.infer<typeof createReferralSchema>;
export type UpdateReferralInput = z.infer<typeof updateReferralSchema>;
