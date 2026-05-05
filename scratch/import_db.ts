import pg from 'pg';
import fs from 'fs';
import path from 'path';

const { Client } = pg;

async function run() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('DATABASE_URL is required');
    process.exit(1);
  }

  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('Connecting to database...');
    await client.connect();
    console.log('Connected!');

    const sqlPath = path.resolve('backups/vera-db-clean.sql');
    console.log(`Reading backup file: ${sqlPath}`);
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('Executing SQL (this might take a while)...');
    // Separamos por punto y coma para ejecutar bloques, pero el dump de pg_dump 
    // a veces tiene bloques complejos. Intentaremos ejecutarlo todo junto primero.
    await client.query(sql);

    console.log('✅ Import completed successfully!');
  } catch (err) {
    console.error('❌ Error during import:', err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

run();
