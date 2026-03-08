import { ServerClient } from "postmark";

let client: ServerClient | null = null;

export function getPostmarkClient(): ServerClient {
  if (!client) {
    const token = process.env.POSTMARK_API_TOKEN;
    if (!token) {
      throw new Error("POSTMARK_API_TOKEN environment variable is not set");
    }
    client = new ServerClient(token);
  }
  return client;
}

export const FROM_EMAIL =
  process.env.POSTMARK_FROM_EMAIL ?? "ClearPath Dx <noreply@clearpathdx.com>";
