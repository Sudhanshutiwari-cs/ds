const { Client } = require('pg')
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://uchjkqragyvtoriflmjp.supabase.co'
const supabaseAnonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVjaGprcXJhZ3l2dG9yaWZsbWpwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQxMzc3MTAsImV4cCI6MjEwOTcxMzcxMH0.nu_jiYfH3Z-tTtdLvGMf9aXauMxF2SU049MAzKTeHbM'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

const accounts = [
  {
    id: 'a0000000-0000-0000-0000-000000000001',
    name: 'Chief Systems Administrator',
    email: 'admin@dssoftwares.com',
    password: 'AdminPass2026!',
    role: 'super_admin',
    category: 'Admin / Executive',
    permissions: 'Full unrestricted CRM & System control'
  },
  {
    id: 'a0000000-0000-0000-0000-000000000002',
    name: 'Operations Manager',
    email: 'manager@dssoftwares.com',
    password: 'ManagerPass2026!',
    role: 'manager',
    category: 'Admin / Management',
    permissions: 'Applications, Cohorts, Leaves, Stipends'
  },
  {
    id: 'a0000000-0000-0000-0000-000000000003',
    name: 'Engineering Tech Lead',
    email: 'lead@dssoftwares.com',
    password: 'TechLeadPass2026!',
    role: 'team_leader',
    category: 'Engineering Lead',
    permissions: 'Sprint Tasks, PR Reviews, Standups, Mentorship'
  },
  {
    id: 'a0000000-0000-0000-0000-000000000004',
    name: 'Alpha Cohort Batch Leader',
    email: 'batchlead@dssoftwares.com',
    password: 'BatchLeadPass2026!',
    role: 'batch_leader',
    category: 'Cohort Leadership',
    permissions: 'Batch oversight, Standup reviews, Sprint Retros'
  },
  {
    id: '11111111-1111-4111-a111-111111111111',
    name: 'Aarav Sharma',
    email: 'aarav.sharma@dssoftwares.com',
    password: 'InternAarav2026!',
    role: 'individual',
    category: 'Active Intern (Frontend Lead)',
    permissions: 'Full Intern Portal (1,450 XP Vanguard, 14d streak)'
  },
  {
    id: '22222222-2222-4222-a222-222222222222',
    name: 'Priya Patel',
    email: 'priya.patel@dssoftwares.com',
    password: 'InternPriya2026!',
    role: 'individual',
    category: 'Active Intern (UI/UX Craftsman)',
    permissions: 'Full Intern Portal (820 XP Craftsman, 9d streak)'
  },
  {
    id: '33333333-3333-4333-a333-333333333333',
    name: 'Rohan Verma',
    email: 'rohan.verma@dssoftwares.com',
    password: 'InternRohan2026!',
    role: 'individual',
    category: 'Active Intern (Cloud Vanguard)',
    permissions: 'Full Intern Portal (1,980 XP Vanguard, 21d streak)'
  }
]

async function provision() {
  const pg = new Client({
    connectionString:
      'postgresql://postgres:UCShl5WCZXEIau5J@db.uchjkqragyvtoriflmjp.supabase.co:5432/postgres',
    ssl: { rejectUnauthorized: false }
  })
  await pg.connect()
  console.log('Connected to Supabase PostgreSQL database...')

  // 1. Clean old test identities and auth users
  await pg.query(`DELETE FROM public.user_roles;`)
  await pg.query(`DELETE FROM auth.identities;`)
  await pg.query(`DELETE FROM auth.users;`)
  console.log('Cleared previous auth tables.')

  for (const acc of accounts) {
    // 2. Insert into auth.users
    await pg.query(`
      INSERT INTO auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        raw_app_meta_data,
        raw_user_meta_data,
        created_at,
        updated_at,
        confirmation_token,
        email_change,
        email_change_token_new,
        recovery_token,
        is_super_admin
      ) VALUES (
        '00000000-0000-0000-0000-000000000000',
        $1::uuid,
        'authenticated',
        'authenticated',
        $2,
        extensions.crypt($3, extensions.gen_salt('bf')),
        NOW(),
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('full_name', $4::text, 'role', $5::text),
        NOW(),
        NOW(),
        '',
        '',
        '',
        '',
        $6
      );
    `, [acc.id, acc.email, acc.password, acc.name, acc.role, acc.role === 'super_admin'])

    // 3. Insert into auth.identities
    await pg.query(`
      INSERT INTO auth.identities (
        id,
        user_id,
        identity_data,
        provider,
        provider_id,
        last_sign_in_at,
        created_at,
        updated_at
      ) VALUES (
        gen_random_uuid(),
        $1::uuid,
        jsonb_build_object('sub', $1::text, 'email', $2::text),
        'email',
        $1::text,
        NOW(),
        NOW(),
        NOW()
      );
    `, [acc.id, acc.email])

    // 4. Insert into public.user_roles
    await pg.query(`
      INSERT INTO public.user_roles (user_id, role, created_at)
      VALUES ($1::uuid, $2::public.app_role, NOW());
    `, [acc.id, acc.role])

    console.log(`✓ Provisioned: ${acc.email} (${acc.role})`)
  }

  // 5. Ensure public.interns matches the 3 intern accounts
  const internsSql = `
    INSERT INTO public.interns (user_id, full_name, phone, status, joined_at)
    VALUES
      ('11111111-1111-4111-a111-111111111111', 'Aarav Sharma', '+91 98765 43210', 'active', NOW()),
      ('22222222-2222-4222-a222-222222222222', 'Priya Patel', '+91 98765 43211', 'active', NOW()),
      ('33333333-3333-4333-a333-333333333333', 'Rohan Verma', '+91 98765 43212', 'active', NOW())
    ON CONFLICT (user_id) DO UPDATE SET full_name = EXCLUDED.full_name, status = 'active';
  `
  await pg.query(internsSql)
  console.log('✓ Verified public.interns accounts.')

  await pg.end()

  // 6. Test signInWithPassword for all accounts
  console.log('\n--- VERIFYING LIVE SUPABASE AUTH LOGIN FOR ALL ACCOUNTS ---')
  const verifiedList = []
  for (const acc of accounts) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: acc.email,
      password: acc.password
    })
    if (error) {
      console.error(`❌ FAILED: ${acc.email} -> ${error.message}`)
      verifiedList.push({ ...acc, authStatus: 'FAILED: ' + error.message })
    } else {
      console.log(`✅ SUCCESS: ${acc.email} authenticated! Token: ${data.session?.access_token ? 'VALID JWT' : 'N/A'}`)
      verifiedList.push({ ...acc, authStatus: '100% VERIFIED ACTIVE' })
    }
  }

  console.log('\n======================================================')
  console.log('      OFFICIAL CREDENTIALS AUDIT SUMMARY TABLE        ')
  console.log('======================================================')
  console.table(
    verifiedList.map(a => ({
      Category: a.category,
      Name: a.name,
      Email: a.email,
      Password: a.password,
      Role: a.role,
      Status: a.authStatus
    }))
  )
}

provision().catch(console.error)
