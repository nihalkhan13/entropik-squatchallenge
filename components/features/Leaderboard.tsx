"use client"

import { useEffect, useState } from "react"
import { supabase, isMock } from "@/lib/supabase"
import { Flame } from "lucide-react"
import { storage } from "@/lib/storage"

type LeaderboardEntry = {
    username: string
    streak: number
    total: number
}

export function Leaderboard({ challengeType = 'squat' }: { challengeType?: 'squat' | 'plank' }) {
    const [entries, setEntries] = useState<LeaderboardEntry[]>([])

    useEffect(() => {
        async function fetchLeaderboard() {
            let users: any[] | null = []
            let checkins: any[] | null = []

            if (isMock) {
                users = storage.getUsers()
                checkins = storage.getCheckins()
            } else {
                let uQuery = supabase.from("users").select("id, username")
                if (challengeType === 'squat') {
                    uQuery = uQuery.eq("allowed_legacy_squat", true)
                }
                const { data: u } = await uQuery
                const { data: c } = await supabase.from("checkins").select("user_id, date").eq("challenge_type", challengeType)
                users = u
                checkins = c
            }

            if (!users || !checkins) return

            const result = users.map(u => {
                const userCheckins = checkins!.filter((c: any) => c.user_id === u.id).map((c: any) => c.date).sort()
                const total = userCheckins.length

                // Calculate current streak
                let streak = 0
                const today = new Date().toISOString().split("T")[0]
                const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0]

                const hasToday = userCheckins.includes(today)
                const hasYesterday = userCheckins.includes(yesterday)

                let currentTestDate = hasToday ? today : (hasYesterday ? yesterday : null)

                if (currentTestDate) {
                    streak = 1; // At least one
                    // Iterate backwards
                    while (true) {
                        const d: Date = new Date(currentTestDate!)
                        d.setDate(d.getDate() - 1)
                        const prevDate: string = d.toISOString().split("T")[0]
                        if (userCheckins.includes(prevDate)) {
                            streak++
                            currentTestDate = prevDate
                        } else {
                            break
                        }
                    }
                }

                return { username: u.username, streak, total }
            })

            // Sort by Streak then Total
            result.sort((a, b) => b.streak - a.streak || b.total - a.total)
            setEntries(result)
        }

        fetchLeaderboard()
    }, [])

    return (
        <div className="space-y-3">
            <h3 className="text-brand-gray text-xs font-bold uppercase tracking-widest mb-4">
                Leaderboard
            </h3>

            {entries.map((entry, i) => (
                <div key={entry.username} className="flex items-center justify-between bg-white/5 rounded-xl p-3 border border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="text-brand-gray font-mono text-sm w-4">{i + 1}</div>
                        <div className="text-white font-medium">{entry.username}</div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1 text-brand-teal">
                            <Flame className="w-4 h-4 fill-brand-teal" />
                            <span className="font-bold">{entry.streak}</span>
                        </div>
                        <div className="text-brand-gray text-sm">
                            {entry.total} total
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}
