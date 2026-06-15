import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getDb } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = req.nextUrl;
    const q = searchParams.get("q")?.trim();
    const tenantId = searchParams.get("tenantId");

    if (!q || !tenantId) return NextResponse.json({ results: [] });

    const db = await getDb();
    const posts = await db.post.findMany({
      where: {
        tenantId,
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { body: { contains: q, mode: "insensitive" } },
        ],
      },
      include: { author: true, space: true },
      take: 20,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ results: posts });
  } catch (err) {
    console.error("Search error:", err);
    return NextResponse.json({ results: [] });
  }
}
