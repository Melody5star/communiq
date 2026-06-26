import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getDb } from "@/lib/db";
import { randomUUID } from "crypto";

const SAATHI_MEMBERS = [
  { email: "priya.sharma@saathi.dev", displayName: "Priya Sharma", region: "ap-south-1" },
  { email: "rahul.verma@saathi.dev", displayName: "Rahul Verma", region: "ap-south-1" },
  { email: "deepa.nair@saathi.dev", displayName: "Deepa Nair", region: "eu-west-1" },
  { email: "arjun.mehta@saathi.dev", displayName: "Arjun Mehta", region: "us-west-2" },
  { email: "sneha.patel@saathi.dev", displayName: "Sneha Patel", region: "ap-southeast-1" },
  { email: "vikram.iyer@saathi.dev", displayName: "Vikram Iyer", region: "us-east-1" },
];

const SAATHI_EXTRA_POSTS = [
  {
    spaceSlug: "introductions",
    authorEmail: "priya.sharma@saathi.dev",
    title: "Hey from Bangalore! ML engineer building fraud detection with LLMs",
    body: `Hi Saathi community! I'm Priya, ML engineer at a fintech startup in Bangalore.\n\nCurrently building a real-time fraud detection system using LLMs + AWS Bedrock. The latency requirements are brutal (sub-100ms decisions on every transaction) so we're doing a lot of work on prompt caching and batching.\n\nCan't live without Claude for code reviews — it catches things I miss every time!\n\nExcited to learn from everyone here. What are you all building? 👋`,
    upvotes: 14,
  },
  {
    spaceSlug: "introductions",
    authorEmail: "rahul.verma@saathi.dev",
    title: "Backend dev pivoting into AI — just shipped my first RAG chatbot!",
    body: `Hello Saathi! I'm Rahul from Mumbai.\n\nI'm a backend dev (5 years Go + Python) who's been learning about embeddings and vector search for the past 3 months. Just shipped my first RAG chatbot last week — it answers questions about our company's internal docs.\n\nSurprisingly, the hardest part wasn't the ML — it was chunking strategy. Anyone have tips for handling long PDFs with lots of tables?\n\nLooking forward to learning from everyone here!`,
    upvotes: 9,
  },
  {
    spaceSlug: "ai-ml",
    authorEmail: "arjun.mehta@saathi.dev",
    title: "Aurora DSQL + AI agents: why the database choice matters more than you think",
    body: `I've been building AI agents for 18 months. The database powering your agent's memory layer matters enormously. Here's what I learned switching to Aurora DSQL:\n\n**The problem with traditional databases for agents:**\n- Agent actions often involve multi-step transactions spanning seconds or minutes\n- Concurrent agents can create nasty race conditions on shared state\n- Eventual consistency is a disaster when an agent is reading its own recent writes\n\n**Why Aurora DSQL is different:**\n- Strong consistency — an agent's write in us-east-1 is immediately visible in us-west-2\n- Optimistic concurrency control — perfect for agents that rarely conflict\n- Serverless — agent workloads are spiky; DSQL scales to zero between runs\n\n**Practical example:**\nI have a research agent that fans out 10 sub-agents, each writing findings to a shared DSQL table. The orchestrator reads the final state. With DynamoDB, I needed polling + retries. With DSQL, a simple `SELECT ... WHERE status = 'complete'` just works.\n\nThe database is the agent's brain. Choose carefully.`,
    upvotes: 23,
  },
  {
    spaceSlug: "ai-ml",
    authorEmail: "deepa.nair@saathi.dev",
    title: "No-code AI automation in 2026 — what actually works for non-developers",
    body: `I'm a product manager turned AI builder. I don't write production code, but I ship AI automations every week. Here's my current toolkit:\n\n**For automations (no code):**\n- Make.com + Claude API — I connect Claude to anything via webhooks. Meeting notes → action items → Notion → Slack. All automated.\n- Zapier AI actions — slower but easier for non-technical teammates\n\n**For prototyping (low code):**\n- v0.dev — I describe a UI and get React components. Then I hand off to devs.\n- Cursor — even as a non-dev, I can make small changes with AI assistance\n\n**What doesn't work (for non-devs):**\n- LangChain — too much Python required\n- Building your own vector DB — just use Bedrock Knowledge Bases\n\n**My superpower:** I can prototype and validate an AI feature in 2 days without touching the backend. By the time a dev builds it "properly," I've already validated it with 20 users.\n\nAny other non-dev builders here?`,
    upvotes: 17,
  },
  {
    spaceSlug: "resources",
    authorEmail: "sneha.patel@saathi.dev",
    title: "The AWS certification roadmap for AI/ML engineers in 2026 (updated)",
    body: `I just passed my AWS Machine Learning Specialty cert and wanted to share the updated path for 2026:\n\n**Foundation (start here):**\n1. AWS Cloud Practitioner — 2 weeks, covers basics. Use ExamPro free course.\n2. AWS Solutions Architect Associate — 4-6 weeks. This is where you learn the core services.\n\n**AI/ML Track:**\n3. AWS AI Practitioner (NEW in 2025) — Focuses on generative AI, Bedrock, responsible AI. Easier than MLS but very relevant.\n4. AWS Machine Learning Specialty — Hard. Needs strong math + Python. Use A Cloud Guru or Stephane Maarek.\n\n**Why certifications matter for AI builders:**\n- Forces you to understand IAM deeply (critical for Bedrock + DSQL auth)\n- Covers cost optimization — important when LLM costs scale\n- Opens doors to enterprise clients who care about AWS expertise\n\n**Study tip:** Do the labs, not just the theory. The hands-on AWS Skill Builder labs are free and excellent.\n\nHappy to answer questions — I've taken 4 AWS certs in the last 18 months.`,
    upvotes: 19,
  },
  {
    spaceSlug: "ai-ml",
    authorEmail: "vikram.iyer@saathi.dev",
    title: "I ran load tests on Aurora DSQL at 10K concurrent connections — here are the results",
    body: `For context: I'm building a community platform (sound familiar? 😄) and needed to validate Aurora DSQL under real load before going to production.\n\n**Test setup:**\n- 10,000 simulated concurrent users\n- Mixed read/write workload (80% reads, 20% writes)\n- Queries: post feed, comment loading, upvote toggles, search\n- Region: us-east-1\n\n**Results:**\n\nP50 latency: 4ms\nP95 latency: 18ms\nP99 latency: 47ms\nError rate: 0.001% (all connection pool exhaustion, not DB errors)\n\n**What surprised me:**\n- Zero cold start — DSQL was warm immediately even after 30 min idle\n- Search queries (tsvector) held up well — P95 under 25ms at 10K concurrent\n- The optimistic concurrency on upvotes worked perfectly. Zero conflicts despite hammering the same post.\n\n**The one gotcha:**\nConnection pool management is critical. DSQL has a max connections limit. With Prisma's default pool size, I hit it at ~2K concurrent users. Solution: tune pool size + use connection pooling middleware.\n\n**Bottom line:** Aurora DSQL is production-ready for community platform scale. Recommended.`,
    upvotes: 31,
  },
];

