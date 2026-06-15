import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getDb } from "@/lib/db";
import { randomUUID } from "crypto";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { entityType, entityId, reaction } = await req.json();
    if (!entityType || !entityId) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    const db = await getDb();
    const existing = await db.reaction.findFirst({
      where: { entityId, memberId: session.user.memberId, reaction: reaction || "upvote" },
    });

    if (existing) {
      await db.reaction.delete({ where: { id: existing.id } });
      return NextResponse.json({ action: "removed" });
    }

    await db.reaction.create({
      data: {
        id: randomUUID(),
        entityType,
        entityId,
        memberId: session.user.memberId,
        reaction: reaction || "upvote",
      },
    });
    return NextResponse.json({ action: "added" });
  } catch (err) {
    console.error("Reaction error:", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
