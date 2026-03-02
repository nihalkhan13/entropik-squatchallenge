"use client"

import { useUser } from "@/context/UserContext"
import { CheckInButton } from "@/components/features/CheckInButton"
import { CalendarGrid } from "@/components/features/CalendarGrid"
import { GroupProgress } from "@/components/features/GroupProgress"
import { Leaderboard } from "@/components/features/Leaderboard"
import { ActivityFeed } from "@/components/features/ActivityFeed"
import { PerformanceReport } from "@/components/reports/PerformanceReport"
import { calculatePerformanceStats } from "@/lib/stats"
import { motion, AnimatePresence } from "framer-motion"
import { Settings, BarChart3 } from "lucide-react"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import Link from "next/link"
import { getCurrentDay, CHALLENGE_START_DATE, getTodayPST } from "@/lib/date"
import { CountdownTimer } from "@/components/features/CountdownTimer"
import { ChallengeInstructions } from "@/components/features/ChallengeInstructions"
import { PreLaunchActions } from "@/components/features/PreLaunchActions"

export default function DashboardPage() {
    const { user } = useUser()
    const [stats, setStats] = useState<ReturnType<typeof calculatePerformanceStats> | null>(null)
    const [showReport, setShowReport] = useState(false)
    const [challengeStartDate, setChallengeStartDate] = useState<string | null>(null)
    const [isPreLaunch, setIsPreLaunch] = useState<boolean>(false)

    const currentDay = getCurrentDay()

    const fetchSettings = async () => {
        const { data: settings } = await supabase.from("challenge_settings").select("*").eq("key", "start_date").maybeSingle()
        if (settings) {
            setChallengeStartDate(settings.value)
            setIsPreLaunch(getTodayPST() < settings.value)
        }
    }

    const fetchStats = async () => {
        if (!user) return
        const { data: checkins } = await supabase
            .from('checkins')
            .select('date')
            .eq('user_id', user.id)
            .eq('challenge_type', 'plank')

        if (checkins) {
            const calculated = calculatePerformanceStats(
                user.username,
                checkins,
                CHALLENGE_START_DATE,
                currentDay
            )
            setStats(calculated)
        }
    }

    useEffect(() => {
        if (user) {
            fetchSettings()
            fetchStats()
        }
    }, [user])

    if (isPreLaunch && challengeStartDate) {
        return (
            <div className="space-y-8 relative min-h-[60vh] flex flex-col justify-center">
                <div className="text-center space-y-2 mb-8">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-brand-gray bg-clip-text text-transparent uppercase tracking-wider">
                        Mission Pending
                    </h1>
                    <p className="text-brand-gray font-medium tracking-wide">
                        Starts: March 13th 2026
                    </p>
                    <p className="text-brand-gray/60 text-sm">
                        The challenge has not started yet. Hold the line.
                    </p>
                </div>

                <ChallengeInstructions />
                <PreLaunchActions />
                <CountdownTimer targetDate={challengeStartDate} />
            </div>
        )
    }

    return (
        <div className="space-y-8 relative">
            {/* Intro / Welcome */}
            <div className="flex justify-between items-start">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-brand-gray bg-clip-text text-transparent">
                        Day {currentDay}
                    </h1>
                    <p className="text-brand-gray text-sm font-medium">
                        30 Day 2-Minute Plank Challenge.
                    </p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setShowReport(!showReport)}
                        className="p-2 bg-brand-glass rounded-xl border border-brand-glass-border/30 text-brand-gray/60 hover:text-brand-teal transition-colors"
                    >
                        <BarChart3 className="w-5 h-5" />
                    </button>
                    <Link href="/settings" className="p-2 bg-brand-glass rounded-xl border border-brand-glass-border/30 text-brand-gray/60 hover:text-brand-teal transition-colors">
                        <Settings className="w-5 h-5" />
                    </Link>
                </div>
            </div>

            {/* Mission Instructions */}
            <ChallengeInstructions />

            {/* Performance Report Overlay/Section */}
            <AnimatePresence>
                {showReport && stats && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <PerformanceReport stats={stats} />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Group Stats */}
            <GroupProgress challengeType="plank" />

            {/* Main Action */}
            <div>
                <CheckInButton challengeType="plank" />
            </div>

            {/* Activity Feed */}
            <ActivityFeed challengeType="plank" />

            {/* Calendar */}
            <section className="bg-brand-glass rounded-2xl p-4 border border-brand-glass-border">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-white font-bold text-lg">
                        Plank Grid
                    </h2>
                    <div className="flex gap-2 text-[10px] text-brand-gray bg-black/20 px-2 py-1 rounded-full">
                        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-brand-teal" /> DONE</span>
                        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-brand-error" /> MISSED</span>
                    </div>
                </div>
                <CalendarGrid challengeType="plank" />
            </section>

            {/* Local Leaderboard */}
            <section>
                <Leaderboard challengeType="plank" />
            </section>

            {/* Footer Quote */}
            <div className="text-center pt-8 pb-4 text-brand-gray/30 text-xs uppercase tracking-widest font-semibold">
                Pain is Temporary. Glory is Forever.
            </div>
        </div>
    )
}
