// AVE-BACKEND/routes/chatRoutes.js

const express = require('express');
const router = express.Router();
const db = require('../db'); // <-- Panggil koneksi database Anda
const { GoogleGenerativeAI } = require('@google/generative-ai');

// --- Fungsi untuk mengambil data produk dari database ---
async function getProductsFromYourDatabase() {
    // Gunakan sintaks query yang sama dengan di productRoutes.js
    const ALL_PRODUCT_FIELDS = `
        product_code, app_name, package_name, duration, price, stock, data_category
    `;
    try {
        const result = await db.query(`SELECT ${ALL_PRODUCT_FIELDS} FROM products WHERE stock > 0 ORDER BY app_name, price ASC`);
        return result.rows;
    } catch (error) {
        console.error("Error fetching products for Chatbot context:", error);
        // Penting: Jika gagal, kembalikan array kosong agar bot tidak error total
        return [];
    }
}

// Inisialisasi Gemini (Ambil API key dari environment variable)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Endpoint Chatbot: POST /api/chat
router.post('/chat', async (req, res) => {
    try {
        const { message } = req.body;
        if (!message) {
            return res.status(400).json({ error: "Pesan tidak boleh kosong." });
        }

        // 1. Ambil data produk (konteks)
        const products = await getProductsFromYourDatabase();
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
        const text = result.response.text;

        // 4. Kirim jawaban
        res.json({ reply: text });

    } catch (error) {
        console.error("Error di /api/chat:", error);
        // Kirim pesan fallback yang ramah
        res.status(500).json({ reply: "Aduh, Aunty lagi pusing nih, server lagi sibuk. Coba lagi nanti ya!" });
    }
});

module.exports = router;