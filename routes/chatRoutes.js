// AVE-BACKEND/routes/chatRoutes.js

const express = require('express');
const router = express.Router();
const db = require('../db'); 
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Inisialisasi Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }); // Pastikan 2.5-flash

// --- Fungsi untuk mengambil data produk dari database ---
async function getProductsFromYourDatabase() {
    const ALL_PRODUCT_FIELDS = `
        product_code, app_name, package_name, duration, price, stock, data_category
    `;
    try {
        // [TINDAKAN] Pastikan query ini berhasil dieksekusi
        const result = await db.query(`SELECT ${ALL_PRODUCT_FIELDS} FROM products WHERE stock > 0 ORDER BY app_name, price ASC`);
        console.log("SUCCESS: Produk berhasil diambil untuk Chatbot:", result.rows.length);
        return result.rows;
    } catch (error) {
        console.error("FATAL ERROR: Gagal mengambil produk untuk Chatbot Context (DB Error):", error.message);
        return []; // Wajib kembalikan array kosong jika gagal
    }
}

router.post('/chat', async (req, res) => {
    console.log("--> API /chat hit. Mulai proses.");
    try {
        const { message } = req.body;
        if (!message) {
            return res.status(400).json({ error: "Pesan tidak boleh kosong." });
        }

        // 1. Ambil data produk (konteks)
        const products = await getProductsFromYourDatabase();
        if (products.length === 0) {
             return res.status(503).json({ reply: "Aunty tidak bisa mengakses katalog produk saat ini. Coba lagi nanti." });
        }
        const productDataString = JSON.stringify(products);

        // 2. Buat Prompt untuk Gemini
        const prompt = `
            Kamu adalah "Aunty Jane", asisten chatbot AI yang ramah, sopan, dan sedikit gaul untuk "Avee Premium Store".

            TUGAS UTAMA: Jawab pertanyaan pelanggan HANYA berdasarkan konteks data produk yang diberikan.

            ATURAN:
            1.  Selalu gunakan sapaan "Aunty" saat merujuk ke diri sendiri.
            2.  Jawab dalam Bahasa Indonesia yang santai.
            3.  Jika pelanggan bertanya budget (misal "30k"), cari produk di bawah harga itu.
            4.  Jika pelanggan bertanya "drakor", rekomendasikan produk di kategori "Hiburan" seperti Viu atau WeTV.
            5.  Jika kamu tidak yakin atau pertanyaan di luar konteks toko, katakan: "Aunty kurang yakin, coba tanya admin langsung via WhatsApp ya."

            KONTEKS DATA PRODUK (JSON):
            ${productDataString}

            PERTANYAAN PELANGGAN:
            "${message}"
        `;

        // 3. Panggil Gemini
        const result = await model.generateContent(prompt);
        
        // [PERBAIKAN 1] Ambil respons dengan benar
        const response = result.response;
        
        // [PERBAIKAN 2] Panggil .text() sebagai fungsi
        const text = response.text && response.text(); 

        // [PERBAIKAN 3] Cek jika respons diblokir oleh Google (Safety)
        if (!text) {
            console.error("Gemini Error: Respons kosong atau diblokir (safety).");
            // Kirim respons error yang ramah ke pengguna
            return res.status(500).json({ reply: "Aduh, Aunty lagi bingung mau jawab apa. Mungkin bisa tanya yang lain?" });
        }

        // 4. Kirim jawaban
        res.json({ reply: text });

    } catch (error) {
        console.error("Error di /api/chat:", error.message);
        // Kirim pesan fallback yang ramah
        res.status(500).json({ reply: "Aduh, Aunty lagi pusing nih, server lagi sibuk. Coba lagi nanti ya!" });
    }
});

module.exports = router;
