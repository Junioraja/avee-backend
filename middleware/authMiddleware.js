// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

// 1. Middleware untuk verifikasi Token (Wajib Login)
const protect = (req, res, next) => {
    let token;

    // Cek header Authorization
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Ambil token dari header (format: Bearer <token>)
            token = req.headers.authorization.split(' ')[1];

            // Verifikasi token (menggunakan JWT_SECRET dari .env)
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Simpan info pengguna ke objek request
            req.user = decoded; 
            
            next();

        } catch (error) {
            console.error('Token Error:', error);
            res.status(401).json({ error: 'Tidak diotorisasi, token gagal.' });
        }
    }

    if (!token) {
        res.status(401).json({ error: 'Tidak diotorisasi, tidak ada token.' });
    }
};

// 2. Middleware untuk verifikasi Role (Wajib Admin)
const admin = (req, res, next) => {
    // req.user diisi oleh middleware protect
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ error: 'Akses ditolak. Hanya untuk Admin.' });
    }
};

module.exports = { protect, admin };