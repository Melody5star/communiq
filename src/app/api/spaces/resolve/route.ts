import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const tenantSlug = searchParams.get("tenantSlug");
  const spaceSlug = searchParams.get("spaceSlug");

  if (!tenantSlug || !spaceSlug) return NextResponse.json({ error: "Missing params" }, { status: 400 });

  const db = await getDb();
  const tenant = await db.tenant.findFirst({ where: { slug: tenantSlug } });
  if (!tenant) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const space = await db.space.findFirst({ where: { tenantId: tenant.id, slug: spaceSlug } });
  if (!space) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ tenantId: tenant.id, spaceId: space.id });
}
