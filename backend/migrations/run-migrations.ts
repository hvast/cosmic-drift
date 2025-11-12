import fs from 'fs';
import path from 'path';
import pool from '../src/config/database';

const runMigrations = async () => {
  try {
    console.log('Starting database migrations...');

    const migrationsDir = __dirname;
    const files = fs
      .readdirSync(migrationsDir)
      .filter((file) => file.endsWith('.sql'))
      .sort();

    for (const file of files) {
      console.log(`Running migration: ${file}`);
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf8');

      // Split SQL by semicolons and execute each statement separately
      // This is needed for MySQL
      const statements = sql
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0);

      for (const statement of statements) {
        await pool.query(statement);
      }
      
      console.log(`✓ Migration ${file} completed`);
    }

    console.log('All migrations completed successfully');
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    await pool.end();
    process.exit(1);
  }
};

runMigrations();
