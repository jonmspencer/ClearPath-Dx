import { edgeAuth } from "@clearpath/auth/edge";
import { NextResponse } from "next/server";

export default edgeAuth((req: any) => {
  const isLoggedIn = !!req.auth;
  const { pathname } = req.nextUrl;

  // Public routes
  const publicRoutes = ["/auth/login", "/auth/verify", "/auth/otp", "/auth/error", "/auth/register"];
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));

  if (isPublicRoute) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    return NextResponse.next();
  }

  // Protected routes
  if (!isLoggedIn) {
    const loginUrl = new URL("/auth/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!api/auth|api/health|api/webhooks|api/cron|_next/static|_next/image|favicon.ico).*)",
  ],
};
