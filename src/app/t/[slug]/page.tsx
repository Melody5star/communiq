import { auth } from "@/auth";
import { getDb } from "@/lib/db";
import { redirect } from "next/navigation";
import CreateSpaceButton from "./CreateSpaceButton";
import SearchBar from "./SearchBar";
import SignOutButton from "@/components/SignOutButton";

export default async function TenantHome({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const session = await auth();
  if (!session) redirect("/login");

  const db = await getDb();
  const tenant = await db.tenant.findFirst({ where: { slug } });
  if (!tenant) redirect("/login");

  const [memberCount, postCount, spaces] = await Promise.all([
    db.member.count({ where: { tenantId: tenant.id } }),
    db.post.count({ where: { tenantId: tenant.id } }),
    db.space.findMany({
      where: { tenantId: tenant.id },
      include: { _count: { select: { posts: true } } },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  const joinLink = `/t/${slug}/join`;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm shrink-0"
              style={{ backgroundColor: tenant.primaryColor }}
            >
              {tenant.name[0].toUpperCase()}
            </div>
            <span className="font-bold text-gray-900">{tenant.name}</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            {session.user.role === "admin" && (
              <a href={`/t/${slug}/admin`} className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full hover:bg-indigo-100 transition-colors">
                Admin ›
              </a>
            )}
            <span className="text-xs text-gray-400 hidden sm:inline max-w-[150px] truncate">{session.user.email}</span>
            <SignOutButton />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Search */}
        <SearchBar tenantId={tenant.id} tenantSlug={slug} />

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          {[
            { n: memberCount, label: "Members", icon: "👥" },
            { n: postCount, label: "Posts", icon: "📝" },
            { n: spaces.length, label: "Spaces", icon: "🗂️" },
          ].map(({ n, label, icon }) => (
            <div key={label} className="bg-white rounded-xl p-4 sm:p-5 border border-gray-200 shadow-sm">
              <div className="flex items-start justify-between mb-1">
                <p className="text-2xl sm:text-3xl font-bold text-gray-900">{n}</p>
                <span className="text-lg">{icon}</span>
              </div>
              <p className="text-xs sm:text-sm text-gray-500 font-medium">{label}</p>
            </div>
          ))}
        </div>

        {/* Spaces */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Spaces</h2>
            <CreateSpaceButton tenantId={tenant.id} tenantSlug={slug} />
          </div>

          {spaces.length === 0 ? (
            <div className="text-center py-12 px-6">
              <div className="text-3xl mb-3">🗂️</div>
              <p className="text-gray-500 text-sm font-medium mb-1">No spaces yet</p>
              <p className="text-gray-400 text-xs">Create a space to organise discussions by topic.</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {spaces.map((space) => (
                <li key={space.id}>
                  <a
                    href={`/t/${slug}/s/${space.slug}`}
                    className="flex items-center gap-3 px-5 py-3.5 hover:bg-indigo-50/50 group transition-colors"
                  >
                    <span className="text-gray-300 group-hover:text-indigo-400 font-medium text-base transition-colors">#</span>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-semibold text-gray-700 group-hover:text-indigo-700 transition-colors">
                        {space.name}
                      </span>
                      {space.description && (
                        <span className="text-xs text-gray-400 ml-2 hidden sm:inline truncate">{space.description}</span>
                      )}
                    </div>
                    <span className="text-xs text-gray-400 shrink-0 bg-gray-100 px-2 py-0.5 rounded-full group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                      {space._count.posts} {space._count.posts === 1 ? "post" : "posts"}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Invite section */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="flex-1">
            <p className="font-semibold text-indigo-900 text-sm">Invite people to {tenant.name}</p>
            <p className="text-xs text-indigo-600 mt-0.5">Share the join link to grow your community</p>
          </div>
          <a
            href={joinLink}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 bg-indigo-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
          >
            View Join Page →
          </a>
        </div>
      </main>
    </div>
  );
}
