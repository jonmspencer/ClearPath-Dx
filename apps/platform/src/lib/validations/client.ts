import { z } from "zod";

export const guardianSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  relationship: z.string().min(1, "Relationship is required"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  isPrimary: z.boolean().default(false),
});

export const createClientSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  dateOfBirth: z.coerce.date({ error: "Date of birth is required" }),
  gender: z.string().optional(),
  preferredName: z.string().optional(),
  primaryLanguage: z.string().optional(),
  schoolName: z.string().optional(),
  grade: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  insuranceProvider: z.string().optional(),
  insurancePolicyId: z.string().optional(),
  insuranceGroupId: z.string().optional(),
  referralId: z.string().min(1, "Referral is required"),
  referringOrgId: z.string().min(1, "Referring organization is required"),
  guardians: z.array(guardianSchema).optional(),
});

export const updateClientSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  dateOfBirth: z.coerce.date().optional(),
  gender: z.string().optional(),
  preferredName: z.string().optional(),
  primaryLanguage: z.string().optional(),
  schoolName: z.string().optional(),
  grade: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  insuranceProvider: z.string().optional(),
  insurancePolicyId: z.string().optional(),
  insuranceGroupId: z.string().optional(),
});

export type CreateClientInput = z.infer<typeof createClientSchema>;
export type UpdateClientInput = z.infer<typeof updateClientSchema>;
export type GuardianInput = z.infer<typeof guardianSchema>;
