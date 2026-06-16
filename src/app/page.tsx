import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function Home() {
  const session = await auth();

  if (session?.user?.tenantSlug) redirect(`/t/${session.user.tenantSlug}`);
  if (session?.user) redirect("/onboarding");

  return (
    <main className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">C</div>
          <span className="font-bold text-gray-900 text-lg">Communiq</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Sign in</Link>
          <Link href="/onboarding" className="text-sm bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors">
            Get started free
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-24 text-center">
        <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-xs font-medium px-3 py-1.5 rounded-full mb-8">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse inline-block"></span>
          Powered by AWS Aurora DSQL — active-active multi-region
        </div>

        <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 leading-tight mb-6 tracking-tight">
          A community platform<br />
          <span className="text-indigo-600">built for your brand</span>
        </h1>

        <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
          Give your audience a private, branded space to connect — without the chaos of Discord or the price tag of Circle.
          Built on Aurora DSQL: serverless, zero maintenance, never goes down.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/onboarding"
            className="w-full sm:w-auto bg-indigo-600 text-white px-8 py-3.5 rounded-xl font-semibold text-base hover:bg-indigo-700 transition-colors shadow-sm"
          >
            Create your community →
          </Link>
          <Link
            href="/t/saathi"
            className="w-full sm:w-auto bg-white text-gray-700 border border-gray-200 px-8 py-3.5 rounded-xl font-semibold text-base hover:bg-gray-50 transition-colors"
          >
            See a live demo
          </Link>
        </div>

        <p className="text-sm text-gray-400 mt-5">Free to start · No credit card · Live in 2 minutes</p>
      </section>

      {/* Demo communities */}
      <section className="bg-gray-50 border-y border-gray-100 py-16">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-center text-sm font-medium text-gray-400 uppercase tracking-widest mb-10">Live demo communities on Communiq</p>
          <div className="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <Link href="/t/saathi" className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-md transition-shadow group">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold">S</div>
                <div>
                  <div className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">Saathi</div>
                  <div className="text-xs text-gray-400">AI &amp; community platform</div>
                </div>
              </div>
              <p className="text-sm text-gray-500">Spaces for announcements, introductions, AI discussion, and resources. View a real running community.</p>
              <div className="mt-4 text-xs text-indigo-500 font-medium">Visit /t/saathi →</div>
            </Link>

            <Link href="/t/buildersclub" className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-md transition-shadow group">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white font-bold">B</div>
                <div>
                  <div className="font-semibold text-gray-900 group-hover:text-emerald-600 transition-colors">Builders Club</div>
                  <div className="text-xs text-gray-400">Indie hackers &amp; founders</div>
                </div>
              </div>
              <p className="text-sm text-gray-500">A space for indie hackers to showcase projects, ask for help, and build in public. Different brand, same platform.</p>
              <div className="mt-4 text-xs text-emerald-500 font-medium">Visit /t/buildersclub →</div>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">Everything your community needs</h2>
        <p className="text-gray-500 text-center mb-16 max-w-xl mx-auto">Built on AWS Aurora DSQL — the first serverless distributed SQL database with active-active multi-region replication.</p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              icon: "🏷️",
              title: "White-label branding",
              desc: "Your logo, your colors, your domain. Every community gets its own identity at /t/your-brand.",
            },
            {
              icon: "🌍",
              title: "Multi-region resilience",
              desc: "Aurora DSQL replicates your data across AWS regions. No downtime even during regional outages.",
            },
            {
              icon: "⚡",
              title: "Serverless, zero infra",
              desc: "No database servers to manage. DSQL scales automatically. Pay only for what you use.",
            },
            {
              icon: "💬",
              title: "Spaces & threaded posts",
              desc: "Organize discussions into spaces. Members post, comment, and upvote in a clean feed.",
            },
            {
              icon: "🔗",
              title: "Invite links",
              desc: "Share a public invite link. Members join in one click — no admin approval needed.",
            },
            {
              icon: "🛡️",
              title: "Secure by default",
              desc: "Auth via NextAuth. Database credentials use AWS IAM tokens — never a plain password.",
            },
          ].map((f) => (
            <div key={f.title} className="p-6 rounded-2xl border border-gray-100 hover:border-indigo-100 hover:bg-indigo-50/30 transition-colors">
              <div className="text-3xl mb-4">{f.icon}</div>
              <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA banner */}
      <section className="bg-indigo-600 py-20">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to launch your community?</h2>
          <p className="text-indigo-200 mb-8 text-lg">Set up in 2 minutes. No credit card. No infrastructure to manage.</p>
          <Link
            href="/onboarding"
            className="inline-block bg-white text-indigo-600 px-10 py-3.5 rounded-xl font-semibold text-base hover:bg-indigo-50 transition-colors shadow-sm"
          >
            Create your community →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-indigo-600 flex items-center justify-center text-white font-bold text-xs">C</div>
            <span className="text-sm font-medium text-gray-700">Communiq</span>
          </div>
          <p className="text-xs text-gray-400">Built on AWS Aurora DSQL · Active-active multi-region · AWS H0 Hackathon 2026</p>
          <Link href="/login" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">Sign in</Link>
        </div>
      </footer>
    </main>
  );
}
