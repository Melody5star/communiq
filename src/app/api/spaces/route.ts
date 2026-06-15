import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getDb } from "@/lib/db";
import { randomUUID } from "crypto";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { tenantId, name, description } = await req.json();
    if (!tenantId || !name) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    const slug = name.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-").slice(0, 30);

    const db = await getDb();
    const existing = await db.space.findFirst({ where: { tenantId, slug } });
    if (existing) return NextResponse.json({ error: "A space with that name already exists" }, { status: 409 });

    const space = await db.space.create({
      data: { id: randomUUID(), tenantId, name, slug, description: description || null },
    });

    return NextResponse.json({ success: true, slug: space.slug });
  } catch (err) {
    console.error("Create space error:", err);
    return NextResponse.json({ error: "Failed to create space" }, { status: 500 });
  }
}
