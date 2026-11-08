const { Client } = require('pg')

async function main() {
  const client = new Client({
    connectionString: 'postgresql://postgres:UCShl5WCZXEIau5J@db.uchjkqragyvtoriflmjp.supabase.co:5432/postgres',
    ssl: { rejectUnauthorized: false }
  })
  await client.connect()
  const res = await client.query(`
    SELECT table_name FROM information_schema.tables WHERE table_schema = 'auth';
  `)
  console.log('auth tables:', res.rows.map(r => r.table_name))
  await client.end()
}

main().catch(console.error)
