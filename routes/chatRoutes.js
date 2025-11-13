// AVE-BACKEND/routes/chatRoutes.js
// KODE LENGKAP DAN OPTIMAL

const express = require('express');
const router = express.Router();
const db = require('../db'); // Pastikan path ini benar ke file db.js Anda
const { GoogleGenerativeAI } = require('@google/generative-ai');

// --- 1. Inisialisasi Gemini ---
// Kita gunakan 'gemini-pro' yang terbukti lebih stabil untuk workload chat
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }); 

// --- 2. Fungsi Pengambilan Data Produk (Konteks) ---
// Fungsi ini hanya akan mengambil produk yang READY STOCK untuk optimasi prompt
async function getProductsFromYourDatabase() {
    const ALL_PRODUCT_FIELDS = `
        product_code, app_name, package_name, duration, price, stock, data_category
    `;
    try {
        // Optimasi: Hanya kirim produk yang stoknya > 0 ke AI
        const result = await db.query(`SELECT ${ALL_PRODUCT_FIELDS} FROM products WHERE stock > 0 ORDER BY app_name, price ASC`);
        console.log(`SUCCESS: Produk (Stok > 0) berhasil diambil untuk Chatbot: ${result.rows.length}`);
        return result.rows;
    } catch (error) {
        console.error("FATAL ERROR: Gagal mengambil produk untuk Chatbot Context (DB Error):", error.message);
        // Kembalikan array kosong agar endpoint utama tahu DB gagal
        return []; 
    }
}

// --- 3. Fungsi Generator Respons Gemini ---
// Fungsi terpisah untuk memanggil AI, membuatnya lebih bersih
async function getGeminiResponse(userMessage, productContextJSON = "") {
    
    let contextPrompt = "";
    
    // Hanya tambahkan konteks produk jika datanya ada
    if (productContextJSON) {
        contextPrompt = `
            KONTEKS DATA PRODUK (JSON):
            Ini adalah katalog produk yang tersedia saat ini. Jawab pertanyaan HANYA berdasarkan data ini.
            ${productContextJSON}
        `;
    }

    const prompt = `
        Kamu adalah "Aunty Jane", asisten chatbot AI yang ramah, sopan, dan sedikit gaul untuk "Avee Premium Store".

        TUGAS UTAMA: Jawab pertanyaan pelanggan dengan aturan di bawah ini.

        ATURAN:
        1.  Selalu gunakan sapaan "Aunty" saat merujuk ke diri sendiri. Jawab dalam Bahasa Indonesia yang santai.
        2.  Jika PERTANYAAN PELANGGAN hanya sapaan sederhana (seperti "hai", "halo"), JANGAN gunakan konteks produk. Balas sapaan itu dengan ramah (contoh: "Hai juga! Ada yang bisa Aunty bantu?").
        3.  Jika PERTANYAAN PELANGGAN tentang produk, harga, budget, atau rekomendasi (seperti "netflix", "30k", "drakor"), JAWAB HANYA berdasarkan "KONTEKS DATA PRODUK" yang diberikan.
        4.  Jika pelanggan bertanya produk yang TIDAK ADA di konteks, katakan produk itu "sedang habis" atau "belum tersedia".
        5.  Jika kamu tidak yakin atau pertanyaan di luar konteks toko (cuaca, politik, dll), katakan: "Aduh, maaf, Aunty kurang yakin. Aunty cuma ngerti soal produk di toko ini. Coba tanya admin langsung via WhatsApp ya."

        ${contextPrompt}

        PERTANYAAN PELANGGAN:
        "${userMessage}"
    `;

    try {
        const result = await model.generateContent(prompt);
        const response = result.response;
        
        // [PERBAIKAN KRUSIAL] Panggil .text() sebagai fungsi
        const text = response.text && response.text(); 

        // Cek jika respons diblokir oleh Google (Safety Filter) atau kosong
        if (!text) {
            console.error("Gemini Error: Respons kosong atau diblokir (Safety Filter).");
            // Kirim pesan error yang ramah ke pengguna
            return "Aduh, Aunty lagi bingung mau jawab apa. Pertanyaannya sensitif mungkin? Coba tanya yang lain.";
        }
        
        return text; // Sukses

    } catch (error) {
        // Ini menangani error jika model Overloaded (503) atau error lainnya
        console.error("Error saat generateContent (Model Overloaded/Error):", error.message);
        return `Aduh, Aunty lagi pusing nih, pertanyaannya terlalu rumit atau server AI lagi sibuk. Coba lagi nanti ya!`;
    }
}

// --- 4. Endpoint Chatbot Utama (LOGIKA BARU YANG OPTIMAL) ---
router.post('/chat', async (req, res) => {
    const { message } = req.body;
    console.log(`--> API /chat hit. Pesan: "${message}"`);

    if (!message) {
        return res.status(400).json({ error: "Pesan tidak boleh kosong." });
    }

    try {
        const lowerCaseMessage = message.toLowerCase().trim();
        let responseText = "";

        // Tentukan apakah ini sapaan sederhana
        const isGreeting = ['hai', 'halo', 'hi', 'pagi', 'siang', 'sore', 'malam'].includes(lowerCaseMessage);

        // --- Logika Cerdas: Pisahkan Sapaan dan Pertanyaan Produk ---
        
        if (isGreeting) {
            // KONDISI 1: Hanya Sapaan
            // Panggil Gemini TANPA mengambil data database. Cepat dan efisien.
            console.log("Logika: Merespons sebagai sapaan.");
            responseText = await getGeminiResponse(message); 

        } else {
            // KONDISI 2: Pertanyaan Produk (Netflix, 30k, dll)
            // Baru kita panggil database untuk konteks.
            console.log("Logika: Merespons sebagai pertanyaan produk. Mengambil data DB...");
            
            const products = await getProductsFromYourDatabase();
            
            // Cek jika database gagal (mengembalikan array kosong)
            if (products.length === 0) {
                 console.error("Gagal lanjut: Fungsi DB mengembalikan 0 produk (Error atau Stok Habis).");
                 // Kirim status 503 (Service Unavailable) karena data penting tidak ada
                 return res.status(503).json({ reply: "Aduh, Aunty lagi nggak bisa lihat katalog produk nih. Coba lagi nanti ya." });
            }
            
            const productDataString = JSON.stringify(products);
            responseText = await getGeminiResponse(message, productDataString); // Panggil DENGAN konteks produk
        }

        // 4. Kirim jawaban Sukses
        res.json({ reply: responseText });

    } catch (error) {
        // Ini adalah error fallback utama jika terjadi kesalahan tak terduga di server
        console.error("Error utama di endpoint /api/chat:", error.message);
        res.status(500).json({ reply: "Aduh, Aunty lagi pusing nih, server utama lagi sibuk. Coba lagi nanti ya!" });
    }
});

module.exports = router;

