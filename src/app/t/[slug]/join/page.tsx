import { getDb } from "@/lib/db";
import { redirect } from "next/navigation";
import JoinForm from "./JoinForm";

export default async function JoinPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const db = await getDb();
  const tenant = await db.tenant.findFirst({ where: { slug } });
  if (!tenant) redirect("/");

  const [memberCount, postCount] = await Promise.all([
    db.member.count({ where: { tenantId: tenant.id } }),
    db.post.count({ where: { tenantId: tenant.id } }),
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <div className="text-center mb-6">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold text-3xl mx-auto mb-4 shadow-lg"
              style={{ backgroundColor: tenant.primaryColor }}
            >
              {tenant.name[0].toUpperCase()}
            </div>
            <h1 className="text-xl font-bold text-gray-900">{tenant.name}</h1>
            <p className="text-sm text-gray-500 mt-1">Join our community</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <p className="text-xl font-bold text-gray-900">{memberCount}</p>
              <p className="text-xs text-gray-500">Members</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <p className="text-xl font-bold text-gray-900">{postCount}</p>
              <p className="text-xs text-gray-500">Posts</p>
            </div>
          </div>

          <JoinForm tenantId={tenant.id} tenantSlug={slug} />
        </div>

        <p className="text-center text-xs text-gray-400 mt-4">
          Powered by AWS Aurora DSQL
        </p>
      </div>
    </div>
  );
}
