"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { Button } from "@clearpath/ui/components/button";
import { Input } from "@clearpath/ui/components/input";
import { Label } from "@clearpath/ui/components/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@clearpath/ui/components/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@clearpath/ui/components/tabs";

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  async function handlePasswordLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await signIn("credentials", {
      email,
      password,
      callbackUrl,
      redirect: false,
    });

    if (result?.error) {
      setError("Invalid email or password");
    } else if (result?.url) {
      window.location.href = result.url;
    }

    setLoading(false);
  }

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    await signIn("resend", {
      email,
      callbackUrl,
      redirect: false,
    });

    setMagicLinkSent(true);
    setLoading(false);
  }

  async function handleSMSOTP(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });

      if (res.ok) {
        window.location.href = `/auth/otp?phone=${encodeURIComponent(phone)}&callbackUrl=${encodeURIComponent(callbackUrl)}`;
      } else {
        setError("Failed to send verification code");
      }
    } catch {
      setError("Something went wrong");
    }

    setLoading(false);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-muted p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <span className="text-xl font-bold text-primary">CP</span>
          </div>
          <CardTitle className="text-2xl font-bold">ClearPath Dx</CardTitle>
          <CardDescription>Sign in to the diagnostics platform</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <Tabs
            defaultValue="password"
            onValueChange={() => {
              setError(null);
              setMagicLinkSent(false);
            }}
          >
            <TabsList className="mb-4 w-full">
              <TabsTrigger value="password" className="flex-1">Password</TabsTrigger>
              <TabsTrigger value="email" className="flex-1">Magic Link</TabsTrigger>
              <TabsTrigger value="sms" className="flex-1">SMS</TabsTrigger>
            </TabsList>

            <TabsContent value="password">
              <form onSubmit={handlePasswordLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {loading ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="email">
              {magicLinkSent ? (
                <div className="space-y-3 text-center py-4">
                  <p className="text-sm text-muted-foreground">
                    Check your email for a sign-in link.
                  </p>
                  <Button variant="ghost" onClick={() => setMagicLinkSent(false)}>
                    Try again
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleMagicLink} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="magic-email">Email</Label>
                    <Input
                      id="magic-email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {loading ? "Sending..." : "Send Magic Link"}
                  </Button>
                </form>
              )}
            </TabsContent>

            <TabsContent value="sms">
              <form onSubmit={handleSMSOTP} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {loading ? "Sending code..." : "Send Verification Code"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
          <div className="mt-4 text-center text-sm text-muted-foreground">
            Are you a provider?{" "}
            <Link href="/auth/register/provider" className="text-primary hover:underline">
              Join the network
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
