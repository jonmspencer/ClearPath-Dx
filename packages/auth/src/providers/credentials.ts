import Credentials from "next-auth/providers/credentials";
import { prisma } from "@clearpath/database";
import bcrypt from "bcryptjs";

export const credentialsProvider = Credentials({
  credentials: {
    email: { label: "Email", type: "email" },
    password: { label: "Password", type: "password" },
  },
  async authorize(credentials) {
    if (!credentials?.email || !credentials?.password) return null;

    const email = credentials.email as string;
    const password = credentials.password as string;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user?.passwordHash) return null;

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return null;

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      image: user.image,
    };
  },
});
