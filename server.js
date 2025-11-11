// server.js
require('dotenv').config(); 

const express = require('express');
const app = express();
// Menggunakan port dari Environment Variables Railway
const port = process.env.PORT || 3000; 
const cors = require('cors');
const session = require('express-session'); 
// Import Auth/Passport (Wajib untuk Google Login)
const passport = require('./auth'); 

// --- 1. KONFIGURASI CORS (Untuk Vercel Frontend) ---
// Izinkan domain Vercel Anda dan domain Railway Anda
const allowedOrigins = [
    // Tambahkan domain Vercel yang sudah diconfig Anda (Contoh: https://aveepremiumstore.vercel.app)
    'https://aveepremiumstore.vercel.app', 
    
    // Domain Publik API Railway Anda
    'https://avee-backend-production-69b5.up.railway.app', 

    // Domain Pengembangan Lokal
    'http://localhost:8080', 
    'http://localhost:3000', 
    'http://127.0.0.1:5500' 
];

const corsOptions = {
    origin: allowedOrigins,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    optionsSuccessStatus: 204
};
app.use(cors(corsOptions));

// --- 2. MIDDLEWARE UTAMA ---
app.use(express.json()); 

// --- 3. KONFIGURASI AUTENTIKASI (Passport/Session) ---
// Warning: connect.session().MemoryStore should ONLY be used for development/small testing.
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
// PASTIKAN FILE-FILE INI ADA DI FOLDER ./routes/
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

