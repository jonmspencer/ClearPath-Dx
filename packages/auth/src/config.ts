import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@clearpath/database";
import { emailProvider } from "./providers/email";
import { credentialsProvider } from "./providers/credentials";
import { jwtCallback, sessionCallback } from "./callbacks";
import type { NextAuthConfig } from "next-auth";

export const authConfig: NextAuthConfig = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
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
    authorized({ auth }) {
      return !!auth?.user;
    },
  },
};

export const { auth, handlers, signIn, signOut } = NextAuth(authConfig);
