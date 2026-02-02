"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase, isMock } from "@/lib/supabase"
import { storage } from "@/lib/storage"

// Let's define the User type
export type User = {
    id: string
    username: string
    created_at: string
    is_admin: boolean
}

interface UserContextType {
    user: User | null
    isLoading: boolean
    login: (username: string) => Promise<void>
    logout: () => void
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        // Check local storage on mount
        const storedUsername = localStorage.getItem("entropik_user")
        if (storedUsername) {
            fetchUser(storedUsername)
        } else {
            setIsLoading(false)
        }
    }, [])

    const fetchUser = async (username: string) => {
        const cleanName = username.trim()

        if (isMock) {
            // Mock Fetch via LocalStorage
            const users = storage.getUsers()
            const mockUser = users.find(u => u.username.toLowerCase() === cleanName.toLowerCase())

            if (mockUser) {
                setUser(mockUser)
                localStorage.setItem("entropik_user", mockUser.username)
            } else {
                // In persist mode, if user not found, they must sign up (login fn handles creation).
                // But here (re-hydrate), if not found, we logout.
                localStorage.removeItem("entropik_user")
            }
            setIsLoading(false)
            return
        }

        try {
            const { data, error } = await supabase
                .from("users")
                .select("*")
                .eq("username", cleanName)
                .single()

            if (data) {
                setUser(data)
                localStorage.setItem("entropik_user", cleanName)
            } else if (error && error.code !== "PGRST116") {
                console.error("Error fetching user:", error)
            } else {
                localStorage.removeItem("entropik_user")
            }
        } catch (err) {
            console.error("Auth error", err)
        } finally {
            setIsLoading(false)
        }
    }

    const login = async (username: string) => {
        setIsLoading(true)
        const cleanName = username.trim()

        if (isMock) {
            // Mock Login via LocalStorage
            await new Promise(r => setTimeout(r, 600)) // Fake delay
            const users = storage.getUsers()
            let mockUser = users.find(u => u.username.toLowerCase() === cleanName.toLowerCase())

            if (mockUser) {
                setUser(mockUser)
                localStorage.setItem("entropik_user", mockUser.username)
            } else {
                // Create new offline user
                const newUser = {
                    id: `local-u-${Date.now()}`,
                    username: cleanName,
                    created_at: new Date().toISOString(),
                    is_admin: false
                }
                storage.saveUser(newUser)
                setUser(newUser)
                localStorage.setItem("entropik_user", cleanName)
            }
            setIsLoading(false)
            router.push("/dashboard")
            return
        }

        // Check if user exists
        let { data: existingUser, error } = await supabase
            .from("users")
            .select("*")
            .eq("username", cleanName)
            .single()

        if (error && error.code !== "PGRST116") {
            console.error("Login lookup error", error)
            setIsLoading(false)
            throw error
        }

        if (existingUser) {
            setUser(existingUser)
            localStorage.setItem("entropik_user", cleanName)
        } else {
            // Create new user
            const { data: newUser, error: createError } = await supabase
                .from("users")
                .insert([{ username: cleanName }])
                .select()
                .single()

            if (createError) {
                console.error("Create user error", createError)
                setIsLoading(false)
                throw createError
            }

            if (newUser) {
                setUser(newUser)
                localStorage.setItem("entropik_user", cleanName)
            }
        }

        setIsLoading(false)
        router.push("/dashboard")
    }

    const logout = () => {
        setUser(null)
        localStorage.removeItem("entropik_user")
        router.push("/login")
    }

    return (
        <UserContext.Provider value={{ user, isLoading, login, logout }}>
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
