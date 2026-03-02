"use client"

import { useEffect, useState } from "react"
import { supabase, isMock } from "@/lib/supabase"
import { motion } from "framer-motion"
import { storage } from "@/lib/storage"
import { getTodayPST } from "@/lib/date"

export function GroupProgress({ challengeType = 'squat' }: { challengeType?: 'squat' | 'plank' }) {
    const [percentage, setPercentage] = useState(0)
    const [loading, setLoading] = useState(true)

    const today = getTodayPST()

    useEffect(() => {
        async function fetchProgress() {
            if (isMock) {
                const users = storage.getUsers()
                const checkins = storage.getCheckins()
                const userCount = users.length

                const checkinCount = checkins.filter((c: any) => c.date === today).length

                if (userCount > 0) {
                    // Ensure it's not 0 for vibes
                    const count = checkinCount > 0 ? checkinCount : 1
                    setPercentage(Math.round((count / userCount) * 100))
                }
                setLoading(false)
                return
            }

            // Get total users (we might want to only count users who have participated in this challenge type ideally, but for MVP counting all users or users with at least one check-in might be better. Left as total users for now, or maybe only users with allowed_legacy_squat for squat)
            // Let's get total users that are relevant for this challenge.
            let userCountQuery = supabase.from("users").select("*", { count: 'exact', head: true })
            if (challengeType === 'squat') {
                userCountQuery = userCountQuery.eq("allowed_legacy_squat", true)
            }
            const { count: userCount } = await userCountQuery

            // Get today's checkins
            const { count: checkinCount } = await supabase
                .from("checkins")
                .select("*", { count: 'exact', head: true })
                .eq("date", today)
                .eq("challenge_type", challengeType)

            if (userCount && userCount > 0) {
                setPercentage(Math.round(((checkinCount || 0) / userCount) * 100))
            }
            setLoading(false)
        }
        fetchProgress()

        // Subscribe to realtime updates
        const subscription = supabase
            .channel('group-progress')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'checkins' }, () => {
                fetchProgress()
            })
            .subscribe()

        return () => {
            supabase.removeChannel(subscription)
        }
    }, [])

    const radius = 30
    const circumference = 2 * Math.PI * radius
    const strokeDashoffset = circumference - (percentage / 100) * circumference

    return (
        <div className="flex items-center gap-4 bg-brand-glass border border-brand-glass-border rounded-2xl p-4 mb-6 relative overflow-hidden">
            {/* Glow background */}
            <div className="absolute right-0 top-0 w-32 h-32 bg-brand-teal/5  blur-2xl rounded-full translate-x-10 -translate-y-10 pointer-events-none" />

            <div className="relative w-16 h-16 flex-shrink-0">
                {/* Background Circle */}
                <svg className="w-full h-full transform -rotate-90">
                    <circle
                        cx="32"
                        cy="32"
                        r={radius}
                        className="stroke-brand-gray/20"
                        strokeWidth="6"
                        fill="none"
                    />
                    <motion.circle
                        cx="32"
                        cy="32"
                        r={radius}
                        className="stroke-brand-teal drop-shadow-[0_0_4px_theme(colors.brand.teal)]"
                        strokeWidth="6"
                        fill="none"
                        strokeDasharray={circumference}
                        animate={{ strokeDashoffset }}
                        transition={{ duration: 1.5, ease: "easeInOut" }}
                        strokeLinecap="round"
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">
                    {loading ? "..." : `${percentage}%`}
                </div>
            </div>

            <div>
                <p className="text-white font-bold text-lg leading-tight">
                    Group Velocity
                </p>
                <p className="text-brand-gray text-sm">
                    {loading ? "Calculating..." : `${percentage}% of athletes active today`}
                </p>
            </div>
        </div>
    )
}
