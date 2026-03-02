"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@/context/UserContext"
import { Loader2 } from "lucide-react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/Card"

export default function HomePage() {
  const { user, isLoading, logout } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login")
    }
  }, [user, isLoading, router])

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-brand-dark flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 text-brand-teal animate-spin" />
          <div className="text-brand-teal font-mono tracking-widest text-sm animate-pulse">
            INITIALIZING...
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden bg-brand-dark">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand-teal/10 rounded-full blur-[100px] animate-pulse-slow" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md z-10 flex flex-col gap-6"
      >
        <div className="text-center mb-6 flex flex-col items-center">
          <img src="/logo.png" alt="ENTROPIK" className="h-24 w-auto mb-4" />
          <p className="text-brand-gray text-lg tracking-wide uppercase text-xs font-semibold">
            SQUAD CHALLENGES
          </p>
        </div>

        <button onClick={() => router.push("/plank")} className="w-full text-left">
          <Card className="hover:border-brand-teal transition-colors border-brand-glass-border/50 group">
            <h2 className="text-xl font-bold text-white group-hover:text-brand-teal transition-colors">30-Day Plank Challenge</h2>
            <p className="text-brand-gray text-sm mt-2">2 minutes a day. Stay hard.</p>
          </Card>
        </button>

        {user.allowed_legacy_squat && (
          <button onClick={() => router.push("/dashboard")} className="w-full text-left">
            <Card className="hover:border-brand-teal transition-colors border-brand-glass-border/50 group opacity-70 hover:opacity-100">
              <h2 className="text-xl font-bold text-white group-hover:text-brand-teal transition-colors">100-Day Squat Challenge</h2>
              <p className="text-brand-gray text-sm mt-2">Legacy challenge. 100 squats a day.</p>
            </Card>
          </button>
        )}

        <button
          onClick={logout}
          className="mt-8 text-sm text-brand-gray/50 hover:text-white transition-colors uppercase tracking-widest"
        >
          Sign Out
        </button>
      </motion.div>
    </div>
  )
}
