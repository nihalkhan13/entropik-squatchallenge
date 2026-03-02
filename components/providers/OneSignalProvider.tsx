"use client"

import { useEffect, ReactNode } from 'react'
import { useUser } from '@/context/UserContext'
import { supabase } from '@/lib/supabase'

declare global {
    interface Window {
        OneSignal?: {
            push: (...args: unknown[]) => unknown
            showNativePrompt: () => Promise<void>
            isPushNotificationsEnabled: () => Promise<boolean>
            init: (config: unknown) => void
            getUserId: () => Promise<string | null | undefined>
        } & unknown[]
        html2canvas?: (...args: unknown[]) => Promise<HTMLCanvasElement>
    }
}

export function OneSignalProvider({ children }: { children: ReactNode }) {
    const { user } = useUser()

    useEffect(() => {
        // 1. Inject OneSignal Script
        const script = document.createElement('script')
        script.src = 'https://cdn.onesignal.com/sdks/OneSignalSDK.js'
        script.async = true
        document.head.appendChild(script)

        window.OneSignal = window.OneSignal || ([] as unknown as NonNullable<Window['OneSignal']>)

        window.OneSignal!.push(function () {
            window.OneSignal!.init({
                appId: "af9ce9fc-ad08-4b55-9952-e91f6985b62f",
                safari_web_id: "web.onesignal.auto.10abd404-1836-418c-8432-687295af3c87",
                notifyButton: {
                    enable: false,
                },
                allowLocalhostAsSecureOrigin: true,
            });
        });

        return () => {
            document.head.removeChild(script)
        }
    }, [])

    useEffect(() => {
        if (user && window.OneSignal) {
            window.OneSignal!.push(async function () {
                const userId = await window.OneSignal!.getUserId()
                if (userId) {
                    await supabase
                        .from('users')
                        .update({
                            notification_settings: {
                                ...user.notification_settings,
                                push_token: userId
                            }
                        })
                        .eq('id', user.id)
                }
            })
        }
    }, [user])

    return <>{children}</>
}
