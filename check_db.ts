import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runReset() {
    const sql = fs.readFileSync('/Users/nihalkhan/.gemini/antigravity/brain/970f10f1-f4be-449d-92b5-c42c77a29eb0/reset_db.sql', 'utf8');

    // Note: The Supabase JS Client does not have an execute() function for arbitrary SQL, 
    // so we'll fetch the records directly to see if the table exists, confirming the user didn't run the script.
    const { data, error } = await supabase.from('users').select('*').limit(1);
    if (error) {
        console.log('Error fetching users (Table likely does not exist):', error.message);
    } else {
        console.log('Users table exists! Row count:', data.length);
    }

    const { data: cData, error: cErr } = await supabase.from('checkins').select('*').limit(1);
    if (cErr) {
        console.log('Error fetching checkins (Table likely does not exist):', cErr.message);
    } else {
        console.log('Checkins table exists! Row count:', cData.length);
    }
}

runReset();
