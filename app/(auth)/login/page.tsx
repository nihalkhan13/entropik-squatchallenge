"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { useUser } from "@/context/UserContext"
import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"

export default function LoginPage() {
    const { loginWithGoogle, isLoading } = useUser()
    const [error, setError] = useState("")

    const handleGoogleLogin = async () => {
        try {
            await loginWithGoogle()
        } catch (err) {
            setError("Something went wrong with Google Login. Please try again.")
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Ambience */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand-teal/10 rounded-full blur-[100px] animate-pulse-slow" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="w-full max-w-md z-10"
            >
                <div className="text-center mb-10 flex flex-col items-center">
                    <img src="/logo.png" alt="ENTROPIK" className="h-32 w-auto mb-4" />
                    <p className="text-brand-gray text-lg tracking-wide uppercase text-xs font-semibold">
                        SQUAD CHALLENGES
                    </p>
                </div>

                <Card className="border-brand-glass-border/50">
                    <div className="space-y-6">
                        <div className="space-y-2 text-center">
                            <h2 className="text-xl font-bold text-white tracking-wider">SECURE ACCESS</h2>
                            <p className="text-sm text-brand-gray">Log in to track your progress.</p>
                        </div>

                        {error && (
                            <p className="text-sm text-brand-error px-1 text-center">
                                {error}
                            </p>
                        )}

                        <Button
                            onClick={handleGoogleLogin}
                            className="w-full text-lg h-14 bg-white text-black hover:bg-gray-200"
                            disabled={isLoading}
                            isLoading={isLoading}
                        >
                            {isLoading ? "AUTHENTICATING..." : "SIGN IN WITH GOOGLE"}
                        </Button>
                    </div>
                </Card>
            </motion.div>
        </div>
    )
}
