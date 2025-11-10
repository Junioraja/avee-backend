// db.js
const { Pool } = require('pg');

// Menggunakan variabel dari file .env (yang dimuat oleh server.js)
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

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