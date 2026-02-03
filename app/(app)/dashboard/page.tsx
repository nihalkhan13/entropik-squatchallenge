"use client"

import { useUser } from "@/context/UserContext"
import { CheckInButton } from "@/components/features/CheckInButton"
import { CalendarGrid } from "@/components/features/CalendarGrid"
import { GroupProgress } from "@/components/features/GroupProgress"
import { Leaderboard } from "@/components/features/Leaderboard"
import { motion } from "framer-motion"

export default function DashboardPage() {
    const { user } = useUser()

    return (
        <div className="space-y-8">
            {/* Intro / Welcome */}
            <div className="space-y-1">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-brand-gray bg-clip-text text-transparent">
                    Day {(() => {
                        const start = new Date('2026-01-30T00:00:00-08:00'); // PST midnight
                        const now = new Date();
                        const diffMs = now.getTime() - start.getTime();
                        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
                        return diffDays + 1;
                    })()}
                </h1>
                <p className="text-brand-gray text-sm font-medium">
                    30 Days of Discipline. Stay Hard.
                </p>
            </div>

            {/* Group Stats */}
            <GroupProgress />

            {/* Main Action */}
            <div className="py-4">
                <CheckInButton />
            </div>

            {/* Calendar */}
            <section className="bg-brand-glass rounded-2xl p-4 border border-brand-glass-border">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-white font-bold text-lg">
                        Squad Grid
                    </h2>
                    <div className="flex gap-2 text-[10px] text-brand-gray bg-black/20 px-2 py-1 rounded-full">
                        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-brand-teal" /> DONE</span>
                        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-brand-error" /> MISSED</span>
                    </div>
                </div>
                <CalendarGrid />
            </section>

            {/* Local Leaderboard */}
            <section>
                <Leaderboard />
            </section>

            {/* Footer Quote */}
            <div className="text-center pt-8 pb-4 text-brand-gray/30 text-xs uppercase tracking-widest font-semibold">
                Pain is Temporary. Glory is Forever.
            </div>
        </div>
    )
}
