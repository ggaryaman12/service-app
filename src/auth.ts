import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

export type Role = "ADMIN" | "MANAGER" | "WORKER" | "CUSTOMER";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        loginAs: { label: "Login as", type: "text" }
      },
      async authorize(credentials) {
        const email = String(credentials?.email ?? "").toLowerCase().trim();
        const password = String(credentials?.password ?? "");
        const loginAs = String(credentials?.loginAs ?? "customer");

        if (!email || !password) return null;

        const dbUser = await prisma.user.findUnique({
          where: { email },
          select: { id: true, name: true, email: true, role: true, passwordHash: true }
        });
        if (!dbUser) return null;
        if (!verifyPassword(password, dbUser.passwordHash)) return null;

        if (loginAs === "customer" && dbUser.role !== "CUSTOMER") return null;
        if (loginAs === "staff" && dbUser.role === "CUSTOMER") return null;

        return {
          id: dbUser.id,
          name: dbUser.name,
          email: dbUser.email,
          role: dbUser.role as Role
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.role = (user as { role?: Role }).role;
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = (token.role as Role | undefined) ?? "CUSTOMER";
      }
      return session;
    }
  },
  pages: {
    signIn: "/customer/login"
  }
});
