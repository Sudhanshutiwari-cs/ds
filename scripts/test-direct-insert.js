const { Client } = require('pg')
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://uchjkqragyvtoriflmjp.supabase.co'
const supabaseAnonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVjaGprcXJhZ3l2dG9yaWZsbWpwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQxMzc3MTAsImV4cCI6MjEwOTcxMzcxMH0.nu_jiYfH3Z-tTtdLvGMf9aXauMxF2SU049MAzKTeHbM'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function main() {
  const pgClient = new Client({
    connectionString:
      'postgresql://postgres:UCShl5WCZXEIau5J@db.uchjkqragyvtoriflmjp.supabase.co:5432/postgres',
    ssl: { rejectUnauthorized: false }
  })
  await pgClient.connect()

  const userId = 'a0000000-0000-0000-0000-000000000001'
  const email = 'admin@dssoftwares.com'
  const password = 'AdminPass2026!'

  await pgClient.query(`DELETE FROM auth.identities WHERE user_id = $1::uuid OR identity_data->>'email' = $2;`, [userId, email])
  await pgClient.query(`DELETE FROM auth.users WHERE id = $1::uuid OR email = $2;`, [userId, email])

  await pgClient.query(`
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
      recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      $1::uuid,
      'authenticated',
      'authenticated',
      $2,
      extensions.crypt($3, extensions.gen_salt('bf')),
      NOW(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"full_name":"Chief Systems Administrator","role":"super_admin"}'::jsonb,
      NOW(),
      NOW(),
      '',
      '',
      '',
      ''
    );
  `, [userId, email, password])

  await pgClient.query(`
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
  `, [userId, email])

  console.log('Inserted admin user directly into Postgres.')

  await pgClient.end()

  // Test sign in
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  if (error) {
    console.error('Sign-in error:', error.message)
  } else {
    console.log('🎉 DIRECT INSERT SIGN-IN SUCCESS! User ID:', data.user.id, 'Email:', data.user.email)
  }
}

main().catch(console.error)
