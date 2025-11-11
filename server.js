// server.js
require('dotenv').config(); 

const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const cors = require('cors');
const session = require('express-session'); // Diperlukan untuk sesi Passport


const allowedOrigins = [
    'https://avee-backend-production-69b5.up.railway.app', // Domain Railway sendiri
    'https://aveepremiumstore.vercel.app', // Ganti dengan domain Vercel Anda
    'http://localhost:8080', // Untuk development lokal frontend
];

// --- 1. Konfigurasi CORS (Paling Awal) ---
// Gunakan library 'cors' untuk penanganan CORS yang andal.
const corsOptions = {
    // Izinkan Live Server dan Localhost
    origin: '*', 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, // Penting untuk sesi/cookie Passport
    optionsSuccessStatus: 204
};
app.use(cors(corsOptions)); // DAFTARKAN CORS HANYA SEKALI

// --- 2. MIDDLEWARE UTAMA ---
// Express JSON harus di awal untuk membaca request body
app.use(express.json()); // HAPUS DUPLIKASI INI

// --- 3. Konfigurasi Autentikasi (Passport/Session) ---
const passport = require('./auth'); // Impor konfigurasi Passport
app.use(session({
    secret: process.env.JWT_SECRET, 
    resave: false,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

// --- 4. IMPOR DAN DAFTARKAN ROUTES ---

// Endpoint Test Sederhana
app.get('/', (req, res) => {
    res.status(200).json({ message: 'Avee Backend API running.' });
});

// 🎯 Impor Routes API
const productRoutes = require('./routes/productRoutes');
const userRoutes = require('./routes/userRoutes');
const orderRoutes = require('./routes/orderRoutes');
// Tambahkan route order jika sudah dibuat
// const orderRoutes = require('./routes/orderRoutes'); 

// 🎯 Daftarkan Routes
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
// app.use('/api/orders', orderRoutes); // Uncomment jika sudah ada

// --- SERVER START ---
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);

});

