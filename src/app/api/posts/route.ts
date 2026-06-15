import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getDb } from "@/lib/db";
import { randomUUID } from "crypto";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { tenantId, spaceId, title, body } = await req.json();
    if (!tenantId || !spaceId || !title || !body) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const db = await getDb();
    const post = await db.post.create({
      data: {
        id: randomUUID(),
        tenantId,
        spaceId,
        authorId: session.user.memberId,
        title,
        body,
      },
    });

    await db.space.update({
      where: { id: spaceId },
      data: { postCount: { increment: 1 } },
    });

    return NextResponse.json({ success: true, postId: post.id });
  } catch (err) {
    console.error("Create post error:", err);
    return NextResponse.json({ error: "Failed to create post" }, { status: 500 });
  }
}
