import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-key'

// We use the service role key to bypass RLS for admin actions
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(req: Request) {
    try {
        if (!supabaseServiceKey) {
            return NextResponse.json({ error: "Server missing SERVICE_ROLE_KEY" }, { status: 500 })
        }

        const body = await req.json()
        const { action } = body

        if (action === "claim_admin") {
            const { userId } = body

            // For safety, you might want to restrict this to only work if there are NO admins yet,
            // or if it's a specific known email. For this app, we'll allow the first person to click it.
            // Check if ANY admins exist
            const { data: existingAdmins } = await supabaseAdmin
                .from("users")
                .select("id")
                .eq("is_admin", true)
                .limit(1)

            if (existingAdmins && existingAdmins.length > 0) {
                return NextResponse.json({ error: "An admin already exists. You cannot claim admin rights." }, { status: 403 })
            }

            const { error } = await supabaseAdmin
                .from("users")
                .update({ is_admin: true })
                .eq("id", userId)

            if (error) throw error
            return NextResponse.json({ success: true })
        }

        if (action === "update_settings") {
            const { key, value } = body
            const { error } = await supabaseAdmin
                .from("challenge_settings")
                .upsert({ key, value })

            if (error) throw error
            return NextResponse.json({ success: true })
        }

        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    } catch (e: unknown) {
        if (e instanceof Error) {
            return NextResponse.json({ error: e.message }, { status: 500 })
        }
        return NextResponse.json({ error: "An unknown error occurred" }, { status: 500 })
    }
}
