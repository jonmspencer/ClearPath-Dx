import { z } from "zod";

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25),
});

export const idParamSchema = z.object({
  id: z.string().min(1, "ID is required"),
});

export const emailSchema = z.string().email("Invalid email address");

export const phoneSchema = z
  .string()
  .regex(/^\+?[\d\s\-()]+$/, "Invalid phone number")
  .optional()
  .or(z.literal(""));

export const dateSchema = z.coerce.date();

export const optionalDateSchema = z.coerce.date().optional().or(z.literal("").transform(() => undefined));

export function parseSearchParams<T extends z.ZodType>(
  searchParams: URLSearchParams,
  schema: T
): z.infer<T> {
  const obj: Record<string, string> = {};
  searchParams.forEach((value, key) => {
    obj[key] = value;
  });
  return schema.parse(obj);
}
