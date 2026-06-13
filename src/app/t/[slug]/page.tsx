import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";

export default async function TenantHome({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const session = await auth();

  if (!session) redirect("/login");

  const tenant = await prisma.tenant.findFirst({ where: { slug } });
  if (!tenant) redirect("/login");

  const memberCount = await prisma.member.count({ where: { tenantId: tenant.id } });
  const postCount = await prisma.post.count({ where: { tenantId: tenant.id } });
  const spaces = await prisma.space.findMany({ where: { tenantId: tenant.id }, take: 10 });

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: tenant.primaryColor }}>
            {tenant.name[0].toUpperCase()}
          </div>
          <span className="font-semibold text-gray-900">{tenant.name}</span>
        </div>
        <span className="text-sm text-gray-500">{session.user.email}</span>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl p-5 border border-gray-200">
            <p className="text-2xl font-bold text-gray-900">{memberCount}</p>
            <p className="text-sm text-gray-500 mt-1">Members</p>
          </div>
          <div className="bg-white rounded-xl p-5 border border-gray-200">
            <p className="text-2xl font-bold text-gray-900">{postCount}</p>
            <p className="text-sm text-gray-500 mt-1">Posts</p>
          </div>
          <div className="bg-white rounded-xl p-5 border border-gray-200">
            <p className="text-2xl font-bold text-gray-900">{spaces.length}</p>
            <p className="text-sm text-gray-500 mt-1">Spaces</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Spaces</h2>
          {spaces.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400 text-sm">No spaces yet.</p>
              <p className="text-gray-400 text-xs mt-1">Spaces are channels where your community discusses topics.</p>
            </div>
          ) : (
            <ul className="space-y-2">
              {spaces.map((space) => (
                <li key={space.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50">
                  <span className="text-gray-400">#</span>
                  <span className="text-sm font-medium text-gray-700">{space.name}</span>
                  {space.description && <span className="text-xs text-gray-400">{space.description}</span>}
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}