const BUILDERS_EXTRA_MEMBERS = [
  { email: "sarah.chen@builders.dev", displayName: "Sarah Chen", region: "us-west-2" },
  { email: "marcus.lee@builders.dev", displayName: "Marcus Lee", region: "eu-west-1" },
  { email: "alex.rivera@builders.dev", displayName: "Alex Rivera", region: "us-east-1" },
];

const BUILDERS_EXTRA_POSTS = [
  {
    spaceSlug: "showcase",
    authorEmail: "sarah.chen@builders.dev",
    title: "Launched my AI writing tool — $1,200 MRR in month 1",
    body: `Six months of evenings and weekends. Here's the honest breakdown:\n\n**The product:** AI-powered long-form content editor. Helps writers maintain consistent voice across articles. Trained on the user's own writing samples.\n\n**Tech stack:**\n- Next.js + Aurora DSQL (for user writing samples + sessions)\n- Claude API for generation\n- Stripe for billing\n- Vercel for hosting\n\n**Month 1 numbers:**\n- 340 signups\n- 23 paying customers\n- $1,200 MRR (mix of $39 and $79/mo plans)\n- Churn: 2 customers (both cited "not writing enough to justify the cost")\n\n**What worked:** Cold outreach to writing communities (Substack, LinkedIn newsletters). Personal DMs, not blasts.\n\n**What didn't:** Product Hunt launch — got 180 upvotes, zero paying customers from it.\n\n**Next milestone:** $5K MRR. Currently focusing on onboarding — 60% of free users never create their second article.\n\nAMA!`,
    upvotes: 28,
  },
  {
    spaceSlug: "general",
    authorEmail: "marcus.lee@builders.dev",
    title: "Why I chose Aurora DSQL over PlanetScale for my multi-tenant SaaS",
    body: `I evaluated 6 databases for my B2B SaaS. Here's why Aurora DSQL won:\n\n**The decision criteria:**\n1. Multi-tenancy — tenant isolation at DB level, not just app level\n2. Global latency — customers in EU + APAC, can't have US-only\n3. Cost predictability — tired of surprise bills\n4. PostgreSQL compatibility — I know Postgres, don't want to relearn\n\n**Why not the others:**\n- PlanetScale: No foreign keys (deal breaker for complex data model)\n- Neon: Great product but US-only regions at the time\n- Supabase: Amazing DX but single-region per project\n- CockroachDB: Too expensive at my scale\n- RDS: Ops overhead I don't want\n\n**Why Aurora DSQL:**\n- Active-active multi-region (eu-west-1 + us-east-1)\n- Serverless — literally $0 when no one is using the app at 3am\n- IAM auth — no connection string rotation, works with my existing AWS roles\n- Strong consistency — critical for billing logic\n\n6 months in: zero regrets. P99 latency from London is 12ms. Costs $8/month at current scale.`,
    upvotes: 22,
  },
  {
    spaceSlug: "help",
    authorEmail: "alex.rivera@builders.dev",
    title: "How do you handle customer churn conversations? (early-stage SaaS)",
    body: `I have 45 paying customers. Last month 4 churned. I emailed all 4 — 2 replied.\n\nHere's what they said:\n- "We're cutting costs" (budget freeze)\n- "We found a cheaper alternative" (didn't name it)\n\nI know I should be talking to churned customers to learn but it feels awkward. A few questions for anyone who's been through this:\n\n1. Do you reach out immediately when they cancel, or wait a week?\n2. What's your script / opener? I don't want to sound desperate.\n3. How do you get honest feedback when they might just be polite?\n4. Is 4/45 churn in a month (8.9%) alarming at this stage, or normal?\n\nI'm building a B2B productivity tool, average contract is $120/month. Happy to share more context. Any advice appreciated.`,
    upvotes: 15,
  },
];

