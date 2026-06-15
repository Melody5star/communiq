import { auth } from "@/auth";
import { getDb } from "@/lib/db";
import { redirect } from "next/navigation";
import { timeAgo } from "@/lib/timeAgo";
import CommentSection from "./CommentSection";
import UpvoteButton from "./UpvoteButton";
import SignOutButton from "@/components/SignOutButton";

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

  const [comments, myReaction] = await Promise.all([
    db.comment.findMany({
      where: { postId, parentId: null },
      include: { author: true },
      orderBy: { createdAt: "asc" },
    }),
    db.reaction.findFirst({
      where: { entityId: postId, memberId: session.user.memberId, reaction: "upvote" },
    }),
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-2 text-sm">
          <div className="flex items-center gap-2 min-w-0">
            <a href={`/t/${slug}`} className="flex items-center gap-2 shrink-0">
              <div
                className="w-6 h-6 rounded flex items-center justify-center text-white font-bold text-xs"
                style={{ backgroundColor: tenant.primaryColor }}
              >
                {tenant.name[0].toUpperCase()}
              </div>
              <span className="font-medium text-gray-700 hidden sm:inline">{tenant.name}</span>
            </a>
            <span className="text-gray-300">/</span>
            <a href={`/t/${slug}/s/${spaceSlug}`} className="text-gray-500 hover:text-indigo-600 font-medium">
              # {post.space.name}
            </a>
            <span className="text-gray-300 hidden sm:inline">/</span>
            <span className="text-gray-400 text-xs truncate hidden sm:inline max-w-[200px]">{post.title}</span>
          </div>
          <SignOutButton />
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-5">
        {/* Post card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 leading-tight">{post.title}</h1>
            <p className="text-gray-700 whitespace-pre-wrap text-sm sm:text-base leading-relaxed">{post.body}</p>
          </div>

          {/* Post meta bar */}
          <div className="flex items-center gap-3 px-6 py-3 bg-gray-50 border-t border-gray-100">
            <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xs font-bold shrink-0">
              {post.author.displayName[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-sm font-medium text-gray-700">{post.author.displayName}</span>
              <span className="text-gray-300 mx-2">·</span>
              <span className="text-xs text-gray-400">{timeAgo(post.createdAt)}</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <span>💬</span> {comments.length}
              </span>
              <UpvoteButton
                postId={post.id}
                initialCount={post.upvotes}
                initialVoted={!!myReaction}
              />
            </div>
          </div>
        </div>

        {/* Comments */}
        <CommentSection
          tenantId={tenant.id}
          postId={postId}
          comments={comments.map((c) => ({
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
