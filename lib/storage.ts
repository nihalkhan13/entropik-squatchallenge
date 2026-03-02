
"use client"

import { DEMO_USERS, DEMO_CHECKINS, DEMO_SETTINGS } from "@/lib/demo-data"
import { User } from "@/context/UserContext"

const KEYS = {
    USERS: "entropik_users_db",
    CHECKINS: "entropik_checkins_db",
    SETTINGS: "entropik_settings_db"
}

export const storage = {
    // --- Users ---
    getUsers: (): User[] => {
        if (typeof window === "undefined") return DEMO_USERS as User[]

        try {
            const stored = localStorage.getItem(KEYS.USERS)
            if (!stored) {
                // Initialize with seed data
                localStorage.setItem(KEYS.USERS, JSON.stringify(DEMO_USERS))
                return DEMO_USERS as User[]
            }
            return JSON.parse(stored)
        } catch (e) {
            console.error("Storage error", e)
            return DEMO_USERS as User[]
        }
    },

    saveUser: (user: User) => {
        const users = storage.getUsers()
        const existingIdx = users.findIndex(u => u.id === user.id)

        if (existingIdx >= 0) {
            users[existingIdx] = user
        } else {
            users.push(user)
        }

        localStorage.setItem(KEYS.USERS, JSON.stringify(users))
        return user
    },

    deleteUser: (id: string) => {
        const users = storage.getUsers().filter(u => u.id !== id)
        localStorage.setItem(KEYS.USERS, JSON.stringify(users))
    },

    // --- Checkins ---
    getCheckins: () => {
        if (typeof window === "undefined") return DEMO_CHECKINS

        try {
            const stored = localStorage.getItem(KEYS.CHECKINS)
            if (!stored) {
                localStorage.setItem(KEYS.CHECKINS, JSON.stringify(DEMO_CHECKINS))
                return DEMO_CHECKINS
            }
            return JSON.parse(stored)
        } catch (e) {
            return DEMO_CHECKINS
        }
    },

    addCheckin: (userId: string, date: string) => {
        const checkins = storage.getCheckins()
        // Prevent dupes
        if (checkins.some((c: { user_id: string, date: string }) => c.user_id === userId && c.date === date)) return

        checkins.push({
            id: `local-${Date.now()}-${Math.random()}`,
            user_id: userId,
            date,
            created_at: new Date().toISOString()
        })
        localStorage.setItem(KEYS.CHECKINS, JSON.stringify(checkins))
    },

    removeCheckin: (userId: string, date: string) => {
        const checkins = storage.getCheckins().filter((c: { user_id: string, date: string }) => !(c.user_id === userId && c.date === date))
        localStorage.setItem(KEYS.CHECKINS, JSON.stringify(checkins))
    },

    // --- Settings ---
    getSettings: () => {
        if (typeof window === "undefined") return DEMO_SETTINGS
        try {
            const stored = localStorage.getItem(KEYS.SETTINGS)
            if (!stored) {
                localStorage.setItem(KEYS.SETTINGS, JSON.stringify(DEMO_SETTINGS))
                return DEMO_SETTINGS
            }
            return JSON.parse(stored)
        } catch (e) {
            return DEMO_SETTINGS
        }
    },

    saveSetting: (key: string, value: string) => {
        const settings = storage.getSettings()
        const idx = settings.findIndex((s: { key: string }) => s.key === key)
        if (idx >= 0) settings[idx].value = value
        else settings.push({ key, value })
        localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings))
    }
}
