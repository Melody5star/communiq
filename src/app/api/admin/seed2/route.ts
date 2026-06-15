import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getDb } from "@/lib/db";
import { randomUUID } from "crypto";

// Seeds a second demo tenant to show white-label / multi-tenant capability
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const db = await getDb();

    const existing = await db.tenant.findFirst({ where: { slug: "buildersclub" } });
    if (existing) return NextResponse.json({ message: "Already exists", slug: "buildersclub" });

    const tenantId = randomUUID();
    const adminId = randomUUID();

    await db.tenant.create({
      data: { id: tenantId, name: "Builders Club", slug: "buildersclub", primaryColor: "#10b981", plan: "free" },
    });

    await db.member.create({
      data: { id: adminId, tenantId, email: "admin@buildersclub.dev", displayName: "Rohan Mehta", role: "admin", region: "ap-south-1" },
    });

    const spaces = [
      { name: "General", slug: "general", description: "General discussion" },
      { name: "Showcase", slug: "showcase", description: "Share what you've built" },
      { name: "Help & Support", slug: "help", description: "Ask questions, get unstuck" },
    ];

    const spaceIds: Record<string, string> = {};
    for (const s of spaces) {
      const id = randomUUID();
      await db.space.create({ data: { id, tenantId, ...s } });
      spaceIds[s.slug] = id;
    }

    const posts = [
      { spaceSlug: "general", title: "Welcome to Builders Club! 👋", body: "This is our space for indie hackers, founders, and builders. Share what you're working on, get feedback, and find collaborators. The only rule: build in public!" },
      { spaceSlug: "showcase", title: "I shipped my first SaaS product last week", body: "After 3 months of building in the evenings, I launched a tool that automatically generates technical documentation from your codebase using AI. First 5 paying customers already! Here's what I learned from the launch..." },
      { spaceSlug: "showcase", title: "Built a RAG chatbot for legal documents — free to try", body: "Spent the last 6 weeks building a system that can answer questions about legal contracts. It uses Claude + Bedrock Knowledge Bases. Accuracy is around 94% on our test set. Would love beta testers!" },
      { spaceSlug: "help", title: "Best stack for a multi-tenant SaaS in 2026?", body: "I'm starting a new B2B SaaS and trying to decide on the architecture. Currently leaning toward Next.js + Aurora DSQL for the database (saw a demo of the multi-region capabilities and was blown away). Anyone else using this stack in production?" },
    ];

    for (const p of posts) {
      const postId = randomUUID();
      await db.post.create({
        data: { id: postId, tenantId, spaceId: spaceIds[p.spaceSlug], authorId: adminId, title: p.title, body: p.body, upvotes: Math.floor(Math.random() * 8) + 1 },
      });
      await db.space.update({ where: { id: spaceIds[p.spaceSlug] }, data: { postCount: { increment: 1 } } });
    }

    return NextResponse.json({ success: true, slug: "buildersclub", url: "/t/buildersclub" });
  } catch (err) {
    console.error("Seed2 error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
