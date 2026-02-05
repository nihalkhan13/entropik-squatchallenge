"use client"

import { Activity } from "@/lib/types"
import { motion } from "framer-motion"
import { useUser } from "@/context/UserContext"
import { cn } from "@/lib/utils"
import { ReactionsList } from "./ReactionsList"
import { ReactionPicker } from "./ReactionPicker"
import { getDayNumber } from "@/lib/date"

interface ActivityItemProps {
    activity: Activity
}

export function ActivityItem({ activity }: { activity: Activity }) {
    const { user } = useUser()
    const isMe = user?.id === activity.user_id

    const getActionText = () => {
        switch (activity.event_type) {
            case 'completed':
                // Use metadata.day, or calculate from metadata.date, or fallback to created_at
                const dateSource = activity.metadata?.date || activity.created_at
                const calculatedDay = getDayNumber(dateSource)
                const day = activity.metadata?.day || (isNaN(calculatedDay) ? '?' : calculatedDay)
                return `completed Day ${day}`
            case 'streak_milestone':
                return `hit a ${activity.metadata.streak_count} day streak!`
            case 'finished':
                return `finished the challenge! 🏆`
            case 'missed':
                return `missed today. Get 'em tomorrow.`
            default:
                return `recorded an action`
        }
    }

    const getTimeAgo = (dateStr: string) => {
        const date = new Date(dateStr)
        const now = new Date()
        const diffMs = now.getTime() - date.getTime()
        const diffMins = Math.floor(diffMs / 60000)

        if (diffMins < 1) return 'just now'
        if (diffMins < 60) return `${diffMins}m ago`

        const diffHours = Math.floor(diffMins / 60)
        if (diffHours < 24) return `${diffHours}h ago`

        return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
    }

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-brand-glass border border-brand-glass-border/50 rounded-2xl p-4 flex gap-4 transition-all hover:bg-white/5 active:scale-[0.99]"
        >
            {/* Avatar */}
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-brand-teal/20 to-brand-teal/5 border border-brand-teal/30 flex items-center justify-center text-brand-teal font-bold text-sm shadow-[0_0_10px_rgba(93,255,221,0.1)]">
                {activity.user?.username?.[0]?.toUpperCase() || "?"}
            </div>

            <div className="flex-grow min-w-0">
                <div className="flex items-center justify-between gap-2 mb-0.5">
                    <span className={cn("font-bold text-sm truncate", isMe ? "text-brand-teal" : "text-white")}>
                        {activity.user?.username || "Anonymous"}
                    </span>
                    <span className="text-[10px] text-brand-gray/40 whitespace-nowrap font-medium">
                        {getTimeAgo(activity.created_at)}
                    </span>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                    <p className="text-sm text-brand-gray/90 leading-tight">
                        {getActionText()}
                    </p>
                    {activity.event_type === 'completed' && (
                        <span className="text-xs">🔥</span>
                    )}
                </div>

                {/* Reactions Row */}
                <div className="mt-3 flex items-center gap-2">
                    <ReactionsList activityId={activity.id} />
                    <ReactionPicker activityId={activity.id} />
                </div>
            </div>
        </motion.div>
    )
}
