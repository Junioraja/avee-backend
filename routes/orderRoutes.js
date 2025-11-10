// routes/orderRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../db');
const { protect, admin } = require('../middleware/authMiddleware'); // Middleware Admin

// Endpoint 1: POST /api/orders (Membuat Pesanan Baru - Dipanggil dari order.html)
router.post('/', async (req, res) => {
    // Data yang dikirim dari frontend (order.html)
    // Asumsi items adalah array: [{ productId, quantity, unitPrice }]
    const { userId, totalAmount, items } = req.body; 

    // Validasi dasar
    if (!items || items.length === 0 || !totalAmount) {
        return res.status(400).json({ error: 'Data pesanan tidak lengkap.' });
    }

    // Gunakan transaksi untuk memastikan semua insert berhasil atau tidak sama sekali
    const client = await db.pool.connect();
    
    try {
        await client.query('BEGIN'); // Mulai Transaksi

        // 1. Masukkan data ke tabel orders (Header Pesanan)
        const orderResult = await client.query(
            'INSERT INTO orders (user_id, total_amount) VALUES ($1, $2) RETURNING id, order_date',
            [userId || null, totalAmount] // Gunakan null jika userId tidak ada (Guest)
        );
        const orderId = orderResult.rows[0].id;
        const orderDate = orderResult.rows[0].order_date;

        // 2. Masukkan item detail ke tabel order_details
        for (const item of items) {
            // item: { productId, quantity, unitPrice }
            // Catatan: product_id harus ID NUMERIK dari tabel products
            await client.query(
                'INSERT INTO order_details (order_id, product_id, quantity, unit_price) VALUES ($1, $2, $3, $4)',
                [orderId, item.productId, item.quantity, item.unitPrice]
            );
            
            // 3. Update Stok Produk (Opsional, tapi disarankan)
            await client.query(
                'UPDATE products SET stock = stock - $1 WHERE id = $2 AND stock >= $1', 
                [item.quantity, item.productId]
            );
        }
        
        await client.query('COMMIT'); // Commit Transaksi (Simpan ke DB)

        res.status(201).json({ 
            message: 'Pesanan berhasil dicatat dan stok diperbarui. Lanjutkan ke WhatsApp.',
            orderId: orderId,
            orderDate: orderDate
        });

    } catch (err) {
        await client.query('ROLLBACK'); // Rollback (Batalkan semua perubahan jika ada error)
        console.error('Error saat membuat pesanan:', err.stack);
        res.status(500).json({ error: 'Gagal mencatat pesanan. Rollback dilakukan.' });
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
            FROM orders o
            LEFT JOIN users u ON o.user_id = u.id
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
    const { status } = req.body; // Status baru (Pending, Proses, Selesai, Paid, etc.)

    try {
        const result = await db.query(
            'UPDATE orders SET status = $1 WHERE id = $2 RETURNING id, status',
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
            FROM orders o
            LEFT JOIN users u ON o.user_id = u.id
            WHERE o.id = $1
        `, [id]);
        
        if (orderHeaderResult.rows.length === 0) {
            return res.status(404).json({ error: 'Pesanan tidak ditemukan.' });
        }
        
        const order = orderHeaderResult.rows[0];

        // 2. Ambil Detail Item Pesanan (termasuk kode produk untuk pesan WA)
        const orderDetailsResult = await db.query(`
            SELECT 
                od.quantity, od.unit_price, p.product_code, p.app_name, p.package_name, p.duration, p.product_code
            FROM order_details od
            JOIN products p ON od.product_id = p.id
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