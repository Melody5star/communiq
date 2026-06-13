import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      memberId: string;
      tenantId: string;
      tenantSlug: string;
      role: string;
    };
  }
}
