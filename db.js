// db.js
const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL;

let dbConfig;

// KOREKSI UTAMA: Cek jika connectionString ada sebelum menggunakannya
if (connectionString) {
    dbConfig = {
        connectionString: connectionString,
        ssl: {
            rejectUnauthorized: false
        }
    };
} else {
    // Jika tidak ada DATABASE_URL (misalnya, di lokal atau testing)
    // Ini akan mencegah crash jika variabel tidak terdefinisi
    console.warn("DATABASE_URL is not set. Using fallback variables (DB_USER, DB_HOST, etc.)");
    dbConfig = {
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        database: process.env.DB_DATABASE,
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT,
    };
}

const pool = new Pool(dbConfig);

// ... (sisa kode test koneksi, module.exports)

// Mengekspor fungsi query dan pool
module.exports = {
    query: (text, params) => pool.query(text, params),
    pool: pool,
};

