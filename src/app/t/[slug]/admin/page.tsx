import { auth } from "@/auth";
import { getDb } from "@/lib/db";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { timeAgo } from "@/lib/timeAgo";
import CopyButton from "./CopyButton";
import SignOutButton from "@/components/SignOutButton";

export default async function AdminPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const session = await auth();
  if (!session) redirect("/login");

  const db = await getDb();
  const tenant = await db.tenant.findFirst({ where: { slug } });
  if (!tenant) redirect("/login");

  const member = await db.member.findFirst({ where: { tenantId: tenant.id, email: session.user.email! } });
  if (!member || member.role !== "admin") redirect(`/t/${slug}`);

  const [members, postCount, spaceCount, recentPosts] = await Promise.all([
    db.member.findMany({ where: { tenantId: tenant.id }, orderBy: { joinedAt: "desc" } }),
    db.post.count({ where: { tenantId: tenant.id } }),
    db.space.count({ where: { tenantId: tenant.id } }),
    db.post.findMany({
      where: { tenantId: tenant.id },
      include: { author: true, space: true, _count: { select: { comments: true } } },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
  ]);

  const headersList = await headers();
  const host = headersList.get("host") ?? "localhost:3000";
  const proto = host.includes("localhost") ? "http" : "https";
  const joinLink = `${proto}://${host}/t/${slug}/join`;

  const AVATAR_COLORS = ["bg-indigo-100 text-indigo-700", "bg-purple-100 text-purple-700", "bg-teal-100 text-teal-700", "bg-orange-100 text-orange-700", "bg-pink-100 text-pink-700"];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href={`/t/${slug}`} className="flex items-center gap-2">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center text-white font-bold text-xs"
                style={{ backgroundColor: tenant.primaryColor }}
              >
                {tenant.name[0].toUpperCase()}
              </div>
              <span className="font-bold text-gray-900 hidden sm:inline">{tenant.name}</span>
            </a>
            <span className="text-xs font-semibold bg-indigo-600 text-white px-2.5 py-0.5 rounded-full">Admin</span>
          </div>
          <div className="flex items-center gap-3">
            <a href={`/t/${slug}`} className="text-sm text-gray-500 hover:text-gray-700 hidden sm:inline">← Community</a>
            <SignOutButton />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          {[
            { n: members.length, label: "Members", icon: "👥", color: "text-indigo-600" },
            { n: postCount, label: "Posts", icon: "📝", color: "text-purple-600" },
            { n: spaceCount, label: "Spaces", icon: "🗂️", color: "text-teal-600" },
          ].map(({ n, label, icon, color }) => (
            <div key={label} className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200 shadow-sm">
              <div className="flex items-start justify-between mb-2">
                <p className={`text-2xl sm:text-3xl font-bold ${color}`}>{n}</p>
                <span className="text-xl">{icon}</span>
              </div>
              <p className="text-xs sm:text-sm text-gray-500 font-medium">{label}</p>
            </div>
          ))}
        </div>

        {/* Invite link */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 rounded-2xl p-5">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 text-lg shrink-0">🔗</div>
            <div>
              <h2 className="font-semibold text-indigo-900">Invite Link</h2>
              <p className="text-xs text-indigo-600 mt-0.5">Share this link to let people join your community</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <code className="flex-1 bg-white border border-indigo-200 rounded-xl px-3 py-2.5 text-sm text-indigo-700 truncate font-mono">
              {joinLink}
            </code>
            <CopyButton text={joinLink} />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {/* Members */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span>👥</span> Members
            </h2>
            <div className="space-y-3">
              {members.map((m, i) => (
                <div key={m.id} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${AVATAR_COLORS[i % AVATAR_COLORS.length]}`}>
                    {m.displayName[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{m.displayName}</p>
                    <p className="text-xs text-gray-400 truncate">{m.email}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${m.role === "admin" ? "bg-indigo-100 text-indigo-700" : "bg-gray-100 text-gray-600"}`}>
                      {m.role}
                    </span>
                    <span className="text-xs text-gray-400">{m.region}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent posts */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span>📝</span> Recent Posts
            </h2>
            <div className="space-y-2">
              {recentPosts.map((p) => (
                <a
                  key={p.id}
                  href={`/t/${slug}/s/${p.space.slug}/${p.id}`}
                  className="block p-3 rounded-xl hover:bg-gray-50 transition-colors group"
                >
                  <p className="text-sm font-medium text-gray-900 truncate group-hover:text-indigo-700 transition-colors">{p.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-400">#{p.space.name}</span>
                    <span className="text-gray-200 text-xs">·</span>
                    <span className="text-xs text-gray-400">{timeAgo(p.createdAt)}</span>
                    <span className="ml-auto text-xs text-gray-400">💬 {p._count.comments}</span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Aurora DSQL badge */}
        <div className="flex items-center justify-center gap-2 py-2">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
          <span className="text-xs text-gray-400">Powered by AWS Aurora DSQL · Active-active multi-region · {member.region}</span>
        </div>
      </main>
    </div>
  );
}
