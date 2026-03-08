// Script to drop NOT NULL constraint on 'aadhaar' in 'users' table using Supabase API
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
    console.log('🔄 Connecting to Supabase for Migration...');

    try {
        // We must use REST execution since standard JS client can't run ALTER TABLE directly without RPC
        console.log('📋 Running ALTER TABLE users ALTER COLUMN aadhaar DROP NOT NULL...');

        // Attempting REST execution for raw SQL
        const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`
            },
            body: JSON.stringify({
                query: `ALTER TABLE users ALTER COLUMN aadhaar DROP NOT NULL;`
            })
        });

        const text = await response.text();

        if (response.ok) {
            console.log('✅ Migration successful: Aadhaar is now nullable.');
            console.log('Response:', text);
        } else {
            console.error('⚠️ Failed. Please paste this into Supabase SQL Editor manually:');
            console.error('ALTER TABLE users ALTER COLUMN aadhaar DROP NOT NULL;');
            console.error('Error Details:', text);
        }
    } catch (error) {
        console.error('❌ Error executing migration script:', error.message);
    }
}

runMigration();
