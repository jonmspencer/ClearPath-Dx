import { z } from "zod";

export const createReportSchema = z.object({
  caseId: z.string().min(1, "Case is required"),
  reportContent: z.string().optional(),
  summary: z.string().optional(),
  diagnoses: z.array(z.string()).default([]),
  recommendations: z.string().optional(),
});

export const updateReportSchema = z.object({
  reportContent: z.string().optional(),
  summary: z.string().optional(),
  diagnoses: z.array(z.string()).optional(),
  recommendations: z.string().optional(),
  status: z.enum(["DRAFT", "IN_REVIEW", "REVISION_REQUESTED", "APPROVED", "DELIVERED"]).optional(),
});

export const reviewDecisionSchema = z.object({
  isApproved: z.boolean(),
  reviewNotes: z.string().optional(),
});

export type CreateReportInput = z.infer<typeof createReportSchema>;
export type UpdateReportInput = z.infer<typeof updateReportSchema>;
