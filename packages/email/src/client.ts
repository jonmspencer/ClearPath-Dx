let client: any = null;

export async function getPostmarkClient() {
  if (!client) {
    const token = process.env.POSTMARK_API_TOKEN;
    if (!token) {
      throw new Error("POSTMARK_API_TOKEN environment variable is not set");
    }
    const { ServerClient } = await import("postmark");
    client = new ServerClient(token);
  }
  return client;
}

export const FROM_EMAIL =
  process.env.POSTMARK_FROM_EMAIL ?? "ClearPath Dx <noreply@clearpathdx.com>";
