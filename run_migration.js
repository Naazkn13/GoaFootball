const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function run() {
  const sql = fs.readFileSync('migrations/007_payment_update.sql', 'utf8');
  console.log('Running SQL...');
  const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`
    },
    body: JSON.stringify({ query: sql })
  });
  
  if (!response.ok) {
    const err = await response.text();
    console.error('Error:', err);
  } else {
    console.log('Success!', await response.text());
  }
}
run();
