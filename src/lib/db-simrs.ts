import mysql from 'mysql2/promise';

// SIMRS Database connection pool (makula_sik)
const simrsPool = mysql.createPool({
    host: process.env.SIMRS_DB_HOST || process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.SIMRS_DB_PORT || process.env.DB_PORT || '3306'),
    database: process.env.SIMRS_DB_NAME || 'makula_sik',
    user: process.env.SIMRS_DB_USER || process.env.DB_USER || 'root',
    password: process.env.SIMRS_DB_PASSWORD || process.env.DB_PASSWORD || '',
    waitForConnections: true,
    connectionLimit: 5,
    queueLimit: 0,
});

// Execute query on SIMRS database
export async function querySimrs<T>(
    sql: string,
    params?: (string | number | boolean | null | undefined)[]
): Promise<T[]> {
    const [rows] = await simrsPool.execute(sql, params);
    return rows as T[];
}

// Execute single query and return first result
export async function queryOneSimrs<T>(
    sql: string,
    params?: (string | number | boolean | null | undefined)[]
): Promise<T | null> {
    const rows = await querySimrs<T>(sql, params);
    return rows[0] || null;
}

// Execute insert/update/delete on SIMRS database
export async function executeSimrs(
    sql: string,
    params?: (string | number | boolean | null | undefined)[]
): Promise<{ affectedRows: number; insertId: number }> {
    const [result] = await simrsPool.execute(sql, params);
    const resultSet = result as mysql.ResultSetHeader;
    return {
        affectedRows: resultSet.affectedRows,
        insertId: resultSet.insertId,
    };
}

// Test SIMRS database connection
export async function testSimrsConnection(): Promise<boolean> {
    try {
        const connection = await simrsPool.getConnection();
        connection.release();
        return true;
    } catch (error) {
        console.error('SIMRS DB connection failed:', error);
        return false;
    }
}

export default simrsPool;
