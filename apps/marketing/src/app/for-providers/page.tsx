import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowRight,
  CalendarCheck,
  DollarSign,
  ClipboardList,
  Users,
  ShieldCheck,
  TrendingUp,
  CheckCircle,
  Clock,
  MapPin,
} from "lucide-react";
import { Button } from "@clearpath/ui/components/button";
import { Card, CardContent } from "@clearpath/ui/components/card";

export const metadata: Metadata = {
  title: "Join ClearPath Dx — Provider Network",
  description:
    "Join the ClearPath Dx provider network. Flexible scheduling, competitive pay, zero admin hassle. Start seeing cases in as little as two weeks.",
};

const PLATFORM_URL =
  process.env.NEXT_PUBLIC_PLATFORM_URL ?? "https://app.clearpathdx.com";

const BENEFITS = [
  {
    icon: CalendarCheck,
    title: "Flexible Scheduling",
    description:
      "Set your own availability. Work mornings, evenings, weekends — whatever fits your life. Pick up as many or as few cases as you want.",
  },
  {
    icon: DollarSign,
    title: "Competitive, Transparent Pay",
    description:
      "Know exactly what you'll earn per case before you accept it. No surprises, no clawbacks. Payouts processed weekly.",
  },
  {
    icon: ClipboardList,
    title: "Zero Admin Hassle",
    description:
      "We handle referral intake, parent outreach, insurance verification, and scheduling. You focus on what you do best — evaluating kids.",
  },
  {
    icon: Users,
    title: "Steady Case Pipeline",
    description:
      "No need to market yourself or chase referrals. Our network of pediatricians and schools keeps cases flowing to qualified providers.",
  },
  {
    icon: ShieldCheck,
    title: "Malpractice Coverage",
    description:
      "Every evaluation conducted through ClearPath is backed by our group professional liability policy at no cost to you.",
  },
  {
    icon: TrendingUp,
    title: "Professional Growth",
    description:
      "Access peer consultation, CE-eligible training, and supervision hours. Build your expertise alongside a community of diagnosticians.",
  },
];

const HOW_IT_WORKS = [
  {
    step: 1,
    title: "Apply Online",
    description:
      "Fill out a quick application with your credentials and availability preferences.",
    time: "5 minutes",
  },
  {
    step: 2,
    title: "Credentialing Review",
    description:
      "Our team verifies your license, experience, and references.",
    time: "3–5 business days",
  },
  {
    step: 3,
    title: "Platform Training",
    description:
      "Complete a short orientation on our evaluation protocols and platform tools.",
    time: "1 hour",
  },
  {
    step: 4,
    title: "Start Seeing Cases",
    description:
      "Set your availability, accept your first case, and get paid.",
    time: "You're live!",
  },
];

const QUALIFICATIONS = [
  "Licensed Psychometrist, Licensed Specialist in School Psychology (LSSP), or Licensed Psychologist",
  "Active, unrestricted license in your state of practice",
  "Experience administering standardized cognitive, achievement, and/or adaptive assessments",
  "Comfortable working with pediatric populations (ages 2–17)",
  "Reliable transportation and ability to travel to evaluation sites",
  "Strong written communication skills for report documentation",
];

