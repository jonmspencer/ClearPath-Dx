import { z } from "zod";

export const createOrganizationSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum([
    "DIAGNOSTICS_OPERATOR",
    "ABA_PROVIDER",
    "PEDIATRICIAN",
    "SCHOOL",
    "BILLING_PROVIDER",
  ]),
  phone: z.string().optional(),
  fax: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  website: z.string().optional(),
  npiNumber: z.string().optional(),
  taxId: z.string().optional(),
  accountManagerId: z.string().optional(),
});

export const updateOrganizationSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  type: z.enum([
    "DIAGNOSTICS_OPERATOR",
    "ABA_PROVIDER",
    "PEDIATRICIAN",
    "SCHOOL",
    "BILLING_PROVIDER",
  ]).optional(),
  phone: z.string().optional(),
  fax: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  website: z.string().optional(),
  npiNumber: z.string().optional(),
  taxId: z.string().optional(),
  accountManagerId: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
});

export const addMemberSchema = z.object({
  userId: z.string().min(1, "User is required"),
  role: z.enum([
    "SUPER_ADMIN",
    "FINANCE_ADMIN",
    "ADMIN",
    "INTAKE_COORDINATOR",
    "SCHEDULER",
    "ACCOUNT_MANAGER",
    "COMMUNITY_DEVELOPMENT_MANAGER",
    "PSYCHOLOGIST",
    "PSYCHOMETRIST",
    "ABA_PROVIDER_ADMIN",
    "ABA_PROVIDER_STAFF",
    "PEDIATRICIAN_ADMIN",
    "PARENT_GUARDIAN",
  ]),
  isPrimary: z.boolean().optional().default(false),
});

export type CreateOrganizationInput = z.infer<typeof createOrganizationSchema>;
export type UpdateOrganizationInput = z.infer<typeof updateOrganizationSchema>;
export type AddMemberInput = z.infer<typeof addMemberSchema>;
