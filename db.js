// db.js
const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL;
let dbConfig;

if (connectionString) {
    // LINGKUNGAN RAILWAY (PRIORITAS UTAMA)
    dbConfig = {
        connectionString: connectionString,
        // Ini adalah KUNCI untuk mengatasi masalah koneksi di PaaS (SSL)
        ssl: {
            rejectUnauthorized: false 
        }
    };
} else {
    // FALLBACK LOKAL
    dbConfig = {
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        database: process.env.DB_DATABASE,
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT,
        // Tambahkan ini juga di lokal, karena kadang diperlukan
        // ssl: { rejectUnauthorized: false } 
    };
}

const pool = new Pool(dbConfig);

// Test koneksi saat modul dimuat
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        // Log error jika koneksi gagal (Ini yang muncul di Railway saat ECONNREFUSED)
        console.error('Error connecting to the database:', err.stack);
    } else {
        console.log('Database connected successfully:', res.rows[0].now);
    }
});

// Mengekspor fungsi query dan pool
module.exports = {
    query: (text, params) => pool.query(text, params),
    pool: pool,
};

