import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function verifyTestUser() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'cosmic_drift'
  });

  try {
    const [rows] = await connection.execute(
      'SELECT id, username, email, role FROM users WHERE id = ?',
      ['test-user-id']
    );

    if (Array.isArray(rows) && rows.length > 0) {
      console.log('✅ Test user exists:');
      console.log(rows[0]);
    } else {
      console.log('❌ Test user not found');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await connection.end();
  }
}

verifyTestUser();
