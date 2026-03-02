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
    if (!isLoading) {
      if (!user) {
        router.replace("/login")
      } else {
        router.replace("/plank")
      }
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

  return null // Handled by useEffect redirect
}
