import { z } from "zod";

export const createCaseSchema = z.object({
  referralId: z.string().min(1, "Referral is required"),
  clientId: z.string().min(1, "Client is required"),
  priority: z.enum(["STANDARD", "URGENT", "EXPEDITED"]).default("STANDARD"),
  coordinatorId: z.string().optional(),
  schedulerId: z.string().optional(),
  psychologistId: z.string().optional(),
  psychometristId: z.string().optional(),
  targetCompletionDate: z.coerce.date().optional(),
  notes: z.string().optional(),
});

export const updateCaseSchema = z.object({
  priority: z.enum(["STANDARD", "URGENT", "EXPEDITED"]).optional(),
  coordinatorId: z.string().nullable().optional(),
  schedulerId: z.string().nullable().optional(),
  psychologistId: z.string().nullable().optional(),
  psychometristId: z.string().nullable().optional(),
  targetCompletionDate: z.coerce.date().nullable().optional(),
  actualCompletionDate: z.coerce.date().nullable().optional(),
  notes: z.string().nullable().optional(),
});

export const assignCaseSchema = z.object({
  psychologistId: z.string().nullable().optional(),
  psychometristId: z.string().nullable().optional(),
  coordinatorId: z.string().nullable().optional(),
  schedulerId: z.string().nullable().optional(),
});

export type CreateCaseInput = z.infer<typeof createCaseSchema>;
export type UpdateCaseInput = z.infer<typeof updateCaseSchema>;
export type AssignCaseInput = z.infer<typeof assignCaseSchema>;
