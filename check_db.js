const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = 'https://ysdvmcpjidmarmteauqf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlzZHZtY3BqaWRtYXJtdGVhdXFmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjQ3NjkxNiwiZXhwIjoyMDg4MDUyOTE2fQ.eN7v_esdpaR9nvixQYEaojIb4xppGF1TBBszfr30lTk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function runReset() {
    console.log("Checking if users table exists...");
    const { data, error } = await supabase.from('users').select('id').limit(1);

    if (error) {
        console.log('Error fetching users (Table likely does not exist):', error.message);
        console.log('---');
        console.log('The database is empty! The reset_db script needs to be run in the SQL editor.');
    } else {
        console.log('Users table exists! The database appears to be initialized.');
    }
}

runReset();
