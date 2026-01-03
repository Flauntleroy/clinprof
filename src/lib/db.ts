import mysql from 'mysql2/promise';

// Database connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  database: process.env.DB_NAME || 'makula_bahalap',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Execute query with proper typing
export async function query<T>(
  sql: string,
  params?: (string | number | boolean | null | undefined)[]
): Promise<T[]> {
  const [rows] = await pool.execute(sql, params);
  return rows as T[];
}

// Execute single query and return first result
export async function queryOne<T>(
  sql: string,
  params?: (string | number | boolean | null | undefined)[]
): Promise<T | null> {
  const rows = await query<T>(sql, params);
  return rows[0] || null;
}

// Execute insert/update/delete and return affected rows
export async function execute(
  sql: string,
  params?: (string | number | boolean | null | undefined)[]
): Promise<{ affectedRows: number; insertId: number }> {
  const [result] = await pool.execute(sql, params);
  const resultSet = result as mysql.ResultSetHeader;
  return {
    affectedRows: resultSet.affectedRows,
    insertId: resultSet.insertId,
  };
}

// Test database connection
export async function testConnection(): Promise<boolean> {
  try {
    const connection = await pool.getConnection();
    connection.release();
    return true;
  } catch {
    return false;
  }
}

export default pool;
