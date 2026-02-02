"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { useUser } from "@/context/UserContext"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Card } from "@/components/ui/Card"

export default function LoginPage() {
    const [name, setName] = useState("")
    const { login, isLoading } = useUser()
    const [error, setError] = useState("")

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!name.trim()) return

        try {
            await login(name)
        } catch (err) {
            setError("Something went wrong. Please try again.")
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
                        100 Squats / 30 Days
                    </p>
                </div>

                <Card className="border-brand-glass-border/50">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label htmlFor="name" className="text-sm font-medium text-brand-gray ml-1">
                                OPERATOR NAME
                            </label>
                            <Input
                                id="name"
                                placeholder="Enter your name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                autoComplete="off"
                                className="text-lg bg-black/20 focus:bg-brand-glass"
                                autoFocus
                            />
                        </div>

                        {error && (
                            <p className="text-sm text-brand-error px-1">
                                {error}
                            </p>
                        )}

                        <Button
                            type="submit"
                            className="w-full text-lg h-14"
                            variant="primary"
                            disabled={!name.trim() || isLoading}
                            isLoading={isLoading}
                        >
                            {isLoading ? "AUTHENTICATING..." : "ENTER CHALLENGE"}
                        </Button>
                    </form>
                </Card>

                <p className="mt-8 text-center text-brand-gray/50 text-xs">
                    NO PASSWORDS REQUIRED • STAY HARD
                </p>
            </motion.div>
        </div>
    )
}
