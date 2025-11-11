// db.js
const { Pool } = require('pg');

// Ambil URL koneksi lengkap yang disediakan oleh Railway
const connectionString = process.env.DATABASE_URL;

// --- KONFIGURASI KONEKSI ---
let dbConfig;

if (connectionString) {
    // Lingkungan Railway/Production: Menggunakan URL lengkap
    // Ini menyelesaikan masalah ENOTFOUND karena mengambil host yang benar dari Railway
    dbConfig = {
        connectionString: connectionString,
        // Tambahkan konfigurasi SSL/TLS wajib untuk koneksi cloud
        ssl: {
            rejectUnauthorized: false // Mengabaikan verifikasi sertifikat (seringkali diperlukan untuk internal PaaS)
        }
    };
} else {
    // Fallback untuk development lokal (ketika menjalankan 'npm run dev')
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
        // Log error di sini jika koneksi gagal
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
