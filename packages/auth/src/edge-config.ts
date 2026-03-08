import NextAuth from "next-auth";

// Edge-safe auth config for middleware — no Node.js-only imports
// Only checks JWT session, does not handle sign-in flows
export const edgeAuthConfig = {
  session: {
    strategy: "jwt" as const,
    maxAge: 8 * 60 * 60,
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
    verifyRequest: "/auth/verify",
  },
  providers: [] as any[],
  callbacks: {
    authorized({ auth }: any) {
      return !!auth?.user;
    },
  },
};

export const { auth: edgeAuth } = (NextAuth as any)(edgeAuthConfig);
