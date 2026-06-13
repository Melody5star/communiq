import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { randomUUID } from "crypto";

export async function POST(req: NextRequest) {
  try {
    const { communityName, slug, displayName, email } = await req.json();

    if (!communityName || !slug || !displayName || !email) {
      return NextResponse.json({ error: "All fields required" }, { status: 400 });
    }

    const db = await getDb();

    const existing = await db.tenant.findFirst({ where: { slug } });
    if (existing) {
      return NextResponse.json({ error: "That slug is already taken. Try another." }, { status: 409 });
    }

    const tenantId = randomUUID();
    const memberId = randomUUID();

    await db.tenant.create({
      data: { id: tenantId, name: communityName, slug, plan: "free" },
    });

    await db.member.create({
      data: {
        id: memberId,
        tenantId,
        email,
        displayName,
        role: "admin",
        region: process.env.DSQL_REGION ?? "us-east-1",
      },
    });

    return NextResponse.json({ success: true, slug });
  } catch (err) {
    console.error("Onboarding error:", err);
    return NextResponse.json({ error: "Failed to create community" }, { status: 500 });
  }
}
