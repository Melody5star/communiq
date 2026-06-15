import { auth } from "@/auth";
import { getDb } from "@/lib/db";
import { redirect } from "next/navigation";

export default async function SpaceFeed({ params }: { params: Promise<{ slug: string; spaceSlug: string }> }) {
  const { slug, spaceSlug } = await params;
  const session = await auth();
  if (!session) redirect("/login");

  const db = await getDb();
  const tenant = await db.tenant.findFirst({ where: { slug } });
  if (!tenant) redirect("/login");

  const space = await db.space.findFirst({ where: { tenantId: tenant.id, slug: spaceSlug } });
  if (!space) redirect(`/t/${slug}`);

  const posts = await db.post.findMany({
    where: { spaceId: space.id },
    include: { author: true },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

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
          <span className="text-gray-300">/</span>
          <span className="text-gray-600 font-medium"># {space.name}</span>
        </div>
        <a href={`/t/${slug}/s/${spaceSlug}/new`} className="text-sm bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700">
          + New Post
        </a>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8">
        {space.description && (
          <p className="text-sm text-gray-500 mb-6">{space.description}</p>
        )}

        {posts.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-400">No posts yet.</p>
            <a href={`/t/${slug}/s/${spaceSlug}/new`} className="mt-3 inline-block text-indigo-600 text-sm hover:underline">
              Start the first discussion →
            </a>
          </div>
        ) : (
          <div className="space-y-3">
            {posts.map((post) => (
              <a key={post.id} href={`/t/${slug}/s/${spaceSlug}/${post.id}`} className="block bg-white rounded-xl border border-gray-200 p-5 hover:border-indigo-300 hover:shadow-sm transition-all">
                <h3 className="font-semibold text-gray-900 mb-1">{post.title}</h3>
                <p className="text-sm text-gray-500 line-clamp-2">{post.body}</p>
                <div className="flex items-center gap-3 mt-3">
                  <span className="text-xs text-gray-400">{post.author.displayName}</span>
                  <span className="text-xs text-gray-300">·</span>
                  <span className="text-xs text-gray-400">{new Date(post.createdAt).toLocaleDateString()}</span>
                </div>
              </a>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
