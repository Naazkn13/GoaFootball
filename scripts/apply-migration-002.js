const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
    console.log('🔄 Connecting to Supabase...');

    const sqlString = fs.readFileSync(path.join(__dirname, '../migrations/002_add_clubs.sql'), 'utf8');

    try {
        const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`
            },
            body: JSON.stringify({
                query: sqlString
            })
        });

        if (!response.ok) {
            const err = await response.text();
            console.error('API Error:', err);
        } else {
            console.log('✅ Migration 002 applied successfully via exec_sql');
        }
    } catch (err) {
        console.error('Fetch Error:', err);
    }
}

runMigration();
