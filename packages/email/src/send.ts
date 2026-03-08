import { getPostmarkClient, FROM_EMAIL } from "./client";

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  tag?: string;
  metadata?: Record<string, string>;
}

export async function sendEmail(options: SendEmailOptions) {
  const client = getPostmarkClient();

  const result = await client.sendEmail({
    From: FROM_EMAIL,
    To: options.to,
    Subject: options.subject,
    HtmlBody: options.html,
    TextBody: options.text ?? stripHtml(options.html),
    Tag: options.tag,
    Metadata: options.metadata,
    MessageStream: "outbound",
  });

  return result;
}

function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .trim();
}
