import { Card } from "@/components/ui/Card"
import { Info } from "lucide-react"

export function ChallengeInstructions() {
    return (
        <Card className="border-brand-glass-border/30 bg-brand-glass/40 mb-8 mt-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-brand-teal rounded-l-2xl" />

            <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-brand-teal mt-0.5 shrink-0" />
                <div className="space-y-4">
                    <div>
                        <h3 className="text-white font-bold text-lg mb-1 tracking-wide">MISSION BRIEFING</h3>
                        <p className="text-brand-gray text-sm leading-relaxed">
                            Do a 2-minute plank every single day and click the check-in button once complete. Consistency is everything.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <h4 className="text-brand-teal text-xs font-bold uppercase tracking-widest">How to Plank</h4>
                        <ol className="text-brand-gray text-sm space-y-2 list-decimal list-outside ml-4">
                            <li>Start face down on the floor resting on your forearms and knees.</li>
                            <li>Push off the floor, raising up off your knees onto your toes and resting mainly on your forearms.</li>
                            <li>Keep your back flat, forming a straight line from your head to your heels.</li>
                            <li>Engage your core and squeeze your glutes. Breathe steadily.</li>
                            <li>Hold this position for exactly 2 minutes.</li>
                        </ol>
                    </div>
                </div>
            </div>
        </Card>
    )
}
