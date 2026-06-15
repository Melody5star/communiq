import { auth } from "@/auth";
import { getDb } from "@/lib/db";
import { redirect } from "next/navigation";
import CreateSpaceButton from "./CreateSpaceButton";
import SearchBar from "./SearchBar";

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
    db.space.findMany({ where: { tenantId: tenant.id }, orderBy: { createdAt: "asc" } }),
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: tenant.primaryColor }}>
            {tenant.name[0].toUpperCase()}
          </div>
          <span className="font-semibold text-gray-900">{tenant.name}</span>
        </div>
        <div className="flex items-center gap-3">
          {session.user.role === "admin" && (
            <a href={`/t/${slug}/admin`} className="text-xs text-gray-500 hover:text-indigo-600">Admin</a>
          )}
          <span className="text-sm text-gray-500">{session.user.email}</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <SearchBar tenantId={tenant.id} tenantSlug={slug} />
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[{ n: memberCount, label: "Members" }, { n: postCount, label: "Posts" }, { n: spaces.length, label: "Spaces" }].map(({ n, label }) => (
            <div key={label} className="bg-white rounded-xl p-5 border border-gray-200">
              <p className="text-2xl font-bold text-gray-900">{n}</p>
              <p className="text-sm text-gray-500 mt-1">{label}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Spaces</h2>
            <CreateSpaceButton tenantId={tenant.id} tenantSlug={slug} />
          </div>
          {spaces.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400 text-sm">No spaces yet.</p>
              <p className="text-gray-400 text-xs mt-1">Create a space to start discussions.</p>
            </div>
          ) : (
            <ul className="space-y-2">
              {spaces.map((space) => (
                <li key={space.id}>
                  <a href={`/t/${slug}/s/${space.slug}`} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 group">
                    <span className="text-gray-400 group-hover:text-indigo-500">#</span>
                    <span className="text-sm font-medium text-gray-700 group-hover:text-indigo-600">{space.name}</span>
                    {space.description && <span className="text-xs text-gray-400 truncate">{space.description}</span>}
                    <span className="ml-auto text-xs text-gray-300">{space.postCount} posts</span>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}
