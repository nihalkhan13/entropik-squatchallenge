"use client"

import { useEffect, useState } from "react"
import { useUser } from "@/context/UserContext"
import { supabase, isMock } from "@/lib/supabase"
import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import { Input } from "@/components/ui/Input"
import { useRouter } from "next/navigation"
import { DEMO_SETTINGS, DEMO_USERS } from "@/lib/demo-data"

export default function AdminPage() {
    const { user, isLoading } = useUser()
    const router = useRouter()
    const [users, setUsers] = useState<any[]>([])
    const [startDate, setStartDate] = useState("")

    useEffect(() => {
        if (!isLoading) {
            if (!user || !user.is_admin) {
                // router.replace("/dashboard")  <-- Uncomment to enforce strict security
                // For MVP demo, allowing access or showing "Unauthorized"
                if (!user?.is_admin) console.warn("Accessing admin without admin flag")
            }
            fetchData()
        }
    }, [user, isLoading])

    const fetchData = async () => {
        if (isMock) {
            setUsers(DEMO_USERS)
            const setting = DEMO_SETTINGS.find(s => s.key === "start_date")
            if (setting) setStartDate(setting.value)
            return
        }

        const { data: usersData } = await supabase.from("users").select("*").order("created_at")
        if (usersData) setUsers(usersData)

        const { data: settings } = await supabase.from("challenge_settings").select("*").eq("key", "start_date").single()
        if (settings) setStartDate(settings.value)
    }

    const handleDeleteUser = async (id: string) => {
        if (!confirm("Delete user? This cannot be undone.")) return
        if (isMock) {
            const newUsers = users.filter(u => u.id !== id)
            setUsers(newUsers)
            return
        }
        await supabase.from("users").delete().eq("id", id)
        fetchData()
    }

    const handleUpdateDate = async () => {
        if (isMock) {
            alert("Date updated (Demo)")
            return
        }
        await supabase.from("challenge_settings").upsert({ key: "start_date", value: startDate })
        alert("Date updated")
    }

    const exportCSV = async () => {
        const { data: checkins } = await supabase.from("checkins").select("*, users(username)")
        if (!checkins) return

        const header = "username,date,created_at\n"
        const rows = checkins.map((c: any) => `${c.users?.username},${c.date},${c.created_at}`).join("\n")
        const blob = new Blob([header + rows], { type: "text/csv" })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = "entropik_checkins.csv"
        a.click()
    }

    return (
        <div className="space-y-8">
            <h1 className="text-2xl font-bold text-white">Admin Control</h1>

            <Card>
                <h2 className="text-lg font-bold text-white mb-4">Settings</h2>
                <div className="flex gap-4">
                    <Input
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        placeholder="Start Date (YYYY-MM-DD)"
                    />
                    <Button onClick={handleUpdateDate} variant="secondary">Save</Button>
                </div>
            </Card>

            <Card>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold text-white">Users</h2>
                    <Button onClick={exportCSV} size="sm" variant="glass">Export CSV</Button>
                </div>

                <div className="space-y-2">
                    {users.map(u => (
                        <div key={u.id} className="flex justify-between items-center p-2 bg-white/5 rounded">
                            <span className="text-sm font-mono text-gray-300">
                                {u.username} {u.is_admin ? "(ADMIN)" : ""}
                            </span>
                            <Button
                                onClick={() => handleDeleteUser(u.id)}
                                variant="danger"
                                size="sm"
                                className="h-8 text-xs"
                            >
                                Remove
                            </Button>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    )
}
