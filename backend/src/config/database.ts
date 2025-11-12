import dotenv from 'dotenv';
const mysql = require('mysql2/promise');

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  database: process.env.DB_NAME || 'cosmic_drift',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  waitForConnections: true,
  connectionLimit: 20,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});

// Test connection
pool.getConnection()
  .then((connection: any) => {
    console.log('✅ MySQL database connected successfully');
    connection.release();
  })
  .catch((err: any) => {
    console.error('❌ MySQL connection error:', err);
  });

export const query = async (text: string, params?: any[]) => {
  const start = Date.now();
  try {
    // Convert PostgreSQL-style $1, $2 to MySQL-style ?
    // Need to handle parameter order correctly
    let mysqlQuery = text;
    let mysqlParams = params || [];

    // Find all $n placeholders and sort by n
    const placeholders = Array.from(text.matchAll(/\$(\d+)/g));
    if (placeholders.length > 0) {
      // Create a map of parameter positions
      const paramMap = new Map<number, any>();
      placeholders.forEach((match) => {
        const paramIndex = parseInt(match[1]) - 1; // $1 = index 0
        if (params && params[paramIndex] !== undefined) {
          paramMap.set(paramIndex, params[paramIndex]);
        }
      });

      // Replace all $n with ? in order
      mysqlQuery = text.replace(/\$\d+/g, '?');

      // Reorder parameters to match the order they appear in the query
      mysqlParams = placeholders.map(match => {
        const paramIndex = parseInt(match[1]) - 1;
        return params ? params[paramIndex] : undefined;
      });
    }

    const [rows, fields] = await pool.query(mysqlQuery, mysqlParams);
    const duration = Date.now() - start;
    console.log('Executed query', { text: mysqlQuery, duration, rows: Array.isArray(rows) ? rows.length : 0 });
    return { rows, fields, rowCount: Array.isArray(rows) ? rows.length : 0 };
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

export const getClient = async () => {
  const connection = await pool.getConnection();

  const query = async (text: string, params?: any[]) => {
    let mysqlQuery = text;
    let mysqlParams = params || [];

    const placeholders = Array.from(text.matchAll(/\$(\d+)/g));
    if (placeholders.length > 0) {
      mysqlQuery = text.replace(/\$\d+/g, '?');
      mysqlParams = placeholders.map(match => {
        const paramIndex = parseInt(match[1]) - 1;
        return params ? params[paramIndex] : undefined;
      });
    }

    const [rows] = await connection.query(mysqlQuery, mysqlParams);
    return { rows, rowCount: Array.isArray(rows) ? rows.length : 0 };
  };

  const release = () => {
    connection.release();
  };

  return { query, release };
};

export default pool;