export async function POST() {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const db = await getDb();

    const saathiTenant = await db.tenant.findFirst({ where: { slug: "saathi" } });
    const buildersTenant = await db.tenant.findFirst({ where: { slug: "buildersclub" } });

    if (!saathiTenant || !buildersTenant) {
      return NextResponse.json({ error: "Tenants not found — run seed and seed2 first" }, { status: 404 });
    }

    const results = { saathi: { members: 0, posts: 0 }, builders: { members: 0, posts: 0 } };

    // --- Saathi: add members ---
    const saathiMemberIds: Record<string, string> = {};
    for (const m of SAATHI_MEMBERS) {
      const existing = await db.member.findFirst({ where: { tenantId: saathiTenant.id, email: m.email } });
      if (existing) {
        saathiMemberIds[m.email] = existing.id;
      } else {
        const created = await db.member.create({
          data: { id: randomUUID(), tenantId: saathiTenant.id, email: m.email, displayName: m.displayName, role: "member", region: m.region },
        });
        saathiMemberIds[m.email] = created.id;
        results.saathi.members++;
      }
    }

    // --- Saathi: add posts ---
    const saathiSpaces = await db.space.findMany({ where: { tenantId: saathiTenant.id } });
    const saathiSpaceMap: Record<string, string> = {};
    for (const s of saathiSpaces) saathiSpaceMap[s.slug] = s.id;

    for (const p of SAATHI_EXTRA_POSTS) {
      const spaceId = saathiSpaceMap[p.spaceSlug];
      const authorId = saathiMemberIds[p.authorEmail];
      if (!spaceId || !authorId) continue;

      const existing = await db.post.findFirst({ where: { tenantId: saathiTenant.id, title: p.title } });
      if (existing) continue;

      await db.post.create({
        data: { id: randomUUID(), tenantId: saathiTenant.id, spaceId, authorId, title: p.title, body: p.body, upvotes: p.upvotes },
      });
      await db.space.update({ where: { id: spaceId }, data: { postCount: { increment: 1 } } });
      results.saathi.posts++;
    }

    // --- Builders Club: add members ---
    const buildersMemberIds: Record<string, string> = {};
    for (const m of BUILDERS_EXTRA_MEMBERS) {
      const existing = await db.member.findFirst({ where: { tenantId: buildersTenant.id, email: m.email } });
      if (existing) {
        buildersMemberIds[m.email] = existing.id;
      } else {
        const created = await db.member.create({
          data: { id: randomUUID(), tenantId: buildersTenant.id, email: m.email, displayName: m.displayName, role: "member", region: m.region },
        });
        buildersMemberIds[m.email] = created.id;
        results.builders.members++;
      }
    }

    // --- Builders Club: add posts ---
    const buildersSpaces = await db.space.findMany({ where: { tenantId: buildersTenant.id } });
    const buildersSpaceMap: Record<string, string> = {};
    for (const s of buildersSpaces) buildersSpaceMap[s.slug] = s.id;

    for (const p of BUILDERS_EXTRA_POSTS) {
      const spaceId = buildersSpaceMap[p.spaceSlug];
      const authorId = buildersMemberIds[p.authorEmail];
      if (!spaceId || !authorId) continue;

      const existing = await db.post.findFirst({ where: { tenantId: buildersTenant.id, title: p.title } });
      if (existing) continue;

      await db.post.create({
        data: { id: randomUUID(), tenantId: buildersTenant.id, spaceId, authorId, title: p.title, body: p.body, upvotes: p.upvotes },
      });
      await db.space.update({ where: { id: spaceId }, data: { postCount: { increment: 1 } } });
      results.builders.posts++;
    }

    const saathiMemberCount = await db.member.count({ where: { tenantId: saathiTenant.id } });
    const saathiPostCount = await db.post.count({ where: { tenantId: saathiTenant.id } });
    const buildersMemberCount = await db.member.count({ where: { tenantId: buildersTenant.id } });
    const buildersPostCount = await db.post.count({ where: { tenantId: buildersTenant.id } });

    return NextResponse.json({
      success: true,
      added: results,
      totals: {
        saathi: { members: saathiMemberCount, posts: saathiPostCount },
        builders: { members: buildersMemberCount, posts: buildersPostCount },
      },
    });
  } catch (err) {
    console.error("Seed3 error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
