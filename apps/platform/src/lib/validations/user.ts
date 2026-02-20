import { z } from "zod";

const USER_ROLES = [
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
] as const;

export const createUserSchema = z.object({
  email: z.string().email("Valid email is required"),
  name: z.string().optional(),
  phone: z.string().optional(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  organizationId: z.string().optional(),
  role: z.enum(USER_ROLES).optional(),
  isPrimary: z.boolean().optional(),
});

export const updateUserSchema = z.object({
  email: z.string().email("Valid email is required").optional(),
  name: z.string().optional(),
  phone: z.string().optional(),
  isActive: z.boolean().optional(),
});

export const assignRoleSchema = z.object({
  organizationId: z.string().min(1, "Organization is required"),
  role: z.enum(USER_ROLES, { required_error: "Role is required" }),
  isPrimary: z.boolean().optional(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type AssignRoleInput = z.infer<typeof assignRoleSchema>;
