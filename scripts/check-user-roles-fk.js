const { Client } = require('pg')

async function main() {
  const pgClient = new Client({
    connectionString:
      'postgresql://postgres:UCShl5WCZXEIau5J@db.uchjkqragyvtoriflmjp.supabase.co:5432/postgres',
    ssl: { rejectUnauthorized: false }
  })
  await pgClient.connect()
  const res = await pgClient.query(`
    SELECT
      tc.constraint_name, 
      kcu.column_name, 
      ccu.table_schema AS foreign_table_schema,
      ccu.table_name AS foreign_table_name,
      ccu.column_name AS foreign_column_name 
    FROM information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
    WHERE tc.table_name = 'user_roles';
  `)
  console.log('user_roles constraints:', res.rows)

  // Also check if public.users exists
  const pubUsers = await pgClient.query(`
    SELECT column_name, data_type FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users';
  `)
  console.log('public.users columns:', pubUsers.rows)

  await pgClient.end()
}

main().catch(console.error)
