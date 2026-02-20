import { z } from "zod";

export const interviewTypeEnum = z.enum([
  "PARENT_INTERVIEW",
  "CHILD_OBSERVATION",
  "SCHOOL_OBSERVATION",
  "TESTING_SESSION",
  "FEEDBACK_SESSION",
]);

export const createInterviewSchema = z.object({
  caseId: z.string().min(1, "Case is required"),
  providerId: z.string().min(1, "Provider is required"),
  interviewType: interviewTypeEnum,
  scheduledStart: z.coerce.date(),
  scheduledEnd: z.coerce.date(),
  location: z.string().optional(),
  meetingLink: z.string().url().optional().or(z.literal("")),
  notes: z.string().optional(),
});

export const updateInterviewSchema = z.object({
  providerId: z.string().optional(),
  interviewType: interviewTypeEnum.optional(),
  scheduledStart: z.coerce.date().optional(),
  scheduledEnd: z.coerce.date().optional(),
  actualStart: z.coerce.date().nullable().optional(),
  actualEnd: z.coerce.date().nullable().optional(),
  location: z.string().nullable().optional(),
  meetingLink: z.string().url().nullable().optional().or(z.literal("")),
  notes: z.string().nullable().optional(),
  isCompleted: z.boolean().optional(),
  isCancelled: z.boolean().optional(),
  cancelledReason: z.string().nullable().optional(),
});

export const createAvailabilitySchema = z.object({
  providerId: z.string().min(1, "Provider is required"),
  dayOfWeek: z.coerce.number().int().min(0).max(6),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  isRecurring: z.boolean().default(true),
  specificDate: z.coerce.date().optional(),
});

export const updateAvailabilitySchema = z.object({
  dayOfWeek: z.coerce.number().int().min(0).max(6).optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  isRecurring: z.boolean().optional(),
  specificDate: z.coerce.date().nullable().optional(),
});

export type CreateInterviewInput = z.infer<typeof createInterviewSchema>;
export type UpdateInterviewInput = z.infer<typeof updateInterviewSchema>;
export type CreateAvailabilityInput = z.infer<typeof createAvailabilitySchema>;
export type UpdateAvailabilityInput = z.infer<typeof updateAvailabilitySchema>;
