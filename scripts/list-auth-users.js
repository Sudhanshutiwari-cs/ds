const { Client } = require('pg')

async function main() {
  const pgClient = new Client({
    connectionString:
      'postgresql://postgres:UCShl5WCZXEIau5J@db.uchjkqragyvtoriflmjp.supabase.co:5432/postgres',
    ssl: { rejectUnauthorized: false }
  })
  await pgClient.connect()
  const users = await pgClient.query('SELECT id, email, created_at FROM auth.users;')
  console.log('Current auth.users:', users.rows)
  await pgClient.end()
}

main().catch(console.error)
