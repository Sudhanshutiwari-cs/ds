const { Client } = require('pg')

async function main() {
  const pgClient = new Client({
    connectionString:
      'postgresql://postgres:UCShl5WCZXEIau5J@db.uchjkqragyvtoriflmjp.supabase.co:5432/postgres',
    ssl: { rejectUnauthorized: false }
  })
  await pgClient.connect()
  const res = await pgClient.query(`
    SELECT routine_schema, routine_name 
    FROM information_schema.routines 
    WHERE routine_name = 'crypt';
  `)
  console.log('crypt function:', res.rows)
  await pgClient.end()
}

main().catch(console.error)
