import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@clearpath/database";
import { emailProvider } from "./providers/email";
import { credentialsProvider } from "./providers/credentials";
import { jwtCallback, sessionCallback } from "./callbacks";

export const authConfig = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt" as const,
    maxAge: 8 * 60 * 60, // 8 hours — HIPAA-aligned session timeout
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
    verifyRequest: "/auth/verify",
  },
  providers: [emailProvider, credentialsProvider],
  callbacks: {
    jwt: jwtCallback,
    session: sessionCallback,
    authorized({ auth }: any) {
      return !!auth?.user;
    },
  },
};

export const { auth, handlers, signIn, signOut } = (NextAuth as any)(authConfig);
