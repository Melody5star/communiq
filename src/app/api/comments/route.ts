import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getDb } from "@/lib/db";
import { randomUUID } from "crypto";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { tenantId, postId, body, parentId } = await req.json();
    if (!tenantId || !postId || !body) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const db = await getDb();
    const comment = await db.comment.create({
      data: {
        id: randomUUID(),
        tenantId,
        postId,
        authorId: session.user.memberId,
        body,
        parentId: parentId || null,
      },
    });

    return NextResponse.json({ success: true, commentId: comment.id });
  } catch (err) {
    console.error("Create comment error:", err);
    return NextResponse.json({ error: "Failed to post comment" }, { status: 500 });
  }
}
