const { Client } = require('pg')
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://uchjkqragyvtoriflmjp.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVjaGprcXJhZ3l2dG9yaWZsbWpwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQxMzc3MTAsImV4cCI6MjEwOTcxMzcxMH0.nu_jiYfH3Z-tTtdLvGMf9aXauMxF2SU049MAzKTeHbM'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function main() {
  const client = new Client({
    connectionString: 'postgresql://postgres:UCShl5WCZXEIau5J@db.uchjkqragyvtoriflmjp.supabase.co:5432/postgres',
    ssl: { rejectUnauthorized: false }
  })
  await client.connect()
  await client.query(`UPDATE auth.users SET email_confirmed_at = NOW() WHERE email = 'admin@dssoftwares.com';`)
  await client.end()

  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'admin@dssoftwares.com',
    password: 'AdminPassword2026!'
  })
  if (error) {
    console.error('Sign-in error:', error.message)
  } else {
    console.log('✅ SIGN-IN SUCCESSFUL! Logged in as:', data.user?.email, 'ID:', data.user?.id)
  }
}

main().catch(console.error)
