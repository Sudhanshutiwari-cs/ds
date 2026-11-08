const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://uchjkqragyvtoriflmjp.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVjaGprcXJhZ3l2dG9yaWZsbWpwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQxMzc3MTAsImV4cCI6MjEwOTcxMzcxMH0.nu_jiYfH3Z-tTtdLvGMf9aXauMxF2SU049MAzKTeHbM'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testSignUp() {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'admin@dssoftwares.com',
    password: 'AdminPassword2026!'
  })
  if (error) {
    console.error('SignIn Error:', error)
  } else {
    console.log('SignIn SUCCESS! User ID:', data.user?.id, 'Email:', data.user?.email)
  }
}

testSignUp().catch(console.error)
