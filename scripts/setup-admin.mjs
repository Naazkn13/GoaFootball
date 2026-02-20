// One-time admin setup script
// Run with: node scripts/setup-admin.mjs
// This sets knuzhat137@gmail.com as both admin AND super-admin

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env.local
config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const ADMIN_EMAIL = 'knuzhat137@gmail.com';

async function setupAdmin() {
    console.log(`🔧 Setting up admin: ${ADMIN_EMAIL}\n`);

    // Check if user exists
    const { data: user, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('email', ADMIN_EMAIL)
        .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('❌ Error fetching user:', fetchError);
        process.exit(1);
    }

    if (!user) {
        // Create user with admin flags
        console.log('→ User not found, creating...');
        const { data: newUser, error: createError } = await supabase
            .from('users')
            .insert([{
                email: ADMIN_EMAIL,
                name: 'Admin',
                phone: '',
                aadhaar: '',
                is_admin: true,
                is_super_admin: true,
                registration_completed: false,
                approval_status: 'approved',
            }])
            .select()
            .single();

        if (createError) {
            console.error('❌ Error creating user:', createError);
            process.exit(1);
        }

        console.log('✅ Admin user created:', newUser.email);
        console.log('   is_admin:', newUser.is_admin);
        console.log('   is_super_admin:', newUser.is_super_admin);
    } else {
        // Update existing user to admin + super admin
        console.log('→ User found, updating admin flags...');
        const { data: updatedUser, error: updateError } = await supabase
            .from('users')
            .update({
                is_admin: true,
                is_super_admin: true,
                updated_at: new Date().toISOString(),
            })
            .eq('id', user.id)
            .select()
            .single();

        if (updateError) {
            console.error('❌ Error updating user:', updateError);
            process.exit(1);
        }

        console.log('✅ Admin flags updated for:', updatedUser.email);
        console.log('   is_admin:', updatedUser.is_admin);
        console.log('   is_super_admin:', updatedUser.is_super_admin);
    }

    console.log('\n🎉 Done! Now login with this email and you should have admin access.');
    console.log('   IMPORTANT: After logging in, you MUST log out and log in again');
    console.log('   for the admin flags to take effect in the session cookie.\n');
}

setupAdmin().catch(console.error);
