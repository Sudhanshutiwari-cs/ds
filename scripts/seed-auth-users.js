const { Client } = require('pg')

const usersToSeed = [
  {
    id: 'a0000000-0000-0000-0000-000000000001',
    email: 'admin@dssoftwares.dev',
    password: 'AdminPassword2026!',
    fullName: 'Chief Systems Administrator',
    role: 'super_admin'
  },
  {
    id: 'a0000000-0000-0000-0000-000000000002',
    email: 'manager@dssoftwares.dev',
    password: 'ManagerPass2026!',
    fullName: 'Engineering Operations Manager',
    role: 'manager'
  },
  {
    id: 'a0000000-0000-0000-0000-000000000003',
    email: 'lead@dssoftwares.dev',
    password: 'TechLeadPass2026!',
    fullName: 'Dev Lead & Mentor',
    role: 'team_leader'
  },
  {
    id: '11111111-1111-4111-a111-111111111111',
    email: 'aarav.sharma@dssoftwares.dev',
    password: 'InternAarav2026!',
    fullName: 'Aarav Sharma',
    role: 'individual'
  },
  {
    id: '22222222-2222-4222-a222-222222222222',
    email: 'priya.patel@dssoftwares.dev',
    password: 'InternPriya2026!',
    fullName: 'Priya Patel',
    role: 'individual'
  },
  {
    id: '33333333-3333-4333-a333-333333333333',
    email: 'rohan.verma@dssoftwares.dev',
    password: 'InternRohan2026!',
    fullName: 'Rohan Verma',
    role: 'individual'
  }
]

async function seedAuthUsers() {
  const client = new Client({
    connectionString: 'postgresql://postgres:UCShl5WCZXEIau5J@db.uchjkqragyvtoriflmjp.supabase.co:5432/postgres',
    ssl: { rejectUnauthorized: false }
  })
  await client.connect()
  console.log('Connected to Supabase Postgres...')

  for (const u of usersToSeed) {
    // 1. Delete if exists
    await client.query(`DELETE FROM auth.identities WHERE user_id = $1::uuid;`, [u.id])
    await client.query(`DELETE FROM auth.users WHERE id = $1::uuid;`, [u.id])
    await client.query(`DELETE FROM public.user_roles WHERE user_id = $1::uuid;`, [u.id])

    // 2. Insert into auth.users
    const insertUserSql = `
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
        $6
      );
    `
    await client.query(insertUserSql, [
      u.id,
      u.email,
      u.password,
      u.fullName,
      u.role,
      u.role === 'super_admin'
    ])

    // 3. Insert into auth.identities
    const insertIdentitySql = `
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
    `
    await client.query(insertIdentitySql, [u.id, u.email])

    // 4. Insert into public.user_roles
    await client.query(`
      INSERT INTO public.user_roles (user_id, role, created_at)
      VALUES ($1::uuid, $2::public.app_role, NOW());
    `, [u.id, u.role])

    console.log(`✓ Seeded user: ${u.email} (${u.role}) -> Password: ${u.password}`)
  }

  // Check auth.users count
  const count = await client.query('SELECT count(*) FROM auth.users;')
  console.log(`Total auth.users: ${count.rows[0].count}`)

  const rolesCount = await client.query('SELECT user_id, role FROM public.user_roles;')
  console.log('Total user_roles:', rolesCount.rows)

  await client.end()
}

seedAuthUsers().catch(console.error)