export default function ProvidersPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <span className="text-sm font-bold text-primary">CP</span>
            </div>
            <span className="text-lg font-semibold">ClearPath Dx</span>
          </Link>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <a href={`${PLATFORM_URL}/auth/login`}>Sign In</a>
            </Button>
            <Button size="sm" asChild>
              <a href={`${PLATFORM_URL}/auth/register/provider`}>
                Apply Now <ArrowRight className="ml-1 h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden border-b">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-primary/10" />
        <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28 lg:py-36">
          <div className="max-w-3xl">
            <div className="mb-4 inline-flex items-center rounded-full border bg-background px-4 py-1.5 text-sm font-medium text-muted-foreground">
              <MapPin className="mr-2 h-3.5 w-3.5" />
              Now accepting providers in Texas
            </div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Do the work you love.
              <br />
              <span className="text-primary">We handle the rest.</span>
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground sm:text-xl">
              ClearPath Dx connects licensed psychometrists and psychologists
              with families who need diagnostic evaluations — without the
              overhead of running a practice. Flexible hours, competitive pay,
              and a steady stream of cases.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button size="lg" asChild>
                <a href={`${PLATFORM_URL}/auth/register/provider`}>
                  Apply to Join the Network{" "}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <a href="#how-it-works">See How It Works</a>
              </Button>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4 text-green-600" />
                No platform fees
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Weekly payouts
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Set your own schedule
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* The Problem */}
      <section className="border-b py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              The bottleneck isn't talent — it's access
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Families wait 12–18 months for a diagnostic evaluation. Meanwhile,
              skilled psychometrists are underutilized — buried in admin, limited
              by single-clinic caseloads, or locked out of insurance panels.
              ClearPath fixes both sides.
            </p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-4xl font-bold text-primary">12–18 mo</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Average wait time for a pediatric diagnostic evaluation
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-4xl font-bold text-primary">1 in 36</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Children identified with autism spectrum disorder (CDC, 2023)
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-4xl font-bold text-primary">40%</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Of provider capacity lost to scheduling gaps and no-shows
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="border-b py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Why providers choose ClearPath
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              We built the platform we wished existed when we were in practice.
            </p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {BENEFITS.map((benefit) => (
              <Card key={benefit.title}>
                <CardContent className="pt-6">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <benefit.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-semibold">{benefit.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {benefit.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section
        id="how-it-works"
        className="scroll-mt-20 border-b py-16 sm:py-20"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              From application to your first case in two weeks
            </h2>
          </div>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {HOW_IT_WORKS.map((item) => (
              <div key={item.step} className="relative">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  {item.step}
                </div>
                <h3 className="font-semibold">{item.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {item.description}
                </p>
                <p className="mt-2 flex items-center gap-1 text-xs font-medium text-primary">
                  <Clock className="h-3 w-3" />
                  {item.time}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Qualifications */}
      <section className="border-b py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">
              What we look for
            </h2>
            <p className="mt-4 text-center text-lg text-muted-foreground">
              We welcome psychometrists, LSSPs, and psychologists at all career
              stages.
            </p>
            <ul className="mt-8 space-y-3">
              {QUALIFICATIONS.map((qual) => (
                <li key={qual} className="flex items-start gap-3">
                  <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
                  <span className="text-sm">{qual}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Testimonial / Social Proof placeholder */}
      <section className="border-b py-16 sm:py-20 bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mx-auto max-w-3xl text-center">
            <blockquote className="text-xl font-medium italic leading-relaxed">
              &ldquo;I was spending half my time on admin and phone tag. With
              ClearPath, I just show up, do the evaluation, and submit my
              report. My caseload doubled and my stress went down.&rdquo;
            </blockquote>
            <p className="mt-4 text-sm text-muted-foreground">
              — Licensed Psychometrist, Austin TX
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-b py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">
              Frequently asked questions
            </h2>
            <div className="mt-10 space-y-8">
              <FaqItem
                question="What types of evaluations does ClearPath coordinate?"
                answer="We primarily coordinate comprehensive developmental and psychoeducational evaluations for children ages 2–17, including autism spectrum, ADHD, learning disabilities, and intellectual disability assessments."
              />
              <FaqItem
                question="Am I an employee or an independent contractor?"
                answer="Providers on ClearPath are independent contractors. You maintain your own license, set your own schedule, and can work with other organizations simultaneously."
              />
              <FaqItem
                question="How does scheduling work?"
                answer="You set your available hours in the platform. When a case matches your availability, location, and specialties, you'll receive a notification and can accept or decline. No minimums — work as much or as little as you want."
              />
              <FaqItem
                question="Do I need my own malpractice insurance?"
                answer="ClearPath provides group professional liability coverage for all evaluations conducted through the platform. You're welcome to carry your own policy as well, but it's not required."
              />
              <FaqItem
                question="How and when do I get paid?"
                answer="Payouts are processed weekly via direct deposit. You'll see a detailed breakdown of each completed case and its reimbursement in your provider dashboard."
              />
              <FaqItem
                question="What if I'm newly licensed with limited experience?"
                answer="We welcome providers at all career stages. Newer providers may be paired with a supervising psychologist and will have access to our training library and peer consultation network."
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mx-auto max-w-3xl rounded-2xl bg-primary/5 p-8 text-center sm:p-12">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Ready to make a difference?
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Join a growing network of diagnosticians helping families get the
              answers they need — faster. Your application takes less than five
              minutes.
            </p>
            <Button size="lg" className="mt-8" asChild>
              <a href={`${PLATFORM_URL}/auth/register/provider`}>
                Apply Now <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 text-sm text-muted-foreground sm:flex-row sm:px-6">
          <p>
            &copy; {new Date().getFullYear()} ClearPath Diagnostics. All rights
            reserved.
          </p>
          <div className="flex gap-6">
            <a href={`${PLATFORM_URL}/auth/login`} className="hover:text-foreground">
              Provider Login
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FaqItem({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) {
  return (
    <div>
      <h3 className="font-semibold">{question}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {answer}
      </p>
    </div>
  );
}
