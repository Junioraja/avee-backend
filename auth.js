// auth.js
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const db = require('./db'); 

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: 'http://localhost:3000/api/auth/google/callback', // Sesuai dengan yang didaftarkan di Google
        },
        async (accessToken, refreshToken, profile, done) => {
            // Logika Verifikasi dan Database Sync
            const googleId = profile.id;
            const email = profile.emails[0].value;
            const name = profile.displayName;

            try {
                // 1. Cek apakah user sudah ada
                let userResult = await db.query('SELECT * FROM users WHERE google_id = $1 OR email = $2', [googleId, email]);
                let user = userResult.rows[0];

                if (user) {
                    // Jika user ada, pastikan google_id terisi (jika login pertama kali dengan email)
                    if (!user.google_id) {
                        await db.query('UPDATE users SET google_id = $1 WHERE id = $2', [googleId, user.id]);
                    }
                    return done(null, user); // User ditemukan, lanjutkan sesi
                } else {
                    // 2. Jika user belum ada, daftarkan user baru (Tanpa password)
                    const newUserResult = await db.query(
                        'INSERT INTO users (name, email, google_id, role) VALUES ($1, $2, $3, $4) RETURNING *',
                        [name, email, googleId, 'user']
                    );
                    return done(null, newUserResult.rows[0]); // User baru dibuat
                }
            } catch (err) {
                return done(err, null);
            }
        }
    )
);


// Passport perlu serialisasi user untuk sesi
passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const result = await db.query('SELECT * FROM users WHERE id = $1', [id]);
        done(null, result.rows[0]);
    } catch (err) {
        done(err, null);
    }
});

module.exports = passport;