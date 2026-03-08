"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, ArrowLeft, ArrowRight, CheckCircle } from "lucide-react";
import { Button } from "@clearpath/ui/components/button";
import { Input } from "@clearpath/ui/components/input";
import { Label } from "@clearpath/ui/components/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@clearpath/ui/components/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@clearpath/ui/components/select";

export default function ProviderRegistrationPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Step 1: Account
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Step 2: Provider details
  const [providerType, setProviderType] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [licenseState, setLicenseState] = useState("");
  const [npiNumber, setNpiNumber] = useState("");
  const [specialties, setSpecialties] = useState("");
  const [yearsExperience, setYearsExperience] = useState("");

  function validateStep1(): boolean {
    if (!name || name.length < 2) { setError("Name must be at least 2 characters"); return false; }
    if (!email) { setError("Email is required"); return false; }
    if (password.length < 8) { setError("Password must be at least 8 characters"); return false; }
    if (password !== confirmPassword) { setError("Passwords do not match"); return false; }
    setError(null);
    return true;
  }

  function validateStep2(): boolean {
    if (!providerType) { setError("Please select a provider type"); return false; }
    setError(null);
    return true;
  }

  async function handleSubmit() {
    if (!validateStep2()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/register/provider", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone: phone || undefined,
          password,
          providerType,
          licenseNumber: licenseNumber || undefined,
          licenseState: licenseState || undefined,
          npiNumber: npiNumber || undefined,
          specialties: specialties || undefined,
          yearsExperience: yearsExperience ? parseInt(yearsExperience) : undefined,
        }),
      });

      const json = await res.json();

      if (json.success) {
        setSuccess(true);
      } else {
        setError(json.error || "Registration failed");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    }

    setLoading(false);
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-muted p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 text-green-600">
              <CheckCircle className="h-6 w-6" />
            </div>
            <CardTitle className="text-2xl font-bold">Registration Complete</CardTitle>
            <CardDescription>
              Your provider account has been created. You can now sign in with your email and password.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button asChild className="mt-4">
              <Link href="/auth/login">Go to Sign In</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-muted p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <span className="text-xl font-bold text-primary">CP</span>
          </div>
          <CardTitle className="text-2xl font-bold">Join ClearPath Dx</CardTitle>
          <CardDescription>
            {step === 1 ? "Create your account" : "Your professional details"}
          </CardDescription>
          <div className="flex justify-center gap-2 pt-3">
            <div className={`h-2 w-16 rounded-full ${step >= 1 ? "bg-primary" : "bg-muted"}`} />
            <div className={`h-2 w-16 rounded-full ${step >= 2 ? "bg-primary" : "bg-muted"}`} />
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Dr. Jane Smith" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reg-email">Email</Label>
                <Input id="reg-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reg-phone">Phone (optional)</Label>
                <Input id="reg-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 (555) 000-0000" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reg-password">Password</Label>
                <Input id="reg-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reg-confirm">Confirm Password</Label>
                <Input id="reg-confirm" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
              </div>
              <Button
                className="w-full"
                onClick={() => { if (validateStep1()) setStep(2); }}
              >
                Next <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Provider Type</Label>
                <Select value={providerType} onValueChange={setProviderType}>
                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PSYCHOLOGIST">Psychologist</SelectItem>
                    <SelectItem value="PSYCHOMETRIST">Psychometrist</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="license">License Number (optional)</Label>
                <Input id="license" value={licenseNumber} onChange={(e) => setLicenseNumber(e.target.value)} placeholder="PSY-TX-12345" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="licenseState">License State (optional)</Label>
                <Input id="licenseState" value={licenseState} onChange={(e) => setLicenseState(e.target.value)} placeholder="TX" maxLength={2} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="npi">NPI Number (optional)</Label>
                <Input id="npi" value={npiNumber} onChange={(e) => setNpiNumber(e.target.value)} placeholder="1234567890" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="specialties">Specialties (optional, comma-separated)</Label>
                <Input id="specialties" value={specialties} onChange={(e) => setSpecialties(e.target.value)} placeholder="Autism, ADHD, Learning Disabilities" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="experience">Years of Experience (optional)</Label>
                <Input id="experience" type="number" min="0" value={yearsExperience} onChange={(e) => setYearsExperience(e.target.value)} />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => { setError(null); setStep(1); }}>
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>
                <Button className="flex-1" onClick={handleSubmit} disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {loading ? "Creating Account..." : "Create Account"}
                </Button>
              </div>
            </div>
          )}

          <div className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-primary hover:underline">Sign in</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
