// db.js
const { Pool } = require('pg');

// Ambil URL koneksi lengkap yang disediakan oleh Railway
const connectionString = process.env.DATABASE_URL;

// --- KONFIGURASI KONEKSI ---
let dbConfig;

if (connectionString) {
    // 1. Lingkungan Cloud (Railway/Production)
    // Menggunakan URL lengkap yang di-set di Environment Variables
    dbConfig = {
        connectionString: connectionString,
        // Batasi ukuran pool agar tidak terjadi resource exhaustion di Free Tier
        max: 5, 
        // Konfigurasi SSL/TLS wajib untuk koneksi Cloud yang stabil
        ssl: {
            rejectUnauthorized: false // Mengabaikan verifikasi sertifikat (seringkali diperlukan untuk internal PaaS)
        }
    };
} else {
    // 2. Fallback untuk Development Lokal (ketika menjalankan 'npm run dev')
    console.warn("DATABASE_URL is not set. Using fallback variables from .env.");
    dbConfig = {
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        database: process.env.DB_DATABASE,
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT,
        max: 5, // Batasi juga untuk development
    };
}

const pool = new Pool(dbConfig);


// Test koneksi saat modul dimuat
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        // Log error jika koneksi gagal
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
