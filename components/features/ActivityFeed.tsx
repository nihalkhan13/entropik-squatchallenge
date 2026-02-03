"use client"

import { useEffect, useState } from "react"
import { supabase, isMock } from "@/lib/supabase"
import { Activity } from "@/lib/types"
import { motion, AnimatePresence } from "framer-motion"
import { useUser } from "@/context/UserContext"
import { ActivityItem } from "./ActivityItem"
import { Flame } from "lucide-react"

export function ActivityFeed() {
    const { user } = useUser()
    const [activities, setActivities] = useState<Activity[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchActivities()

        if (isMock) return

        // Subscribe to NEW activities
        const activitySub = supabase
            .channel('public:activities')
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'activities'
            }, async (payload) => {
                // Fetch the user data for the new activity
                const { data } = await supabase
                    .from('activities')
                    .select('*, user:users(*)')
                    .eq('id', payload.new.id)
                    .single()

                if (data) {
                    setActivities(prev => [data as Activity, ...prev].slice(0, 50))
                }
            })
            .subscribe()

        return () => {
            supabase.removeChannel(activitySub)
        }
    }, [])

    const fetchActivities = async () => {
        if (isMock) {
            setLoading(false)
            return
        }

        const { data, error } = await supabase
            .from('activities')
            .select('*, user:users(*)')
            .order('created_at', { ascending: false })
            .limit(20)

        if (data) {
            setActivities(data as Activity[])
        }
        setLoading(false)
    }

    if (loading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3].map(i => (
                    <div key={i} className="h-20 bg-brand-glass animate-pulse rounded-2xl border border-brand-glass-border" />
                ))}
            </div>
        )
    }

    return (
        <section className="space-y-4">
            <div className="flex items-center gap-2 mb-2 px-1">
                <Flame className="w-5 h-5 text-brand-teal" />
                <h2 className="text-white font-bold text-lg uppercase tracking-wider">
                    Squad Pulse
                </h2>
            </div>

            <div className="space-y-3">
                <AnimatePresence initial={false}>
                    {activities.length > 0 ? (
                        activities.map((activity) => (
                            <ActivityItem key={activity.id} activity={activity} />
                        ))
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-10 text-brand-gray/50 text-sm italic"
                        >
                            No activity yet. Be the first to check in!
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </section>
    )
}
