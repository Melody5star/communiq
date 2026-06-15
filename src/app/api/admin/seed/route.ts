import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getDb } from "@/lib/db";
import { randomUUID } from "crypto";

const SPACES = [
  { name: "Announcements", slug: "announcements", description: "Important updates from the team" },
  { name: "Introductions", slug: "introductions", description: "Say hello and introduce yourself" },
  { name: "AI & Machine Learning", slug: "ai-ml", description: "Discuss models, agents, and everything AI" },
  { name: "Resources", slug: "resources", description: "Tutorials, tools, and learning materials" },
];

const SEED_POSTS = [
  {
    spaceSlug: "announcements",
    title: "Welcome to Saathi — we're officially live on Aurora DSQL! 🚀",
    body: `After weeks of building, Saathi is officially live!\n\nWe're running on AWS Aurora DSQL — a distributed, serverless PostgreSQL-compatible database with active-active multi-region support. This means:\n\n✅ No servers to manage\n✅ Scales to zero when idle\n✅ Sub-millisecond reads globally\n✅ Active-active writes across regions\n\nWherever you are in the world, you'll get fast, consistent community data. We're starting with us-east-1 and will expand to eu-west-1 and ap-southeast-1 soon.\n\nThank you for being an early member. Your feedback will shape what we build next. 🙌`,
  },
  {
    spaceSlug: "introductions",
    title: "Hi! I'm Anamika — AI builder, agent creator & founder of Saathi",
    body: `Hey everyone! I'm Anamika Bajpai 👋\n\nI've been obsessed with AI for the past 2 years, especially agent-based architectures. I created Saathi because I wanted a dedicated space for builders like us — people who are shipping AI products, learning in public, and pushing what's possible.\n\nA bit about me:\n🔧 Building AI agents with Claude + AWS Bedrock\n🌱 Learning multi-region distributed systems (hence Aurora DSQL!)\n📍 Based in India, connecting with builders globally\n\nI'm so excited to have you here. Drop a reply and tell me what you're building! 💡`,
  },
  {
    spaceSlug: "introductions",
    title: "✋ Introduce yourself — tell us who you are and what you build!",
    body: `This is the place to say hello to the community!\n\nDrop a reply with:\n👤 Your name and where you're from\n🔨 What you're currently building or learning\n🤖 One AI tool you can't live without\n🎯 One thing you hope to get from this community\n\nNo lurking allowed — we're all here to learn together. The more you share, the more you get back. Let's go! 🚀`,
  },
  {
    spaceSlug: "ai-ml",
    title: "Claude 3.5 Sonnet for agent building — honest review after 90 days",
    body: `I've been building AI agents with Claude 3.5 Sonnet for 3 months and wanted to share my honest experience.\n\n**What's genuinely great:**\n- Tool use reliability is remarkable. I have agents with 12+ tools and it almost always picks the right one on the first try.\n- Long context (200K tokens) means I can give it entire codebases to reason about — no chunking needed.\n- Instruction following is precise. It doesn't hallucinate tool arguments or make up field names.\n- The "thinking" mode for complex reasoning is a game changer for multi-step workflows.\n\n**Things to watch out for:**\n- Cost adds up quickly with long contexts. Profile your prompts early and be selective about what goes in.\n- It can sometimes be overly cautious and needs explicit permission to take bold autonomous actions.\n- Latency is higher than GPT-4o for long outputs — matters for real-time UX.\n\n**Verdict:** Best model for production agents right now. Pairing it with AWS Bedrock gives you IAM-based auth, no API key management, and VPC integration. Highly recommend.`,
  },
  {
    spaceSlug: "ai-ml",
    title: "How I built a RAG pipeline in 3 hours using AWS Bedrock Knowledge Bases",
    body: `Step-by-step tutorial. No prior Bedrock experience needed.\n\n**What we're building:** A RAG system that answers questions from your documents.\n\n**Step 1: Upload documents to S3** (10 min)\nCreate an S3 bucket, upload your PDFs/docs. Enable versioning.\n\n**Step 2: Create a Bedrock Knowledge Base** (15 min)\n- Go to AWS Bedrock → Knowledge Bases → Create\n- Point it at your S3 bucket\n- Choose Amazon Titan for embeddings (included in Bedrock)\n- Let it sync — takes 2-5 min for typical docs\n\n**Step 3: Query with Claude** (20 min)\n\`\`\`python\nbedrock = boto3.client('bedrock-agent-runtime')\n\nresponse = bedrock.retrieve_and_generate(\n    input={'text': 'What does our refund policy say?'},\n    retrieveAndGenerateConfiguration={\n        'type': 'KNOWLEDGE_BASE',\n        'knowledgeBaseConfiguration': {\n            'knowledgeBaseId': 'YOUR_KB_ID',\n            'modelArn': 'arn:aws:bedrock:us-east-1::foundation-model/anthropic.claude-3-5-sonnet'\n        }\n    }\n)\nprint(response['output']['text'])\n\`\`\`\n\n**The most surprising thing?** No vector DB to manage. Bedrock handles everything — embeddings, storage, retrieval, re-ranking. Total cost: ~$0.10/hour for syncing.\n\nWhat questions do you have? Happy to go deeper on any step.`,
  },
  {
    spaceSlug: "ai-ml",
    title: "Prompt engineering in 2026 — what actually works (and what doesn't)",
    body: `After prompting hundreds of LLMs across dozens of projects, here's what I've learned:\n\n**✅ WORKS (reliably):**\n- Chain of thought: "Think step by step before answering" — still gold in 2026\n- Role prompting for specialized tasks: "You are a senior security engineer reviewing this code..."\n- Few-shot examples: 3-5 examples dramatically improves formatting consistency\n- Explicit output schemas: "Return ONLY a JSON object with keys: title, summary, tags"\n- Negative constraints: "Do NOT include markdown. Do NOT explain your reasoning."\n- XML tags for structure: Claude especially responds well to <task>, <context>, <output> tags\n\n**❌ DOESN'T WORK ANYMORE:**\n- Magic words like "REACT:" or "ANSWER:" from old tutorials\n- Telling the model to "ignore previous instructions"\n- Lengthy disclaimers in system prompts (they're mostly ignored)\n- Asking for "step 1, step 2..." when you don't actually want numbered output\n\n**The meta-lesson:** Models in 2026 are genuinely smart. Treat them like a smart intern, not a pattern matcher. Clear context + clear task + clear constraints = great results.`,
  },
  {
    spaceSlug: "resources",
    title: "Top 5 free resources to master AI engineering in 2026 (my curated list)",
    body: `This is the list I share with everyone who asks me "how do I get started with AI?"\n\n**1. AWS Skill Builder — Bedrock Learning Plan**\nFree tier has comprehensive Amazon Bedrock courses. Hands-on labs included. Start here if you're building on AWS.\n🔗 skillbuilder.aws\n\n**2. Anthropic's Prompt Engineering Guide**\nThe authoritative source on prompting Claude. Better than 90% of paid courses. Read every section.\n🔗 docs.anthropic.com/en/docs/build-with-claude/prompt-engineering\n\n**3. LangChain Academy**\nPractical agent building from scratch. The LangGraph course is especially good for understanding agent state machines.\n🔗 academy.langchain.com\n\n**4. Hugging Face Course**\nStill the best resource for understanding how transformers actually work. Essential for debugging weird model behavior.\n🔗 huggingface.co/learn\n\n**5. fast.ai — Practical Deep Learning**\nIf you want to understand the math without a PhD. Jeremy Howard's teaching style is exceptional.\n🔗 fast.ai\n\n**Bonus:** Simon Willison's blog (simonwillison.net) — he documents everything AI-related with deep technical insight. Follow him.\n\nWhat resources have you found most useful? Share in the replies!`,
  },
  {
    spaceSlug: "resources",
    title: "AWS Bedrock vs OpenAI API — honest cost comparison for builders",
    body: `I did the math so you don't have to. Assuming production workload of ~1M tokens/day:\n\n**OpenAI GPT-4o (pay-as-you-go)**\n- Input: $2.50/1M tokens\n- Output: $10.00/1M tokens\n- No infrastructure setup needed\n- Global endpoints, fast\n\n**AWS Bedrock — Claude 3.5 Sonnet**\n- Input: $3.00/1M tokens  \n- Output: $15.00/1M tokens\n- But: Runs in your VPC, IAM auth, no API keys to rotate\n- Free data transfer within AWS (huge at scale)\n\n**AWS Bedrock — Claude 3 Haiku (budget option)**\n- Input: $0.25/1M tokens\n- Output: $1.25/1M tokens\n- 10x cheaper, great for high-volume classification/extraction tasks\n\n**The real factors beyond token price:**\n✅ Bedrock: SOC2/HIPAA compliant by default, no data leaves your AWS account\n✅ Bedrock: IAM auth means no secret rotation, works with existing AWS roles\n✅ Bedrock: Provisioned Throughput for predictable latency at scale\n✅ OpenAI: Faster to prototype, no AWS account needed\n✅ OpenAI: Better function calling developer experience (currently)\n\n**My verdict:** Start with OpenAI for prototyping. Switch to Bedrock when you need compliance, scale, or existing AWS infrastructure integration. The Bedrock cost premium pays for itself in security + ops savings.`,
  },
];

