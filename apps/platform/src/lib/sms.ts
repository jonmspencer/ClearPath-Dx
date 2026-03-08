/**
 * SMS sending utility — uses Twilio REST API directly (no SDK dependency).
 * In development or when Twilio is not configured, logs to console.
 */

export async function sendSMS(
  phone: string,
  message: string
): Promise<{ success: boolean; error?: string }> {
  // In development, log to console
  if (process.env.NODE_ENV === "development") {
    console.log(`[SMS] To: ${phone}, Message: ${message}`);
    return { success: true };
  }

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_PHONE_NUMBER;

  if (!accountSid || !authToken || !fromNumber) {
    console.warn("[SMS] Twilio not configured — skipping SMS send");
    return { success: false, error: "Twilio not configured" };
  }

  try {
    const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
    const auth = Buffer.from(`${accountSid}:${authToken}`).toString("base64");

    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        To: phone,
        From: fromNumber,
        Body: message,
      }),
    });

    if (!res.ok) {
      const errorBody = await res.text();
      console.error("[SMS] Twilio API error:", errorBody);
      return { success: false, error: `Twilio API error: ${res.status}` };
    }

    return { success: true };
  } catch (error) {
    console.error("[SMS] Failed to send:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
