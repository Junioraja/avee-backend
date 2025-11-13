// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Import Auth (Passport untuk Google Login)
const passport = require('../auth'); 
// Import Middleware (untuk proteksi Admin)
const { protect, admin } = require('../middleware/authMiddleware'); 

// Kolom yang harus diambil dari tabel users (termasuk kolom baru)
const USER_FIELDS = `
    id, name, email, role, google_id, loyalty_points, referral_code, invited_by_referral_code
`;

const saltRounds = 10; 

// Endpoint Google Login Start
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Endpoint Google Callback
router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/' }), (req, res) => {
    // Jika auth berhasil, buat JWT
    const user = req.user;
    const token = jwt.sign(
        { userId: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '1h' } 
    );
    
    // Redirect ke frontend dengan token
    // Catatan: Pastikan port ini sesuai dengan tempat index.html berjalan (misal: 127.0.0.1:5500)
    res.redirect(`http://127.0.0.1:5500/index.html?token=${token}&role=${user.role}`); 
});


// Endpoint 1: Pendaftaran (Sign Up)
router.post('/signup', async (req, res) => {
    const { name, email, password, isAdmin } = req.body;
    
    try {
        // Hashing Password
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Tentukan peran (role)
        const role = isAdmin ? 'admin' : 'user';

        // Logika Poin & Referral (Inisialisasi)
        // Buat referral code otomatis
        const newReferralCode = Math.random().toString(36).substring(2, 8).toUpperCase(); 
        
        // Simpan User Baru ke Database
        const result = await db.query(
            `INSERT INTO users (name, email, password, role, referral_code, loyalty_points) 
             VALUES ($1, $2, $3, $4, $5, $6) 
             RETURNING ${USER_FIELDS}`,
            [name, email, hashedPassword, role, newReferralCode, 0]
        );

        res.status(201).json({ 
            message: 'Pendaftaran berhasil. Silakan Login.',
            user: result.rows[0]
        });

    } catch (err) {
        if (err.code === '23505') { 
            return res.status(400).json({ error: 'Email sudah terdaftar.' });
        }
        console.error('Error saat pendaftaran:', err.stack);
        res.status(500).json({ error: 'Gagal melakukan pendaftaran.' });
    }
});

// Endpoint 2: Login (Sign In)
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Cari User berdasarkan Email
        const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = result.rows[0];

        if (!user) {
            return res.status(401).json({ error: 'Email atau password salah.' });
        }

        // Bandingkan Password
        const match = await bcrypt.compare(password, user.password);

        if (!match) {
            return res.status(401).json({ error: 'Email atau password salah.' });
        }

        // Buat Token Sesi (JWT)
        const token = jwt.sign(
            { userId: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' } 
        );

        res.status(200).json({
            message: 'Login berhasil.',
            token: token,
            user: { id: user.id, name: user.name, role: user.role }
        });

    } catch (err) {
        console.error('Error saat login:', err.stack);
        res.status(500).json({ error: 'Gagal melakukan login.' });
    }
});

// Endpoint 3: GET /api/users (Read All Users - HANYA ADMIN)
// Diperlukan untuk Manajemen Pengguna di admin.html
router.get('/', protect, admin, async (req, res) => {
    try {
        const result = await db.query(`
            SELECT ${USER_FIELDS}, created_at 
            FROM users 
            ORDER BY id ASC
        `);
        res.status(200).json(result.rows);
    } catch (err) {
        console.error('Error fetching users:', err.stack);
        res.status(500).json({ error: 'Gagal mengambil data pengguna.' });
    }
});

module.exports = router;