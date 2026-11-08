const { Client } = require('pg')

async function main() {
  const pgClient = new Client({
    connectionString:
      'postgresql://postgres:UCShl5WCZXEIau5J@db.uchjkqragyvtoriflmjp.supabase.co:5432/postgres',
    ssl: { rejectUnauthorized: false }
  })
  await pgClient.connect()
  const instances = await pgClient.query('SELECT * FROM auth.instances;')
  console.log('auth.instances:', instances.rows)
  await pgClient.end()
}

main().catch(console.error)
