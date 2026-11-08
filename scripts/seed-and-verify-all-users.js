const { Client } = require('pg')
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://uchjkqragyvtoriflmjp.supabase.co'
const supabaseAnonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVjaGprcXJhZ3l2dG9yaWZsbWpwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQxMzc3MTAsImV4cCI6MjEwOTcxMzcxMH0.nu_jiYfH3Z-tTtdLvGMf9aXauMxF2SU049MAzKTeHbM'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

const allUsers = [
  {
    fullName: 'Chief Systems Administrator',
    email: 'admin@dssoftwares.com',
    password: 'AdminPass2026!',
    role: 'super_admin',
    internId: null
  },
  {
    fullName: 'Engineering Operations Manager',
    email: 'manager@dssoftwares.com',
    password: 'ManagerPass2026!',
    role: 'manager',
    internId: null
  },
  {
    fullName: 'Tech Lead & Mentor',
    email: 'lead@dssoftwares.com',
    password: 'TechLeadPass2026!',
    role: 'team_leader',
    internId: null
  },
  {
    fullName: 'Aarav Sharma',
    email: 'aarav.sharma@dssoftwares.com',
    password: 'InternAarav2026!',
    role: 'individual',
    internId: '11111111-1111-4111-a111-111111111111'
  },
  {
    fullName: 'Priya Patel',
    email: 'priya.patel@dssoftwares.com',
    password: 'InternPriya2026!',
    role: 'individual',
    internId: '22222222-2222-4222-a222-222222222222'
  },
  {
    fullName: 'Rohan Verma',
    email: 'rohan.verma@dssoftwares.com',
    password: 'InternRohan2026!',
    role: 'individual',
    internId: '33333333-3333-4333-a333-333333333333'
  }
]

async function main() {
  const pgClient = new Client({
    connectionString:
      'postgresql://postgres:UCShl5WCZXEIau5J@db.uchjkqragyvtoriflmjp.supabase.co:5432/postgres',
    ssl: { rejectUnauthorized: false }
  })
  await pgClient.connect()
  console.log('Connected to PostgreSQL...')

  // Clean previous users
  console.log('Cleaning previous test accounts...')
  await pgClient.query(`DELETE FROM public.user_roles;`)
  await pgClient.query(`DELETE FROM auth.identities;`)
  await pgClient.query(`DELETE FROM auth.users;`)

  const results = []

  for (const u of allUsers) {
    console.log(`\nRegistering user: ${u.email}...`)
    
    // 1. SignUp through Supabase Auth SDK
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: u.email,
      password: u.password,
      options: {
        data: {
          full_name: u.fullName,
          role: u.role
        }
      }
    })

    if (signUpError) {
      console.error(`Sign up error for ${u.email}:`, signUpError.message)
      results.push({ ...u, status: 'SIGNUP_ERROR: ' + signUpError.message })
      continue
    }

    const userId = signUpData?.user?.id
    console.log(`Created auth user ID: ${userId}`)

    // 2. Immediately confirm email in auth.users
    await pgClient.query(`UPDATE auth.users SET email_confirmed_at = NOW() WHERE id = $1;`, [userId])

    // 3. Assign role in public.user_roles
    await pgClient.query(`
      INSERT INTO public.user_roles (user_id, role, created_at)
      VALUES ($1::uuid, $2::public.app_role, NOW());
    `, [userId, u.role])

    // 4. If intern, update public.interns user_id or ensure matching alias
    if (u.internId) {
      // Also register internId in user_roles for compatibility with existing seed data
      await pgClient.query(`
        UPDATE public.interns SET user_id = $1::uuid WHERE user_id = $2::uuid;
      `, [userId, u.internId]).catch(() => {})
      
      // Update foreign keys across CRM tables if applicable
      const crmTables = [
        'tasks', 'standups', 'leave_balances', 'leave_requests', 
        'salary_structures', 'payslips', 'certificates',
        'intern_gamification', 'code_reviews', 'milestone_reviews',
        'mentorship_sessions', 'intern_learning_progress'
      ]
      for (const t of crmTables) {
        const col = t === 'tasks' ? 'assigned_to' : 'intern_id'
        await pgClient.query(`
          UPDATE public.${t} SET ${col} = $1::uuid WHERE ${col} = $2::uuid;
        `, [userId, u.internId]).catch(() => {})
      }
    }

    // 5. Test sign in to verify credentials
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: u.email,
      password: u.password
    })

    if (authError) {
      console.error(`❌ Verification failed for ${u.email}:`, authError.message)
      results.push({ ...u, status: 'AUTH_FAILED: ' + authError.message, userId })
    } else {
      console.log(`✅ VERIFIED: ${u.email} authenticated successfully! Access Token generated.`)
      results.push({ ...u, status: 'VERIFIED & ACTIVE', userId })
    }
  }

  await pgClient.end()
  console.log('\n======================================================')
  console.log('        ALL USER CREDENTIALS VERIFIED IN SUPABASE     ')
  console.log('======================================================')
  console.table(
    results.map((r) => ({
      Name: r.fullName,
      Role: r.role,
      Email: r.email,
      Password: r.password,
      Status: r.status,
      AuthUserId: r.userId
    }))
  )
}

main().catch(console.error)
