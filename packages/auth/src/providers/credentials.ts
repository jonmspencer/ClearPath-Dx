import Credentials from "next-auth/providers/credentials";
import { prisma } from "@clearpath/database";
import bcrypt from "bcryptjs";

export const credentialsProvider = Credentials({
  credentials: {
    email: { label: "Email", type: "email" },
    password: { label: "Password", type: "password" },
  },
  async authorize(credentials) {
    try {
      if (!credentials?.email || !credentials?.password) return null;

      const email = credentials.email as string;
      const password = credentials.password as string;

      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user?.passwordHash) {
        console.log("[auth] No user found or no password hash for:", email);
        return null;
      }

      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) {
        console.log("[auth] Invalid password for:", email);
        return null;
      }

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
      };
    } catch (error) {
      console.error("[auth] Credentials authorize error:", error);
      return null;
    }
  },
});
