import Image from "next/image";
import Link from "next/link";
import { HiLockClosed } from "react-icons/hi2";
import { publicEnv } from "@/lib/env";
import { HeroSection } from "@/components/sections/HeroSection";
import { LeadersSection } from "@/components/sections/LeadersSection";
import { Footer } from "@/components/Footer";
import { woredaLeadership } from "@/data/leaders";

export const metadata = {
  title: `${publicEnv.NEXT_PUBLIC_WOREDA_NAME} • Official Portal`,
  description:
    "Government-grade portal for Woreda 9: leadership, documents, and QR-secured temporary access.",
};

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="flex justify-end p-4">
        <Link
          href="/admin/login"
          className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 hover:text-slate-900"
        >
          <HiLockClosed className="h-4 w-4" />
          Admin Login
        </Link>
      </div>
      <main className="flex flex-col gap-10 p-4 py-10">
        <HeroSection
          logoPath={publicEnv.NEXT_PUBLIC_WOREDA_LOGO_PATH}
          woredaName={publicEnv.NEXT_PUBLIC_WOREDA_NAME}
          title="Coordinated, Transparent, Accountable."
          subtitle="Woreda 9 Service Desk"
          description="We deliver dignified services, deliberate planning, and responsible communication across education, health, and planning portfolios."
        />


        <LeadersSection
          principal={woredaLeadership.principal}
          categories={woredaLeadership.categories}
        />

        <Footer woredaName={publicEnv.NEXT_PUBLIC_WOREDA_NAME} />
      </main>
    </div>
  );
}
