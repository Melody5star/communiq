import { getDb } from "@/lib/db";
import { redirect } from "next/navigation";
import JoinForm from "./JoinForm";

export default async function JoinPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const db = await getDb();
  const tenant = await db.tenant.findFirst({ where: { slug } });
  if (!tenant) redirect("/");

  const memberCount = await db.member.count({ where: { tenantId: tenant.id } });

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg p-8">
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4" style={{ backgroundColor: tenant.primaryColor }}>
            {tenant.name[0].toUpperCase()}
          </div>
          <h1 className="text-xl font-bold text-gray-900">{tenant.name}</h1>
          <p className="text-sm text-gray-500 mt-1">{memberCount} member{memberCount !== 1 ? "s" : ""}</p>
        </div>
        <JoinForm tenantId={tenant.id} tenantSlug={slug} />
      </div>
    </div>
  );
}
