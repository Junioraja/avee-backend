// routes/orderRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../db');
const { protect, admin } = require('../middleware/authMiddleware'); // Middleware Admin

// Endpoint 1: POST /api/orders (Membuat Pesanan Baru - Mencatat Transaksi)
router.post('/', async (req, res) => {
    // Data yang dikirim dari frontend (order.html)
    // items harus mengirimkan: [{ productCode, quantity, unitPrice }]
    const { userId, totalAmount, items } = req.body; 

    // Validasi dasar
    if (!items || items.length === 0 || !totalAmount) {
        return res.status(400).json({ error: 'Data pesanan tidak lengkap.' });
    }

    // Gunakan transaksi untuk memastikan semua insert/update berhasil atau gagal
    const client = await db.pool.connect();
    
    try {
        await client.query('BEGIN'); // Mulai Transaksi

        // 1. Masukkan data ke tabel public.orders (Header Pesanan)
        const orderResult = await client.query(
            'INSERT INTO public.orders (user_id, total_amount) VALUES ($1, $2) RETURNING id, order_date',
            [userId || null, totalAmount] // Gunakan null jika userId tidak ada (Guest)
        );
        const orderId = orderResult.rows[0].id;
        const orderDate = orderResult.rows[0].order_date;

        // 2. Masukkan item detail ke public.order_details dan update stok
        for (const item of items) {
            // item: { productCode, quantity, unitPrice }
            const productCode = item.productCode; // Ambil productCode dari body frontend
            
            // a) Masukkan detail pesanan (Relasi menggunakan product_code)
            // KOREKSI UTAMA 1: Menggunakan public.order_details dan kolom product_code (string)
            await client.query(
                'INSERT INTO public.order_details (order_id, product_code, quantity, unit_price) VALUES ($1, $2, $3, $4)',
                [orderId, productCode, item.quantity, item.unitPrice]
            );
            
            // b) Update Stok Produk (Relasi menggunakan product_code)
            // KOREKSI UTAMA 2: Menggunakan public.products dan product_code
            await client.query(
                'UPDATE public.products SET stock = stock - $1 WHERE product_code = $2 AND stock >= $1', 
                [item.quantity, productCode]
            );
        }
        
        await client.query('COMMIT'); // Commit Transaksi (Simpan ke DB)

        res.status(201).json({ 
            message: 'Pesanan berhasil dicatat dan stok diperbarui. Lanjutkan ke WhatsApp.',
            orderId: orderId,
            orderDate: orderDate
        });

    } catch (err) {
        await client.query('ROLLBACK'); // Rollback jika gagal
        console.error('Error saat membuat pesanan:', err.stack);
        // Kirim error spesifik ke frontend (debug)
        res.status(500).json({ error: 'Gagal menyimpan order ke DB. Rollback dilakukan. (Cek log server)' });
    } finally {
        client.release();
    }
});

// Endpoint 2: GET /api/orders (Read All Orders - HANYA ADMIN)
router.get('/', protect, admin, async (req, res) => {
    try {
        // Mengambil orders dengan detail user
        const result = await db.query(`
            SELECT 
                o.id, o.order_date, o.total_amount, o.status, 
                u.name as user_name, u.email as user_email
            FROM public.orders o
            LEFT JOIN public.users u ON o.user_id = u.id
            ORDER BY o.order_date DESC
        `);
        res.status(200).json(result.rows);
    } catch (err) {
        console.error('Error mengambil list pesanan:', err.stack);
        res.status(500).json({ error: 'Gagal mengambil data pesanan.' });
    }
});

// Endpoint 3: PUT /api/orders/:id/status (Update Status Pesanan - HANYA ADMIN)
router.put('/:id/status', protect, admin, async (req, res) => {
    const { id } = req.params;
    const { status } = req.body; 

    try {
        const result = await db.query(
            'UPDATE public.orders SET status = $1 WHERE id = $2 RETURNING id, status',
            [status, id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Pesanan tidak ditemukan.' });
        }

        res.status(200).json({ message: 'Status pesanan berhasil diperbarui.', order: result.rows[0] });

    } catch (err) {
        console.error('Error update status:', err.stack);
        res.status(500).json({ error: 'Gagal memperbarui status.' });
    }
});

// Endpoint 4: GET /api/orders/:id (Read Single Order Detail - HANYA ADMIN)
// Diperlukan untuk detail pesanan/pembuatan pesan WA
router.get('/:id', protect, admin, async (req, res) => {
    const { id } = req.params;
    
    try {
        // 1. Ambil Header Pesanan
        const orderHeaderResult = await db.query(`
            SELECT 
                o.id, o.order_date, o.total_amount, o.status, 
                u.name as user_name, u.email as user_email
            FROM public.orders o
            LEFT JOIN public.users u ON o.user_id = u.id
            WHERE o.id = $1
        `, [id]);
        
        if (orderHeaderResult.rows.length === 0) {
            return res.status(404).json({ error: 'Pesanan tidak ditemukan.' });
        }
        
        const order = orderHeaderResult.rows[0];

        // 2. Ambil Detail Item Pesanan (menggunakan JOIN pada product_code)
        const orderDetailsResult = await db.query(`
            SELECT 
                od.quantity, od.unit_price, p.product_code, p.app_name, p.package_name, p.duration
            FROM public.order_details od
            JOIN public.products p ON od.product_code = p.product_code
            WHERE od.order_id = $1
        `, [id]);

        // Gabungkan semua data
        order.items = orderDetailsResult.rows;

        res.status(200).json(order);

    } catch (err) {
        console.error(`Error fetching order ${id} details:`, err.stack);
        res.status(500).json({ error: 'Gagal mengambil detail pesanan.' });
    }
});


module.exports = router;
