import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { randomUUID } from "crypto";

export async function POST(req: NextRequest) {
  try {
    const { tenantId, displayName, email } = await req.json();
    if (!tenantId || !displayName || !email) {
      return NextResponse.json({ error: "All fields required" }, { status: 400 });
    }

    const db = await getDb();
    const existing = await db.member.findFirst({ where: { tenantId, email } });
    if (existing) return NextResponse.json({ success: true, alreadyMember: true });

    await db.member.create({
      data: {
        id: randomUUID(),
        tenantId,
        email,
        displayName,
        role: "member",
        region: process.env.DSQL_REGION ?? "us-east-1",
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Join error:", err);
    return NextResponse.json({ error: "Failed to join" }, { status: 500 });
  }
}
