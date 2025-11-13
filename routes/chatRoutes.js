// AVE-BACKEND/routes/chatRoutes.js

const express = require('express');
const router = express.Router();
const db = require('../db'); 
const { GoogleGenerativeAI } = require('@google/generative-ai');

// --- Inisialisasi Gemini (Gunakan gemini-pro yang stabil) ---
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// Kita ganti model ke 'gemini-pro' untuk stabilitas
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

// --- Fungsi untuk mengambil data produk dari database ---
async function getProductsFromYourDatabase() {
    const ALL_PRODUCT_FIELDS = `
        product_code, app_name, package_name, duration, price, stock, data_category
    `;
    try {
        const result = await db.query(`SELECT ${ALL_PRODUCT_FIELDS} FROM products WHERE stock > 0 ORDER BY app_name, price ASC`);
        console.log("SUCCESS: Produk berhasil diambil untuk Chatbot:", result.rows.length);
        return result.rows;
    } catch (error) {
        console.error("FATAL ERROR: Gagal mengambil produk untuk Chatbot Context (DB Error):", error.message);
        return [];
    }
}

// --- Fungsi untuk menghasilkan respons ---
async function getGeminiResponse(userMessage, productContext = "") {
    let contextPrompt = "";
    if (productContext) {
        contextPrompt = `
            KONTEKS DATA PRODUK (JSON):
            ${productContext}
        `;
    }

    const prompt = `
        Kamu adalah "Aunty Jane", asisten chatbot AI yang ramah, sopan, dan sedikit gaul untuk "Avee Premium Store".

        TUGAS UTAMA: Jawab pertanyaan pelanggan.

        ATURAN:
        1.  Selalu gunakan sapaan "Aunty" saat merujuk ke diri sendiri. Jawab dalam Bahasa Indonesia yang santai.
        2.  Jika PERTANYAAN PELANGGAN hanya sapaan (seperti "hai", "halo"), JANGAN gunakan konteks produk. Balas sapaan itu dengan ramah.
        3.  Jika PERTANYAAN PELANGGAN tentang produk, harga, budget, atau rekomendasi (seperti "netflix", "30k", "drakor"), JAWAB HANYA berdasarkan KONTEKS DATA PRODUK yang diberikan.
        4.  Jika kamu tidak yakin atau pertanyaan di luar konteks, katakan: "Aunty kurang yakin, coba tanya admin langsung via WhatsApp ya."

        ${contextPrompt}

        PERTANYAAN PELANGGAN:
        "${userMessage}"
    `;

    try {
        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text && response.text();

        if (!text) {
            console.error("Gemini Error: Respons kosong atau diblokir (safety).");
            return "Aduh, Aunty lagi bingung mau jawab apa. Mungkin bisa tanya yang lain?";
        }
        return text;

    } catch (error) {
        console.error("Error saat generateContent:", error.message);
        // Jika error terjadi karena prompt (misal token limit), kita kirim pesan ini
        return "Aduh, Aunty lagi pusing nih, pertanyaannya terlalu rumit. Coba lagi nanti ya!";
    }
}

// --- Endpoint Chatbot Utama (LOGIKA BARU) ---
router.post('/chat', async (req, res) => {
    console.log(`--> API /chat hit. Pesan: "${req.body.message}"`);
    try {
        const { message } = req.body;
        if (!message) {
            return res.status(400).json({ error: "Pesan tidak boleh kosong." });
        }

        const lowerCaseMessage = message.toLowerCase();
        let responseText = "";

        // --- Logika Cerdas: Cek apakah perlu mengambil data DB ---
        // Jika hanya sapaan, jangan panggil DB.
        if (lowerCaseMessage === "hai" || lowerCaseMessage === "halo" || lowerCaseMessage === "hi") {
            
            responseText = await getGeminiResponse(message); // Panggil tanpa konteks produk

        } else {
            // Jika pertanyaan tentang produk, baru panggil DB.
            const products = await getProductsFromYourDatabase();
            if (products.length === 0) {
                 return res.status(503).json({ reply: "Aunty tidak bisa mengakses katalog produk saat ini. Coba lagi nanti." });
            }
            const productDataString = JSON.stringify(products);
            
            responseText = await getGeminiResponse(message, productDataString); // Panggil DENGAN konteks produk
        }

        // 4. Kirim jawaban
        res.json({ reply: responseText });

    } catch (error) {
        console.error("Error utama di /api/chat:", error.message);
        res.status(500).json({ reply: "Aduh, Aunty lagi pusing nih, server lagi sibuk. Coba lagi nanti ya!" });
    }
});

module.exports = router;
