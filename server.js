// server.js
require('dotenv').config(); 

const express = require('express');
const app = express();
// Menggunakan port dari Environment Variables Railway
const port = process.env.PORT || 3000; 
const cors = require('cors');
const session = require('express-session'); 
const passport = require('./auth'); 

// --- 1. KONFIGURASI CORS (KRUSIAL UNTUK KONEKSI VERCEL) ---
// PASTIKAN HANYA ADA SATU DEFINISI CORS di file ini
const allowedOrigins = [
    // Domain Vercel Anda
    'https://aveepremiumstore.vercel.app', 
    // Domain Publik API Railway Anda
    'https://avee-backend-production-69b5.up.railway.app', 
    // Domain Pengembangan Lokal
    'http://localhost:8080', 
    'http://localhost:3000', 
    'http://127.0.0.1:5500' 
];

const corsOptions = {
    origin: '*', 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    optionsSuccessStatus: 204
};
app.use(cors(corsOptions));

// --- 2. MIDDLEWARE UTAMA ---
app.use(express.json()); 

// --- 3. KONFIGURASI AUTENTIKASI (Passport/Session) ---
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

// 🎯 Daftarkan Routes
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);


// --- SERVER START ---
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
