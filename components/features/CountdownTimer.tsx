import { useEffect, useState } from "react"

interface CountdownProps {
    targetDate: string; // YYYY-MM-DD
}

export function CountdownTimer({ targetDate }: CountdownProps) {
    const [timeLeft, setTimeLeft] = useState<{ days: number, hours: number, minutes: number, seconds: number } | null>(null)

    useEffect(() => {
        // Target date midnight PST
        const target = new Date(`${targetDate}T00:00:00-08:00`).getTime()

        const interval = setInterval(() => {
            const now = new Date().getTime()
            const difference = target - now

            if (difference <= 0) {
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
                clearInterval(interval)
            } else {
                setTimeLeft({
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                    minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
                    seconds: Math.floor((difference % (1000 * 60)) / 1000)
                })
            }
        }, 1000)

        return () => clearInterval(interval)
    }, [targetDate])

    if (!timeLeft) return null // Initial render empty to prevent hydration mismatch

    return (
        <div className="flex gap-4 justify-center my-8">
            <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-brand-glass border border-brand-glass-border rounded-xl flex items-center justify-center text-2xl font-black text-brand-teal">
                    {timeLeft.days.toString().padStart(2, '0')}
                </div>
                <span className="text-[10px] text-brand-gray tracking-widest uppercase mt-2 font-bold">Days</span>
            </div>
            <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-brand-glass border border-brand-glass-border rounded-xl flex items-center justify-center text-2xl font-black text-brand-teal">
                    {timeLeft.hours.toString().padStart(2, '0')}
                </div>
                <span className="text-[10px] text-brand-gray tracking-widest uppercase mt-2 font-bold">Hrs</span>
            </div>
            <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-brand-glass border border-brand-glass-border rounded-xl flex items-center justify-center text-2xl font-black text-white/80">
                    {timeLeft.minutes.toString().padStart(2, '0')}
                </div>
                <span className="text-[10px] text-brand-gray tracking-widest uppercase mt-2 font-bold">Min</span>
            </div>
            <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-brand-glass border border-brand-glass-border rounded-xl flex items-center justify-center text-2xl font-black text-white/50">
                    {timeLeft.seconds.toString().padStart(2, '0')}
                </div>
                <span className="text-[10px] text-brand-gray tracking-widest uppercase mt-2 font-bold">Sec</span>
            </div>
        </div>
    )
}
