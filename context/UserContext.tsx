"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase, isMock } from "@/lib/supabase"

export type User = {
    id: string
    auth_id: string
    email: string | null
    username: string
    created_at: string
    is_admin: boolean
    allowed_legacy_squat: boolean
    notification_settings?: {
        reminders?: boolean
        social?: boolean
        push_token?: string
    }
}

interface UserContextType {
    user: User | null
    isLoading: boolean
    loginWithGoogle: () => Promise<void>
    updateUser: (updates: Partial<User>) => Promise<void>
    logout: () => void
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        if (isMock) {
            // Mock mode doesn't support Google Auth easily, we just stop loading.
            setIsLoading(false)
            return
        }

        const fetchPublicUser = async (authId: string) => {
            try {
                // Poll briefly if trigger hasn't finished yet
                let data = null;
                for (let i = 0; i < 8; i++) {
                    const res = await supabase
                        .from("users")
                        .select("*")
                        .eq("auth_id", authId)
                        .maybeSingle()

                    if (res.data) {
                        data = res.data
                        break
                    }
                    await new Promise(r => setTimeout(r, 500))
                }

                if (data) {
                    console.log("[UserContext] Found public user row:", data);
                    setUser(data)
                } else {
                    console.warn("[UserContext] Could not find public user for authId:", authId);
                    await supabase.auth.signOut();
                    setUser(null)
                }
            } catch (err) {
                console.error("Error fetching public user:", err)
                setUser(null)
            } finally {
                setIsLoading(false)
            }
        }

        // Check active session
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user) {
                fetchPublicUser(session.user.id)
            } else {
                setUser(null)
                setIsLoading(false)
            }
        })

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                if (session?.user) {
                    setIsLoading(true)
                    await fetchPublicUser(session.user.id)
                } else {
                    setUser(null)
                    setIsLoading(false)
                }
            }
        )

        return () => subscription.unsubscribe()
    }, [])

    const loginWithGoogle = async () => {
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/`,
                }
            })
            if (error) throw error
        } catch (error) {
            console.error('Error logging in with Google', error)
            throw error
        }
    }

    const updateUser = async (updates: Partial<User>) => {
        if (!user) return

        const { data, error } = await supabase
            .from("users")
            .update(updates)
            .eq("id", user.id)
            .select()
            .maybeSingle()

        if (error) {
            console.error("Update user error", error)
            throw error
        }

        if (data) {
            setUser(data)
        }
    }

    const logout = async () => {
        await supabase.auth.signOut()
        setUser(null)
        router.push("/login")
    }

    return (
        <UserContext.Provider value={{ user, isLoading, loginWithGoogle, updateUser, logout }}>
            {children}
        </UserContext.Provider>
    )
}

export function useUser() {
    const context = useContext(UserContext)
    if (context === undefined) {
        throw new Error("useUser must be used within a UserProvider")
    }
    return context
}