const SEED_COMMENTS = [
  {
    postTitle: "✋ Introduce yourself",
    body: "Hey everyone! I'm Priya, ML engineer at a fintech startup in Bangalore. Building a real-time fraud detection system using LLMs. Can't live without Claude for code reviews — it catches things I miss every time! Excited to be here 👋",
  },
  {
    postTitle: "✋ Introduce yourself",
    body: "Hi Saathi community! I'm Rahul from Mumbai — backend dev pivoting into AI. Currently learning about embeddings and vector search. Just shipped my first RAG chatbot last week. Looking forward to learning from everyone here!",
  },
  {
    postTitle: "✋ Introduce yourself",
    body: "Hello! I'm Deepa, product manager turned AI builder. I use no-code AI tools to automate workflows and build prototypes. My superpower: I can prompt engineer in plain English 😄 Excited to connect with developers here!",
  },
  {
    postTitle: "How I built a RAG pipeline",
    body: "This is exactly what I needed — I've been stuck on this for days! Quick question: does the Bedrock Knowledge Base support PDF documents with tables and charts? I have a bunch of financial reports I want to query.",
  },
  {
    postTitle: "How I built a RAG pipeline",
    body: "Tried this yesterday and it worked perfectly. One tip: enable 'Advanced Parsing' in the Knowledge Base settings — it handles PDFs, tables, and images much better than the default parser. Worth the extra cost.",
  },
  {
    postTitle: "Claude 3.5 Sonnet for agent building",
    body: "100% agree on tool use reliability. I switched from GPT-4o to Claude 3.5 Sonnet last month and my agent's tool call success rate went from ~83% to ~97%. The difference in how it handles ambiguous tool choices is remarkable.",
  },
  {
    postTitle: "Claude 3.5 Sonnet for agent building",
    body: "The point about cost is so real. I have a summarisation agent running 24/7 and optimising the context window cut my monthly bill by 40%. Profile early, profile often!",
  },
  {
    postTitle: "Prompt engineering in 2026",
    body: "Great list! I'd add one more: be explicit about what NOT to do, not just what to do. Negative constraints are massively underrated. 'Do not hedge your answer' alone improved my outputs significantly.",
  },
  {
    postTitle: "Top 5 free resources",
    body: "Adding to this: The AWS Well-Architected Framework for ML (free) is excellent once you're moving to production. Covers reliability, cost, and security for ML workloads in a way that most tutorials miss.",
  },
];

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { tenantSlug } = await req.json();
    const slug = tenantSlug || "saathi";

    const db = await getDb();
    const tenant = await db.tenant.findFirst({ where: { slug } });
    if (!tenant) return NextResponse.json({ error: "Tenant not found" }, { status: 404 });

    const adminMember = await db.member.findFirst({
      where: { tenantId: tenant.id, role: "admin" },
    });
    if (!adminMember) return NextResponse.json({ error: "No admin member found" }, { status: 404 });

    const existingPostCount = await db.post.count({ where: { tenantId: tenant.id } });
    if (existingPostCount > 5) {
      return NextResponse.json({ message: "Already seeded", postCount: existingPostCount });
    }

    // Create spaces
    const spaceMap: Record<string, string> = {};
    for (const s of SPACES) {
      const existing = await db.space.findFirst({ where: { tenantId: tenant.id, slug: s.slug } });
      if (existing) {
        spaceMap[s.slug] = existing.id;
      } else {
        const created = await db.space.create({
          data: { id: randomUUID(), tenantId: tenant.id, name: s.name, slug: s.slug, description: s.description },
        });
        spaceMap[s.slug] = created.id;
      }
    }

    // Create posts
    const postMap: Record<string, string> = {};
    for (const p of SEED_POSTS) {
      const spaceId = spaceMap[p.spaceSlug];
      if (!spaceId) continue;

      const post = await db.post.create({
        data: {
          id: randomUUID(),
          tenantId: tenant.id,
          spaceId,
          authorId: adminMember.id,
          title: p.title,
          body: p.body,
        },
      });

      await db.space.update({ where: { id: spaceId }, data: { postCount: { increment: 1 } } });
      postMap[p.title.slice(0, 30)] = post.id;
    }

    // Add upvotes to posts to make them look active
    const allPosts = await db.post.findMany({ where: { tenantId: tenant.id } });
    for (const post of allPosts) {
      const upvoteCount = Math.floor(Math.random() * 12) + 2;
      await db.post.update({ where: { id: post.id }, data: { upvotes: upvoteCount } });
    }

    // Create comments
    for (const c of SEED_COMMENTS) {
      const matchingPost = allPosts.find((p) => p.title.includes(c.postTitle.slice(0, 20)));
      if (!matchingPost) continue;

      await db.comment.create({
        data: {
          id: randomUUID(),
          tenantId: tenant.id,
          postId: matchingPost.id,
          authorId: adminMember.id,
          body: c.body,
        },
      });
    }

    const finalPostCount = await db.post.count({ where: { tenantId: tenant.id } });
    const finalCommentCount = await db.comment.count({ where: { tenantId: tenant.id } });

    return NextResponse.json({
      success: true,
      created: {
        spaces: SPACES.length,
        posts: finalPostCount,
        comments: finalCommentCount,
      },
    });
  } catch (err) {
    console.error("Seed error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
