import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/sections/HeroSection";
import { NewsSection } from "@/components/sections/NewsSection";
import { LeaderMessagesCarousel } from "@/components/sections/LeaderMessagesCarousel";
import { CommissionMembers } from "@/components/sections/CommissionMembers";
import { Footer } from "@/components/Footer";
import { getLeaders } from "@/lib/leader-actions";
import { publicEnv } from "@/lib/env";
import type { LeaderRecord } from "@/types";

export const dynamic = "force-dynamic";

export default async function Home() {
    let allLeaders: LeaderRecord[] = [];
    try {
        allLeaders = await getLeaders();
    } catch (error) {
        console.error("Error fetching leaders:", error);
        allLeaders = [];
    }

    // Find leaders with messages (speech content)
    const leadersWithMessages = allLeaders.filter(leader => {
        return leader.speech || leader.speech_am || leader.speech_or;
    });

    // Sort: commission-chair first if exists, then by sort_order
    const sortedLeadersWithMessages = leadersWithMessages.sort((a, b) => {
        if (a.category === 'commission-chair') return -1;
        if (b.category === 'commission-chair') return 1;
        return a.sort_order - b.sort_order;
    });

    // Group leaders by category, maintaining static order of categories we want
    const categoryOrder = [
        'commission-chair',
        'commission-deputy',
        'commission-secretary',
        'commission-committee-member',
        'commission-management'
    ];

    const categories = categoryOrder.map(id => ({
        id,
        leaders: allLeaders.filter(l => l.category === id)
    }));

    return (
        <div className="min-h-screen bg-white">
            {/* Navbar */}
            <Navbar />

            {/* Hero Section */}
            <HeroSection />

            {/* Leader Messages Section - Display any leader with a message (scrollable if multiple) */}
            {sortedLeadersWithMessages.length > 0 && (
                <LeaderMessagesCarousel leaders={sortedLeadersWithMessages} />
            )}

            {/* News Section (Server Component) - Placed right above Members list */}
            <NewsSection />

            {/* Commission Members Section */}
            <CommissionMembers categories={categories} />

            {/* Footer */}
            <Footer woredaName={publicEnv.NEXT_PUBLIC_WOREDA_NAME} />
        </div>
    );
}
