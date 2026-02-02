
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

// If env vars are missing, we enable mock mode
export const isMock = !process.env.NEXT_PUBLIC_SUPABASE_URL;

if (isMock) {
    console.warn('Missing Supabase environment variables. App running in DEMO MODE.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);
