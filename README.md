# CommuniQ

**White-label community platform powered by AWS Aurora DSQL.**

> Built for the [AWS H0 Hackathon 2026](https://h0-hack-the-zero-stack-with-vercel-v0-and-aws-databases.devpost.com/) — Million-Scale Global App track.

**Live demo:** https://communiq-self.vercel.app

---

## What it does

CommuniQ lets any brand launch their own fully-branded community platform — think Circle.so or Mighty Networks, but running entirely on your AWS infrastructure.

Each brand gets their own isolated community at `/t/your-brand` with:
- **Spaces** — topic-based channels (General, Announcements, Introductions, etc.)
- **Threaded posts** — discussions, upvotes, comments, nested replies
- **Member management** — role-based access (admin / member), profiles, regions
- **Admin dashboard** — manage members, spaces, and content
- **Search** — full-text search across posts

Two live communities to explore:
- **Saathi** — https://communiq-self.vercel.app/t/saathi (AI & community platform)
- **Builders Club** — https://communiq-self.vercel.app/t/buildersclub (indie hackers & founders)

---

## Why Aurora DSQL

Every other community platform stores your data on their servers. CommuniQ runs entirely inside your AWS account.

| Feature | Circle.so / Mighty Networks | CommuniQ |
|---|---|---|
| Your data on AWS | ❌ | ✅ |
| IAM auth (no static passwords) | ❌ | ✅ |
| Active-active multi-region | ❌ | ✅ |
| Serverless scaling | ❌ | ✅ |
| Flat monthly fee | $300–$999/mo | Pay per use |

Aurora DSQL specifics:
- **Active-active multi-region**: primary `us-east-1`, peer `us-west-2`, witness `us-east-2`
- **IAM token auth**: `DsqlSigner` generates short-lived tokens — zero static DB passwords stored anywhere
- **Serverless**: scales from 0 to millions with no cluster management

---

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Auth | NextAuth v5 beta — magic-link + JWT |
| Database | AWS Aurora DSQL (PostgreSQL-compatible) |
| ORM | Prisma 7 with `@prisma/adapter-pg` Driver Adapter |
| Deployment | Vercel (primary) + AWS Amplify |
| Language | TypeScript |

---

## Architecture

```
Browser
  └── Vercel Edge (Next.js 16)
        ├── proxy.ts          ← Edge-safe route protection (NextAuth v5)
        ├── auth.ts           ← Node.js session resolution
        ├── App Router pages  ← /t/[slug], /t/[slug]/s/[space]/[post]
        └── API routes        ← /api/posts, /api/spaces, /api/members ...
              └── src/lib/db.ts
                    └── DsqlSigner → IAM token → pg Pool → PrismaPg → Aurora DSQL
```

### IAM token auth (no static passwords)

```typescript
// src/lib/db.ts
const signerConfig: DsqlSignerConfig = { hostname: DSQL_HOST, region: DSQL_REGION };
if (accessKeyId && secretAccessKey) {
  signerConfig.credentials = { accessKeyId, secretAccessKey };
}
const signer = new DsqlSigner(signerConfig);
const token = await signer.getDbConnectAdminAuthToken();
// token used as PostgreSQL password — auto-rotates, never stored
```

### Prisma 7 Driver Adapter pattern

```typescript
const pool = new Pool({ host: DSQL_HOST, password: token, ssl: { rejectUnauthorized: false } });
const adapter = new PrismaPg(pool);
return new PrismaClient({ adapter });
```

### Multi-tenant isolation

Every table has a `tenantId` foreign key. URL slug resolves to tenant — no cross-tenant data leakage possible.

```
/t/saathi       → Tenant { slug: "saathi" }
/t/buildersclub → Tenant { slug: "buildersclub" }
```

---

## Database schema

13 models: `Tenant`, `Member`, `Space`, `Post`, `Comment`, `Reaction`, `Follow`, `Tag`, `PostTag`, `ModQueue`, `Notification`, `ActivityLog`

See [`prisma/schema.prisma`](prisma/schema.prisma) and [`schema.sql`](schema.sql) for full definitions.

---

## Running locally

### Prerequisites
- Node.js 18+
- An AWS Aurora DSQL cluster endpoint
- AWS credentials with `dsql:DbConnectAdmin` permission

### Setup

```bash
git clone https://github.com/Melody5star/communiq
cd communiq
npm install
```

### Environment variables

Create a `.env` file:

```env
DSQL_HOST=your-cluster-id.dsql.us-east-1.on.aws
DSQL_REGION=us-east-1
COMMUNIQ_ACCESS_KEY_ID=your-aws-access-key
COMMUNIQ_SECRET_ACCESS_KEY=your-aws-secret-key
AUTH_SECRET=any-random-string-32-chars
```

### Generate Prisma client

```bash
npx prisma generate
```

### Run

```bash
npm run dev
```

Open http://localhost:3000

---

## Deploying to Vercel

1. Push to GitHub
2. Import project at vercel.com/new
3. Add the 5 environment variables in Vercel project settings
4. Deploy

> **Note:** Use `printf` (not `echo`) when setting env vars via Vercel CLI to avoid trailing newlines causing Aurora DSQL token generation failures.

---

## API routes

| Route | Method | Description |
|---|---|---|
| `/api/posts` | GET, POST | List / create posts |
| `/api/comments` | GET, POST | List / create comments |
| `/api/spaces` | GET, POST | List / create spaces |
| `/api/members` | GET, POST | List / join community |
| `/api/reactions` | POST | Upvote post or comment |
| `/api/search` | GET | Full-text search across posts |
| `/api/onboarding` | POST | Create new tenant + admin member |
| `/api/auth/[...nextauth]` | ALL | NextAuth v5 handlers |

---

## AWS IAM permissions required

```json
{
  "Effect": "Allow",
  "Action": ["dsql:DbConnectAdmin"],
  "Resource": "arn:aws:dsql:us-east-1:*:cluster/*"
}
```

---

## Hackathon

- **Track:** Million-Scale Global App
- **Live URL:** https://communiq-self.vercel.app
- **Database:** AWS Aurora DSQL — cluster `communiq-prod`, region `us-east-1`
- **Devpost:** https://devpost.com/software/communiq

---

## Author

**Anamika Bajpai** — anamikabajpai1991@gmail.com
