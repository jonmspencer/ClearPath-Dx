import { z } from "zod";

export const providerRegistrationSchema = z.object({
  // Account details
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Valid email is required"),
  phone: z.string().optional(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),

  // Provider details
  providerType: z.enum(["PSYCHOLOGIST", "PSYCHOMETRIST"], {
    error: "Provider type is required",
  }),
  licenseNumber: z.string().optional(),
  licenseState: z.string().optional(),
  npiNumber: z.string().optional(),
  specialties: z.string().optional(), // comma-separated, parsed on server
  yearsExperience: z.coerce.number().int().min(0).optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export type ProviderRegistrationInput = z.infer<typeof providerRegistrationSchema>;

// Server-side schema without confirmPassword
export const providerRegistrationServerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  password: z.string().min(8),
  providerType: z.enum(["PSYCHOLOGIST", "PSYCHOMETRIST"]),
  licenseNumber: z.string().optional(),
  licenseState: z.string().optional(),
  npiNumber: z.string().optional(),
  specialties: z.string().optional(),
  yearsExperience: z.coerce.number().int().min(0).optional(),
});
