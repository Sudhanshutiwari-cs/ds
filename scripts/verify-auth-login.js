const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://uchjkqragyvtoriflmjp.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVjaGprcXJhZ3l2dG9yaWZsbWpwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQxMzc3MTAsImV4cCI6MjEwOTcxMzcxMH0.nu_jiYfH3Z-tTtdLvGMf9aXauMxF2SU049MAzKTeHbM'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testLogin(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  if (error) {
    console.error(`❌ Login failed for ${email}:`, error.message)
    return false
  }
  console.log(`✓ Login SUCCESS for ${email}! User ID: ${data.user.id}, Role: ${data.user.user_metadata?.role || data.user.role}`)
  return true
}

async function run() {
  await testLogin('admin@dssoftwares.dev', 'AdminPassword2026!')
  await testLogin('manager@dssoftwares.dev', 'ManagerPass2026!')
  await testLogin('aarav.sharma@dssoftwares.dev', 'InternAarav2026!')
  await testLogin('rohan.verma@dssoftwares.dev', 'InternRohan2026!')
}

run().catch(console.error)
