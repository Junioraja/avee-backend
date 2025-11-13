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
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

router.post('/chat', async (req, res) => {
    console.log("--> API /chat hit. Mulai proses."); // [DEBUG] Tambahkan ini
    try {
        // ...
        
        // 1. Ambil data produk (konteks)
        const products = await getProductsFromYourDatabase();
        console.log("Produk berhasil diambil:", products.length); // [DEBUG] Tambahkan ini

        // ... sisa kode

    } catch (error) {
        console.error("Critical Error in /api/chat:", error); // [DEBUG] Pastikan ini tercatat
        res.status(500).json({ reply: "Server 500: Cek log backend untuk error DB/Gemini." });
    }
});


module.exports = router;
