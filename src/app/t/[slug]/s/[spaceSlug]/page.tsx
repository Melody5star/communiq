import { auth } from "@/auth";
import { getDb } from "@/lib/db";
import { redirect } from "next/navigation";
import { timeAgo } from "@/lib/timeAgo";
import SignOutButton from "@/components/SignOutButton";

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
    include: {
      author: true,
      _count: { select: { comments: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <a href={`/t/${slug}`} className="flex items-center gap-2 shrink-0">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center text-white font-bold text-xs shrink-0"
                style={{ backgroundColor: tenant.primaryColor }}
              >
                {tenant.name[0].toUpperCase()}
              </div>
              <span className="font-semibold text-gray-900 hidden sm:inline">{tenant.name}</span>
            </a>
            <span className="text-gray-300">/</span>
            <span className="font-semibold text-gray-700"># {space.name}</span>
            {space.description && (
              <span className="text-xs text-gray-400 hidden md:inline truncate">{space.description}</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <SignOutButton />
            <a
              href={`/t/${slug}/s/${spaceSlug}/new`}
              className="shrink-0 text-sm bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
              + Post
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
        {posts.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-2xl mx-auto mb-4">💬</div>
            <p className="font-medium text-gray-700 mb-1">No posts yet in #{space.name}</p>
            <p className="text-gray-400 text-sm mb-4">Be the first to start a discussion.</p>
            <a
              href={`/t/${slug}/s/${spaceSlug}/new`}
              className="inline-block bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
            >
              Write the first post →
            </a>
          </div>
        ) : (
          <div className="space-y-3">
            {posts.map((post) => (
              <a
                key={post.id}
                href={`/t/${slug}/s/${spaceSlug}/${post.id}`}
                className="block bg-white rounded-xl border border-gray-200 p-5 hover:border-indigo-300 hover:shadow-md transition-all group"
              >
                <h3 className="font-semibold text-gray-900 mb-1.5 group-hover:text-indigo-700 transition-colors leading-snug">
                  {post.title}
                </h3>
                <p className="text-sm text-gray-500 line-clamp-2 mb-3 leading-relaxed">{post.body}</p>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xs font-bold shrink-0">
                    {post.author.displayName[0].toUpperCase()}
                  </div>
                  <span className="text-xs text-gray-500 font-medium">{post.author.displayName}</span>
                  <span className="text-gray-300 text-xs">·</span>
                  <span className="text-xs text-gray-400">{timeAgo(post.createdAt)}</span>
                  <div className="ml-auto flex items-center gap-3 text-xs text-gray-400">
                    <span className="flex items-center gap-1">▲ {post.upvotes}</span>
                    <span className="flex items-center gap-1">💬 {post._count.comments}</span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
