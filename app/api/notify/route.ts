import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { sendPushNotification } from '@/lib/notifications'

export async function POST(request: Request) {
    try {
        const { type, data } = await request.json()

        if (type === 'social-pulse') {
            // Logic for "X% of squad finished"
            // 1. Get total users
            const { count: totalUsers } = await supabase
                .from('users')
                .select('*', { count: 'exact', head: true })

            // 2. Get today's checkins
            const today = new Date().toISOString().split('T')[0]
            const { count: checkedInCount } = await supabase
                .from('checkins')
                .select('*', { count: 'exact', head: true })
                .eq('date', today)

            if (!totalUsers || !checkedInCount) return NextResponse.json({ success: true })

            const percentage = Math.round((checkedInCount / totalUsers) * 100)

            // Trigger social pressure at milestones (e.g., 50%, 80%)
            if (percentage === 50 || percentage === 80) {
                // Get users who HAVEN'T checked in and have a push token
                const { data: usersToNotify } = await supabase
                    .from('users')
                    .select('id, notification_settings')
                    .not('id', 'in', (
                        supabase.from('checkins').select('user_id').eq('date', today)
                    ))

                const tokenList = usersToNotify
                    ?.filter(u => u.notification_settings?.push_token && u.notification_settings?.social !== false)
                    .map(u => u.notification_settings.push_token) || []

                if (tokenList.length > 0) {
                    await sendPushNotification({
                        userIds: tokenList,
                        title: "Squad Pulse ⚡",
                        message: `${percentage}% of your squad finished their plank. Don't be the outlier.`
                    })
                }
            }
        }

        if (type === 'daily-reminder') {
            // Logic for 6 PM reminder for those who haven't checked in
            const today = new Date().toISOString().split('T')[0]

            // Complex query to find users who didn't check in today
            // For simplicity in this demo, we'll fetch all and filter
            const { data: allUsers } = await supabase
                .from('users')
                .select('id, notification_settings')

            const { data: checkinsToday } = await supabase
                .from('checkins')
                .select('user_id')
                .eq('date', today)

            const checkedInIds = new Set(checkinsToday?.map(c => c.user_id) || [])

            const tokenList = allUsers
                ?.filter(u => !checkedInIds.has(u.id) && u.notification_settings?.push_token && u.notification_settings?.reminders !== false)
                .map(u => u.notification_settings.push_token) || []

            if (tokenList.length > 0) {
                await sendPushNotification({
                    userIds: tokenList,
                    title: "Status Check 👊",
                    message: "The day is ending. Protect your streak."
                })
            }
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Notification API Error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
