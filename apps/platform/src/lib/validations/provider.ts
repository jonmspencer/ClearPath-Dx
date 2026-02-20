import { z } from "zod";

export const createProviderSchema = z.object({
  userId: z.string().min(1, "User is required"),
  organizationId: z.string().min(1, "Organization is required"),
  providerType: z.enum(["PSYCHOLOGIST", "PSYCHOMETRIST"], { required_error: "Provider type is required" }),
  licenseNumber: z.string().optional(),
  licenseState: z.string().optional(),
  npiNumber: z.string().optional(),
  specialties: z.array(z.string()).default([]),
  yearsExperience: z.coerce.number().int().min(0).optional(),
  bio: z.string().optional(),
  maxWeeklyCases: z.coerce.number().int().min(0).default(5),
  isAcceptingCases: z.boolean().default(true),
  serviceRadius: z.coerce.number().int().min(0).optional(),
  serviceZipCodes: z.array(z.string()).default([]),
});

export const updateProviderSchema = z.object({
  providerType: z.enum(["PSYCHOLOGIST", "PSYCHOMETRIST"]).optional(),
  licenseNumber: z.string().optional(),
  licenseState: z.string().optional(),
  npiNumber: z.string().optional(),
  specialties: z.array(z.string()).optional(),
  yearsExperience: z.coerce.number().int().min(0).optional(),
  bio: z.string().optional(),
  maxWeeklyCases: z.coerce.number().int().min(0).optional(),
  isAcceptingCases: z.boolean().optional(),
  serviceRadius: z.coerce.number().int().min(0).optional(),
  serviceZipCodes: z.array(z.string()).optional(),
});

export const createAvailabilitySchema = z.object({
  dayOfWeek: z.enum(["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"], { required_error: "Day of week is required" }),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  isRecurring: z.boolean().default(true),
  specificDate: z.string().optional(),
});

export type CreateProviderInput = z.infer<typeof createProviderSchema>;
export type UpdateProviderInput = z.infer<typeof updateProviderSchema>;
export type CreateAvailabilityInput = z.infer<typeof createAvailabilitySchema>;
