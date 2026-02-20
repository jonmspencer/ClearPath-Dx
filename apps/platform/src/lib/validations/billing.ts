import { z } from "zod";

export const createBillingSchema = z.object({
  caseId: z.string().min(1, "Case is required"),
  organizationId: z.string().min(1, "Organization is required"),
  cptCode: z.string().optional(),
  billedAmount: z.coerce.number().min(0).optional(),
  allowedAmount: z.coerce.number().min(0).optional(),
  payerName: z.string().optional(),
  claimNumber: z.string().optional(),
  notes: z.string().optional(),
});

export const updateBillingSchema = z.object({
  status: z.enum(["PENDING", "SUBMITTED", "ACCEPTED", "REJECTED", "PAID", "WRITTEN_OFF"]).optional(),
  cptCode: z.string().optional(),
  billedAmount: z.coerce.number().min(0).optional(),
  allowedAmount: z.coerce.number().min(0).optional(),
  paidAmount: z.coerce.number().min(0).optional(),
  adjustmentAmount: z.coerce.number().min(0).optional(),
  payerName: z.string().optional(),
  claimNumber: z.string().optional(),
  notes: z.string().optional(),
});

export type CreateBillingInput = z.infer<typeof createBillingSchema>;
export type UpdateBillingInput = z.infer<typeof updateBillingSchema>;
