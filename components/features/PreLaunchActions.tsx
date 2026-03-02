import { useState, useEffect } from "react"
import { Bell, Smartphone, X } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"

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

export function PreLaunchActions() {
    const [showHomescreenPrompt, setShowHomescreenPrompt] = useState(true)
    const [notificationsEnabled, setNotificationsEnabled] = useState(false)

    useEffect(() => {
        // Check if already installed as PWA or if prompt dismissed
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone
        const promptDismissed = localStorage.getItem('entropik_homescreen_dismissed')

        if (isStandalone || promptDismissed) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setShowHomescreenPrompt(false)
        }

        // Check if OneSignal notifications are already granted
        if (window.OneSignal) {
            window.OneSignal!.push(async function () {
                const isEnabled = await window.OneSignal!.isPushNotificationsEnabled()
                setNotificationsEnabled(isEnabled)
            })
        }
    }, [])

    const handleEnableNotifications = async () => {
        if (window.OneSignal) {
            window.OneSignal!.push(async function () {
                await window.OneSignal!.showNativePrompt()
                const isEnabled = await window.OneSignal!.isPushNotificationsEnabled()
                setNotificationsEnabled(isEnabled)
            })
        } else {
            alert("Notification system unavailable. Please ensure your browser supports Push API.")
        }
    }

    const dismissPrompt = () => {
        localStorage.setItem('entropik_homescreen_dismissed', 'true')
        setShowHomescreenPrompt(false)
    }

    return (
        <div className="space-y-4 mb-8">
            {/* Notification Opt-In */}
            {!notificationsEnabled && (
                <Button
                    onClick={handleEnableNotifications}
                    className="w-full bg-brand-teal text-black hover:bg-white transition-colors h-14 font-bold flex gap-2 items-center justify-center"
                >
                    <Bell className="w-5 h-5" />
                    NOTIFY ME WHEN IT STARTS
                </Button>
            )}

            {/* Add to Homescreen Prompt */}
            {showHomescreenPrompt && (
                <Card className="relative border-brand-teal/30 bg-brand-teal/5">
                    <button
                        onClick={dismissPrompt}
                        className="absolute top-2 right-2 p-1 text-brand-gray/50 hover:text-white transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>

                    <div className="flex gap-4 items-start pr-6">
                        <div className="p-3 bg-brand-glass rounded-xl border border-brand-glass-border shrink-0 mt-1">
                            <Smartphone className="w-6 h-6 text-white" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-white font-bold tracking-wide">Install Entropik App</h3>
                            <p className="text-brand-gray text-sm leading-relaxed">
                                For the best experience and to maintain a bulletproof daily habit, add this web app to your homescreen.
                            </p>
                            <p className="text-brand-gray text-xs">
                                <span className="text-white font-semibold">iOS</span>: Tap the Share button (square with arrow) and select &quot;Add to Home Screen&quot;.
                                <br />
                                <span className="text-white font-semibold">Android</span>: Tap the menu (three dots) and select &quot;Add to Home screen&quot;.
                            </p>
                        </div>
                    </div>
                </Card>
            )}
        </div>
    )
}
