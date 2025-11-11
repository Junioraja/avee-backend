// server.js
require('dotenv').config();
const express = require('express');
const session = require('express-session');
const cors = require('cors');
const passport = require('./auth');

const app = express();

// Gunakan port dari Railway
const port = process.env.PORT || 3000;

// ====== CORS CONFIGURATION ======
const allowedOrigins = [
  'https://aveepremiumstore.vercel.app',          // frontend di Vercel
  'https://avee-backend-production-69b5.up.railway.app', // backend Railway
  'http://localhost:3000',                        // lokal dev (React)
  'http://127.0.0.1:5500'                         // lokal testing (HTML)
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS blocked for origin: ' + origin));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

// ====== MIDDLEWARE ======
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session setup (gunakan JWT_SECRET dari .env)
app.use(session({
  secret: process.env.JWT_SECRET || 'default_secret',
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: false, // ubah ke true kalau pakai HTTPS penuh
    maxAge: 1000 * 60 * 60 * 24 // 1 hari
  }
}));

// Passport (kalau kamu pakai login system)
app.use(passport.initialize());
app.use(passport.session());

// ====== DEBUG LOGGING (opsional) ======
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} - Origin: ${req.headers.origin}`);
  next();
});

// ====== ROUTES ======
app.get('/', (req, res) => {
  res.status(200).json({ message: 'Avee Backend API running ✅' });
});

const productRoutes = require('./routes/productRoutes');
const userRoutes = require('./routes/userRoutes');
const orderRoutes = require('./routes/orderRoutes');

app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);

// ====== ERROR HANDLING ======
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  res.status(500).json({ error: err.message });
});

// ====== SERVER START ======
app.listen(port, () => {
  console.log(`✅ Server running on port ${port}`);
});
