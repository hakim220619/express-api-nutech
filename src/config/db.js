const mysql = require('mysql2/promise');

require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
};

// Membuat koneksi pool
const pool = mysql.createPool(dbConfig);

// Cek koneksi database
async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('Database connection successful!');
        connection.release();
    } catch (error) {
        console.error('Database connection failed:', error.message);
    }
}

// Jalankan cek koneksi saat file di-load
testConnection();

module.exports = pool;
