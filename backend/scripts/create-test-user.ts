import bcrypt from 'bcrypt';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function createTestUser() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'cosmic_drift'
  });

  try {
    // 生成密码哈希
    const passwordHash = await bcrypt.hash('test123', 10);

    // 插入测试用户
    await connection.execute(
      `INSERT INTO users (
        id, username, email, password_hash, role, created_at, last_active_at
      ) VALUES (?, ?, ?, ?, ?, NOW(), NOW())
      ON DUPLICATE KEY UPDATE username = VALUES(username)`,
      ['test-user-id', 'testuser', 'test@example.com', passwordHash, 'explorer']
    );

    console.log('✅ Test user created successfully!');
    console.log('   ID: test-user-id');
    console.log('   Username: testuser');
    console.log('   Email: test@example.com');
    console.log('   Password: test123');

  } catch (error) {
    console.error('❌ Error creating test user:', error);
  } finally {
    await connection.end();
  }
}

createTestUser();
