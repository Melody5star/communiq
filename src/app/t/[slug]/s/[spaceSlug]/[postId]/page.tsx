import { auth } from "@/auth";
import { getDb } from "@/lib/db";
import { redirect } from "next/navigation";
import CommentSection from "./CommentSection";

export default async function PostDetail({
  params,
}: {
  params: Promise<{ slug: string; spaceSlug: string; postId: string }>;
}) {
  const { slug, spaceSlug, postId } = await params;
  const session = await auth();
  if (!session) redirect("/login");

  const db = await getDb();
  const tenant = await db.tenant.findFirst({ where: { slug } });
  if (!tenant) redirect("/login");

  const post = await db.post.findFirst({
    where: { id: postId, tenantId: tenant.id },
    include: { author: true, space: true },
  });
  if (!post) redirect(`/t/${slug}/s/${spaceSlug}`);

  const comments = await db.comment.findMany({
    where: { postId, parentId: null },
    include: { author: true },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-2 text-sm">
          <a href={`/t/${slug}`} className="flex items-center gap-2">
            <div className="w-6 h-6 rounded flex items-center justify-center text-white font-bold text-xs" style={{ backgroundColor: tenant.primaryColor }}>
              {tenant.name[0].toUpperCase()}
            </div>
            <span className="font-medium text-gray-700">{tenant.name}</span>
          </a>
          <span className="text-gray-300">/</span>
          <a href={`/t/${slug}/s/${spaceSlug}`} className="text-gray-500 hover:text-gray-700"># {post.space.name}</a>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8 space-y-6">
        {/* Post */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h1 className="text-xl font-bold text-gray-900 mb-4">{post.title}</h1>
          <p className="text-gray-700 whitespace-pre-wrap text-sm leading-relaxed">{post.body}</p>
          <div className="flex items-center gap-3 mt-5 pt-4 border-t border-gray-100">
            <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xs font-bold">
              {post.author.displayName[0].toUpperCase()}
            </div>
            <span className="text-sm text-gray-600">{post.author.displayName}</span>
            <span className="text-gray-300">·</span>
            <span className="text-xs text-gray-400">{new Date(post.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</span>
            <span className="ml-auto text-xs text-gray-400">{comments.length} {comments.length === 1 ? "reply" : "replies"}</span>
          </div>
        </div>

        {/* Comments */}
        <CommentSection
          tenantId={tenant.id}
          postId={postId}
          comments={comments.map(c => ({
            id: c.id,
            body: c.body,
            authorName: c.author.displayName,
            createdAt: c.createdAt.toISOString(),
          }))}
        />
      </main>
    </div>
  );
}
