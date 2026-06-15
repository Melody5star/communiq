import { auth } from "@/auth";
import { getDb } from "@/lib/db";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import CopyButton from "./CopyButton";

export default async function AdminPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const session = await auth();
  if (!session) redirect("/login");

  const db = await getDb();
  const tenant = await db.tenant.findFirst({ where: { slug } });
  if (!tenant) redirect("/login");

  const member = await db.member.findFirst({ where: { tenantId: tenant.id, email: session.user.email! } });
  if (!member || member.role !== "admin") redirect(`/t/${slug}`);

  const [members, posts, spaces, recentPosts] = await Promise.all([
    db.member.findMany({ where: { tenantId: tenant.id }, orderBy: { joinedAt: "desc" } }),
    db.post.count({ where: { tenantId: tenant.id } }),
    db.space.count({ where: { tenantId: tenant.id } }),
    db.post.findMany({ where: { tenantId: tenant.id }, include: { author: true, space: true }, orderBy: { createdAt: "desc" }, take: 5 }),
  ]);

  const headersList = await headers();
  const host = headersList.get("host") ?? "localhost:3000";
  const proto = host.includes("localhost") ? "http" : "https";
  const joinLink = `${proto}://${host}/t/${slug}/join`;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <a href={`/t/${slug}`} className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: tenant.primaryColor }}>
              {tenant.name[0].toUpperCase()}
            </div>
            <span className="font-semibold text-gray-900">{tenant.name}</span>
          </a>
          <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-medium">Admin</span>
        </div>
        <a href={`/t/${slug}`} className="text-sm text-gray-500 hover:text-gray-700">← Back to community</a>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8 space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[{ n: members.length, label: "Total Members" }, { n: posts, label: "Total Posts" }, { n: spaces, label: "Spaces" }].map(({ n, label }) => (
            <div key={label} className="bg-white rounded-xl p-5 border border-gray-200">
              <p className="text-3xl font-bold text-indigo-600">{n}</p>
              <p className="text-sm text-gray-500 mt-1">{label}</p>
            </div>
          ))}
        </div>

        {/* Invite link */}
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-5">
          <h2 className="font-semibold text-indigo-900 mb-2">Invite Link</h2>
          <p className="text-xs text-indigo-600 mb-3">Share this link to let people join your community</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 bg-white border border-indigo-200 rounded-lg px-3 py-2 text-sm text-indigo-700 truncate">{joinLink}</code>
            <CopyButton text={joinLink} />
          </div>
        </div>

        {/* Members */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Members</h2>
          <div className="space-y-3">
            {members.map(m => (
              <div key={m.id} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-sm font-bold">
                  {m.displayName[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{m.displayName}</p>
                  <p className="text-xs text-gray-400">{m.email}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${m.role === "admin" ? "bg-indigo-100 text-indigo-700" : "bg-gray-100 text-gray-600"}`}>
                  {m.role}
                </span>
                <span className="text-xs text-gray-400">{m.region}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent posts */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Recent Posts</h2>
          <div className="space-y-3">
            {recentPosts.map(p => (
              <div key={p.id} className="flex items-start gap-3 py-2 border-b border-gray-100 last:border-0">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{p.title}</p>
                  <p className="text-xs text-gray-400">{p.author.displayName} · #{p.space.name} · {new Date(p.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
