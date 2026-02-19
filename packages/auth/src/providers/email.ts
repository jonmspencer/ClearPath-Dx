import Resend from "next-auth/providers/resend";

export const emailProvider = Resend({
  apiKey: process.env.AUTH_RESEND_KEY,
  from: process.env.RESEND_FROM_EMAIL ?? "ClearPath Dx <noreply@clearpathdx.com>",
});
