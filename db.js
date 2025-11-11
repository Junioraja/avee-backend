// db.js
const { Pool } = require('pg');

// Ambil URL koneksi langsung dari environment variables Railway
// Nilainya adalah: postgresql://postgres:qUesJicTxKmhtgRhRjwbjFuwvNZQLiLg@postgres.railway.internal:5432/railway
const connectionString = process.env.DATABASE_URL;

// Siapkan konfigurasi koneksi
let dbConfig;

if (connectionString) {
    // Jika DATABASE_URL ada (lingkungan Railway/Production)
    dbConfig = {
        connectionString: connectionString,
        // Tambahkan konfigurasi SSL/TLS wajib untuk koneksi internal Railway/Cloud
        ssl: {
            rejectUnauthorized: false // Mengabaikan verifikasi sertifikat (seringkali diperlukan untuk internal PaaS)
        }
    };
} else {
    // Jika DATABASE_URL tidak ada (lingkungan lokal/testing)
    // Gunakan variabel terpisah dari .env lokal Anda (Fallback)
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
        console.error('Error connecting to the database:', err.stack);
    } else {
        console.log('Database connected successfully:', res.rows[0].now);
    }
});

// Mengekspor fungsi query agar route API dapat menggunakannya
module.exports = {
    query: (text, params) => pool.query(text, params),
    pool: pool,
};
