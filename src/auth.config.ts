import type { NextAuthConfig } from "next-auth";

const publicPaths = ["/login", "/onboarding", "/api/auth"];

export const authConfig: NextAuthConfig = {
  pages: { signIn: "/login" },
  providers: [],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isPublic = publicPaths.some((p) => nextUrl.pathname.startsWith(p));
      if (isPublic) return true;
      return !!auth?.user;
    },
  },
};
