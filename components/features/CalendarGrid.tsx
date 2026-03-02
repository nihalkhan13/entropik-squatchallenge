import { useEffect, useState } from "react"
import { supabase, isMock } from "@/lib/supabase"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { User, useUser } from "@/context/UserContext"
import { storage } from "@/lib/storage"
import { CHALLENGE_START_DATE, getTodayPST } from "@/lib/date"

type Checkin = {
    user_id: string
    date: string
}

export function CalendarGrid({ challengeType = 'squat' }: { challengeType?: 'squat' | 'plank' }) {
    const { user: currentUser } = useUser()
    const [users, setUsers] = useState<User[]>([])
    const [checkins, setCheckins] = useState<Checkin[]>([])
    const [loading, setLoading] = useState(true)
    const [startDateStr, setStartDateStr] = useState(CHALLENGE_START_DATE.split('T')[0])

    const today = getTodayPST()

    useEffect(() => {
        fetchData()

        if (isMock) return

        // Subscribe to realtime changes
        const subscription = supabase
            .channel('public:checkins')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'checkins' }, () => {
                fetchData()
            })
            .subscribe()

        return () => {
            supabase.removeChannel(subscription)
        }
    }, [])

    const fetchData = async () => {
        try {
            if (isMock) {
                setUsers(storage.getUsers())
                const storedCheckins = storage.getCheckins()
                setCheckins(storedCheckins.map((c: { user_id: string, date: string }) => ({ user_id: c.user_id, date: c.date })))

                const settings = storage.getSettings()
                const startSetting = settings.find((s: { key: string, value: string }) => s.key === 'start_date')
                if (startSetting) setStartDateStr(startSetting.value)

                setLoading(false)
                return
            }

            let uQuery = supabase.from("users").select("*").order("username")
            if (challengeType === 'squat') {
                uQuery = uQuery.eq("allowed_legacy_squat", true)
            }
            const { data: usersData } = await uQuery
            const { data: checkinsData } = await supabase.from("checkins").select("user_id, date").eq("challenge_type", challengeType)
            const { data: settings } = await supabase.from("challenge_settings").select("*").eq("key", "start_date").maybeSingle()

            if (usersData) setUsers(usersData)
            if (checkinsData) setCheckins(checkinsData)
            if (settings) setStartDateStr(settings.value)
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    const handleToggleDate = async (date: string) => {
        // Only allow editing if logged in
        if (!currentUser) return

        // Cannot edit future
        if (date > today) return

        const isChecked = checkins.some(c => c.user_id === currentUser.id && c.date === date)

        // Optimistic update
        const newCheckins = isChecked
            ? checkins.filter(c => !(c.user_id === currentUser.id && c.date === date))
            : [...checkins, { user_id: currentUser.id, date }]

        setCheckins(newCheckins)

        if (isMock) {
            if (isChecked) {
                storage.removeCheckin(currentUser.id, date)
            } else {
                storage.addCheckin(currentUser.id, date)
            }
            return
        }

        if (isChecked) {
            // Delete
            await supabase.from("checkins").delete().match({ user_id: currentUser.id, date, challenge_type: challengeType })
        } else {
            // Insert
            await supabase.from("checkins").insert({ user_id: currentUser.id, date, challenge_type: challengeType })
        }
    }

    // Generate 30 days based on dynamic start date
    const startDate = new Date(startDateStr)
    const challengeDays = Array.from({ length: 30 }, (_, i) => {
        const d = new Date(startDate)
        d.setDate(d.getDate() + i)
        return d.toISOString().split("T")[0]
    })

    if (loading) return <div className="h-40 animate-pulse bg-brand-glass rounded-xl" />

    return (
        <div className="w-full overflow-x-auto pb-4">
            <div className="min-w-[600px]"> {/* Ensure scroll on mobile */}
                <div className="grid grid-cols-[120px_repeat(30,1fr)] gap-1 mb-2">
                    <div className="text-xs text-brand-gray font-bold uppercase tracking-wider sticky left-0 bg-brand-dark z-10 p-1">
                        ATHLETE
                    </div>
                    {challengeDays.map((date, i) => (
                        <div key={date} className="text-[10px] text-brand-gray text-center">
                            {i + 1}
                        </div>
                    ))}
                </div>

                <div className="space-y-1">
                    {users.map(user => {
                        const isMe = currentUser?.id === user.id
                        return (
                            <div key={user.id} className="grid grid-cols-[120px_repeat(30,1fr)] gap-1 items-center hover:bg-white/5 transition-colors rounded-lg p-1">
                                <div className={cn(
                                    "text-sm font-medium truncate pr-2 sticky left-0 bg-brand-dark z-10",
                                    isMe ? "text-brand-teal" : "text-gray-300"
                                )}>
                                    {user.username}
                                </div>

                                {challengeDays.map(date => {
                                    const isChecked = checkins.some(c => c.user_id === user.id && c.date === date)
                                    const isPast = date < today
                                    const isToday = date === today

                                    let status = "upcoming"
                                    if (isChecked) status = "completed"
                                    else if (isPast) status = "missed"
                                    else if (isToday) status = "today"

                                    // Interactive only if it's me and not future
                                    const canInteract = isMe && date <= today

                                    return (
                                        <div
                                            key={`${user.id}-${date}`}
                                            onClick={() => canInteract && handleToggleDate(date)}
                                            className={cn(
                                                "aspect-square flex items-center justify-center relative group",
                                                canInteract && "cursor-pointer"
                                            )}
                                        >
                                            {/* Hover indicator for editable cells */}
                                            {canInteract && (
                                                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-[2px]" />
                                            )}

                                            <motion.div
                                                initial={false}
                                                animate={{
                                                    scale: isChecked ? 1 : 0.8,
                                                    opacity: status === "upcoming" ? 0.3 : 1
                                                }}
                                                className={cn(
                                                    "w-full h-full rounded-[2px] transition-colors duration-300",
                                                    status === "completed" && "bg-brand-teal shadow-[0_0_5px_theme(colors.brand.teal)]",
                                                    status === "missed" && "bg-brand-error opacity-50",
                                                    status === "upcoming" && "bg-brand-gray/20",
                                                    status === "today" && !isChecked && "bg-brand-gray/20 border border-brand-teal/50 animate-pulse"
                                                )}
                                            />
                                        </div>
                                    )
                                })}
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
