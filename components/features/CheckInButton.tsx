"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { supabase, isMock } from "@/lib/supabase"
import { useUser } from "@/context/UserContext"
import { Check, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { storage } from "@/lib/storage"

export function CheckInButton() {
    const { user } = useUser()
    const [hasCheckedIn, setHasCheckedIn] = useState(false)
    const [loading, setLoading] = useState(true)
    const [showConfetti, setShowConfetti] = useState(false)

    // Get today's date in PST timezone (YYYY-MM-DD)
    const getTodayPST = () => {
        const now = new Date();
        // Convert to PST (UTC-8)
        const pstDate = new Date(now.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }));
        const year = pstDate.getFullYear();
        const month = String(pstDate.getMonth() + 1).padStart(2, '0');
        const day = String(pstDate.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };
    const today = getTodayPST();

    useEffect(() => {
        checkStatus()
    }, [user])

    const checkStatus = async () => {
        if (!user) return

        if (isMock) {
            const checkins = storage.getCheckins()
            const checked = checkins.some((c: any) => c.user_id === user.id && c.date === today)
            if (checked) setHasCheckedIn(true)
            setLoading(false)
            return
        }

        const { data } = await supabase
            .from("checkins")
            .select("*")
            .eq("user_id", user.id)
            .eq("date", today)
            .single()

        if (data) {
            setHasCheckedIn(true)
        }
        setLoading(false)
    }

    const handleCheckIn = async () => {
        if (!user || hasCheckedIn || loading) return

        setLoading(true)

        // Optimistic update
        setHasCheckedIn(true)
        setShowConfetti(true)
        setTimeout(() => setShowConfetti(false), 3000)

        if (isMock) {
            await new Promise(r => setTimeout(r, 400))
            storage.addCheckin(user.id, today)
            setLoading(false)
            return
        }

        const { error } = await supabase
            .from("checkins")
            .insert([
                { user_id: user.id, date: today }
            ])

        if (error) {
            console.error("Checkin failed", error)
            setHasCheckedIn(false) // revert
            alert("Check-in failed. Please try again.")
        }

        setLoading(false)
    }

    const handleUndo = async () => {
        if (!confirm("Undo check-in?")) return

        setLoading(true)
        setHasCheckedIn(false)

        if (isMock) {
            storage.removeCheckin(user!.id, today)
            setLoading(false)
            return
        }

        const { error } = await supabase
            .from("checkins")
            .delete()
            .eq("user_id", user!.id)
            .eq("date", today)

        if (error) {
            console.error("Undo failed", error)
            setHasCheckedIn(true)
        }
        setLoading(false)
    }

    return (
        <div className="relative w-full">
            <AnimatePresence>
                {showConfetti && (
                    <ConfettiBurst />
                )}
            </AnimatePresence>

            <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={hasCheckedIn ? undefined : handleCheckIn}
                className={cn(
                    "relative w-full h-24 rounded-2xl flex items-center justify-center overflow-hidden transition-all duration-500",
                    hasCheckedIn
                        ? "bg-brand-glass cursor-default border border-brand-teal/50 shadow-[0_0_20px_rgba(93,255,221,0.1)]"
                        : "bg-gradient-to-br from-brand-teal to-[#2aa890] shadow-[0_0_30px_rgba(93,255,221,0.4)]"
                )}
            >
                {loading ? (
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white" />
                ) : hasCheckedIn ? (
                    <div className="flex flex-col items-center">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        >
                            <Check className="w-8 h-8 text-brand-teal drop-shadow-[0_0_10px_rgba(93,255,221,0.8)]" />
                        </motion.div>
                        <span className="text-brand-teal font-bold tracking-widest text-sm mt-1">
                            COMPLETE
                        </span>
                    </div>
                ) : (
                    <div className="flex flex-col items-center">
                        <span className="text-brand-dark font-extrabold text-xl tracking-tighter">
                            I DID MY 100 SQUATS
                        </span>
                        <span className="text-brand-dark/60 text-xs font-semibold tracking-widest uppercase mt-1">
                            TAP TO CONFIRM
                        </span>
                    </div>
                )}

                {/* Shine effect */}
                {!hasCheckedIn && (
                    <motion.div
                        className="absolute inset-0 bg-white/20"
                        initial={{ x: "-100%" }}
                        animate={{ x: "100%" }}
                        transition={{ repeat: Infinity, duration: 2, ease: "linear", repeatDelay: 1 }}
                        style={{ skewX: "-20deg" }}
                    />
                )}
            </motion.button>

            {/* Visual Undo helper (moved outside button to prevent hydration error) */}
            {hasCheckedIn && (
                <button
                    onClick={(e) => { e.stopPropagation(); handleUndo(); }}
                    className="absolute top-2 right-2 z-20 text-brand-gray/50 hover:text-brand-error p-2 transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>
            )}
        </div>
    )
}

function ConfettiBurst() {
    // Simple particle burst
    const particles = Array.from({ length: 20 })
    return (
        <div className="absolute inset-0 pointer-events-none flex justify-center items-center overflow-visible z-10">
            {particles.map((_, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 1, scale: 0, x: 0, y: 0 }}
                    animate={{
                        opacity: 0,
                        scale: Math.random() * 1 + 0.5,
                        x: (Math.random() - 0.5) * 300,
                        y: (Math.random() - 0.5) * 300,
                        rotate: Math.random() * 360
                    }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="absolute w-2 h-2 bg-brand-teal rounded-sm shadow-[0_0_10px_#5dffdd]"
                />
            ))}
        </div>
    )
}
