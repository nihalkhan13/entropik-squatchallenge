"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@/context/UserContext"
import { Loader2 } from "lucide-react"

export default function AppLayout({ children }: { children: React.ReactNode }) {
    const { user, isLoading } = useUser()
    const router = useRouter()

    useEffect(() => {
        if (!isLoading && !user) {
            router.replace("/login")
        }
    }, [user, isLoading, router])

    if (isLoading || !user) {
        // Show loading while checking auth
        return (
            <div className="min-h-screen bg-brand-dark flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-brand-teal animate-spin" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-brand-dark relative overflow-x-hidden">
            {/* Background Mesh (Optional refined aesthetic) */}
            <div className="fixed inset-0 pointer-events-none z-[-1]">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-brand-teal/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-500/5 rounded-full blur-[120px]" />
            </div>

            <main className="max-w-md mx-auto min-h-screen flex flex-col p-4 pb-20">
                {/* Header */}
                <header className="flex items-center justify-between py-4 mb-6">
                    <div className="flex items-center">
                        <img src="/logo.png" alt="ENTROPIK" className="h-24 w-auto -ml-5" />
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="text-right">
                            <p className="text-[10px] text-brand-gray uppercase tracking-widest">Operator</p>
                            <p className="text-sm font-medium text-brand-teal">{user.username}</p>
                        </div>
                        {/* Avatar placeholder */}
                        <div className="h-8 w-8 rounded-full bg-brand-glass border border-brand-glass-border flex items-center justify-center text-xs font-bold text-white">
                            {user.username.charAt(0).toUpperCase()}
                        </div>
                    </div>
                </header>

                {children}
            </main>
        </div>
    )
}
