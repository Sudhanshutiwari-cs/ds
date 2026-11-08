const { Client } = require('pg')

async function main() {
  const client = new Client({
    connectionString: 'postgresql://postgres:UCShl5WCZXEIau5J@db.uchjkqragyvtoriflmjp.supabase.co:5432/postgres',
    ssl: { rejectUnauthorized: false }
  })
  await client.connect()
  const res = await client.query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_schema = 'auth' AND table_name = 'identities'
    ORDER BY ordinal_position;
  `)
  console.log('auth.identities columns:', res.rows)
  await client.end()
}

main().catch(console.error)
