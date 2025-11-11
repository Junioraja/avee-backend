// db.js
const { Pool } = require('pg');

// Ambil URL koneksi lengkap yang disediakan oleh Railway (atau Cloud Provider lain)
const connectionString = process.env.DATABASE_URL;

// --- KONFIGURASI KONEKSI ---
let dbConfig;

if (connectionString) {
    // 1. Lingkungan Cloud (Railway/Production)
    // Menggunakan URL lengkap dan menambahkan konfigurasi SSL yang diperlukan.
    // Ini adalah prioritas utama.
    dbConfig = {
        connectionString: connectionString,
        // Konfigurasi SSL/TLS wajib untuk koneksi Cloud:
        ssl: {
            rejectUnauthorized: false // Mengabaikan verifikasi sertifikat (seringkali diperlukan untuk internal PaaS)
        }
    };
} else {
    // 2. Fallback untuk Development Lokal (Jika DATABASE_URL tidak ada)
    // Menggunakan variabel terpisah dari file .env lokal
    console.warn("DATABASE_URL is not set. Using fallback variables from .env.");
    dbConfig = {
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        database: process.env.DB_DATABASE,
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT,
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
