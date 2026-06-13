import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/db";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
      },
      authorize: async (credentials) => {
        const email = credentials?.email as string;
        if (!email) return null;

        const member = await prisma.member.findFirst({
          where: { email },
          include: { tenant: true },
        });

        if (!member) return null;

        return {
          id: member.id,
          email: member.email,
          name: member.displayName,
          tenantId: member.tenantId,
          tenantSlug: member.tenant.slug,
          role: member.role,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.memberId = user.id;
        token.tenantId = (user as { tenantId: string }).tenantId;
        token.tenantSlug = (user as { tenantSlug: string }).tenantSlug;
        token.role = (user as { role: string }).role;
      }
      return token;
    },
    session({ session, token }) {
      session.user.memberId = token.memberId as string;
      session.user.tenantId = token.tenantId as string;
      session.user.tenantSlug = token.tenantSlug as string;
      session.user.role = token.role as string;
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" },
});
