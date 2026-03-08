import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@clearpath/ui/components/button";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
        <span className="text-2xl font-bold text-primary">CP</span>
      </div>
      <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl">
        ClearPath Dx
      </h1>
      <p className="mt-4 max-w-lg text-lg text-muted-foreground">
        The neutral diagnostics marketplace connecting families with licensed
        providers for faster pediatric evaluations.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button size="lg" asChild>
          <Link href="/for-providers">
            Join as a Provider <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
        <Button variant="outline" size="lg" asChild>
          <a href={process.env.NEXT_PUBLIC_PLATFORM_URL ?? "https://app.clearpathdx.com"}>
            Sign In to Platform
          </a>
        </Button>
      </div>
    </div>
  );
}
