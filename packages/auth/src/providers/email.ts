import EmailProvider from "next-auth/providers/nodemailer";
import { sendEmail, magicLinkEmail } from "@clearpath/email";

export const emailProvider = EmailProvider({
  id: "postmark",
  name: "Email",
  server: {}, // not used — we send via Postmark SDK directly
  from: process.env.POSTMARK_FROM_EMAIL ?? "ClearPath Dx <noreply@clearpathdx.com>",
  async sendVerificationRequest({ identifier: email, url }) {
    const { subject, html } = magicLinkEmail(url);
    await sendEmail({
      to: email,
      subject,
      html,
      tag: "magic-link",
    });
  },
});
