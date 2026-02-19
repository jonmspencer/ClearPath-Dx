"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Button } from "@clearpath/ui/components/button";
import { Input } from "@clearpath/ui/components/input";
import { Label } from "@clearpath/ui/components/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@clearpath/ui/components/card";

export default function OTPPage() {
  const searchParams = useSearchParams();
  const phone = searchParams.get("phone") ?? "";
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, otp }),
      });

      if (res.ok) {
        const data = await res.json();
        // Sign in with credentials using the verified phone
        const result = await signIn("credentials", {
          email: data.email,
          password: data.tempToken,
          callbackUrl,
          redirect: false,
        });

        if (result?.url) {
          window.location.href = result.url;
        } else {
          setError("Failed to sign in");
        }
      } else {
        setError("Invalid or expired code");
      }
    } catch {
      setError("Something went wrong");
    }

    setLoading(false);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Enter verification code</CardTitle>
          <CardDescription>
            We sent a 6-digit code to {phone}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
          <form onSubmit={handleVerify} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="otp">Verification Code</Label>
              <Input
                id="otp"
                type="text"
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                placeholder="000000"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="text-center text-2xl tracking-widest"
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Verifying..." : "Verify"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
