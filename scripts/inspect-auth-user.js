const { Client } = require('pg')

async function main() {
  const pgClient = new Client({
    connectionString:
      'postgresql://postgres:UCShl5WCZXEIau5J@db.uchjkqragyvtoriflmjp.supabase.co:5432/postgres',
    ssl: { rejectUnauthorized: false }
  })
  await pgClient.connect()
  const res = await pgClient.query(`
    SELECT * FROM auth.users LIMIT 1;
  `)
  if (res.rows.length > 0) {
    console.log('Sample auth.user row:', res.rows[0])
  } else {
    console.log('auth.users is empty')
  }
  await pgClient.end()
}

main().catch(console.error)
