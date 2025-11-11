// server.js
require('dotenv').config(); 

const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const cors = require('cors');
const session = require('express-session'); 
// Impor ini diperlukan untuk Auth Google/Passport
const passport = require('./auth'); 

// --- KONFIGURASI CORS (KRUSIAL UNTUK KONEKSI VERCEL) ---
// Izinkan domain Vercel Anda dan domain Railway Anda (serta localhost untuk development)
const allowedOrigins = [
    'https://aveepremiumstore.vercel.app', 
    'https://avee-backend-production.up.railway.app', 
    'http://localhost:8080', 
    'http://localhost:3000', 
    'http://127.0.0.1:5500' 
];

const corsOptions = {
    origin: allowedOrigins,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, // Penting untuk sesi dan cookie
    optionsSuccessStatus: 204
};
app.use(cors(corsOptions)); // Terapkan CORS

// --- MIDDLEWARE UTAMA ---
app.use(express.json()); 

// --- KONFIGURASI AUTENTIKASI (Passport/Session) ---
// Warning: connect.session().MemoryStore should ONLY be used for development/small testing.
// Ini yang memicu Warning di log, tapi tidak menyebabkan crash.
app.use(session({
    secret: process.env.JWT_SECRET, 
    resave: false,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

// --- IMPOR DAN DAFTARKAN ROUTES ---

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
