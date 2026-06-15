import { auth } from "@/auth";
import SignOutButton from "./SignOutButton";

interface Props {
  tenantName: string;
  tenantSlug: string;
  primaryColor: string;
  showAdmin?: boolean;
  breadcrumb?: { label: string; href: string };
  rightExtra?: React.ReactNode;
}

export default async function TenantHeader({
  tenantName,
  tenantSlug,
  primaryColor,
  showAdmin,
  breadcrumb,
  rightExtra,
}: Props) {
  const session = await auth();

  return (
    <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sticky top-0 z-10">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
        {/* Left: logo + breadcrumb */}
        <div className="flex items-center gap-2 min-w-0">
          <a href={`/t/${tenantSlug}`} className="flex items-center gap-2 shrink-0">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center text-white font-bold text-xs"
              style={{ backgroundColor: primaryColor }}
            >
              {tenantName[0].toUpperCase()}
            </div>
            <span className="font-bold text-gray-900 hidden sm:inline">{tenantName}</span>
          </a>
          {breadcrumb && (
            <>
              <span className="text-gray-300">/</span>
              <a href={breadcrumb.href} className="font-semibold text-gray-600 hover:text-indigo-600 transition-colors text-sm truncate">
                {breadcrumb.label}
              </a>
            </>
          )}
        </div>

        {/* Right: admin link, email, sign out */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {rightExtra}
          {showAdmin && (session?.user?.role === "admin") && (
            <a
              href={`/t/${tenantSlug}/admin`}
              className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full hover:bg-indigo-100 transition-colors"
            >
              Admin ›
            </a>
          )}
          <span className="text-xs text-gray-400 hidden sm:inline max-w-[150px] truncate">{session?.user?.email}</span>
          <SignOutButton />
        </div>
      </div>
    </header>
  );
}
