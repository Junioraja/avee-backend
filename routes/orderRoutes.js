// routes/orderRoutes.js
const express = require('express');
const router = express.Router();
// Asumsi db dan middleware sudah didefinisikan dengan benar
const db = require('../db'); 
const { protect, admin } = require('../middleware/authMiddleware'); 

// =========================================================
// ROUTE 1: POST /api/orders (Membuat Pesanan Baru)
// =========================================================
router.post('/', async (req, res) => {
    // account_details ditambahkan sebagai data opsional yang mungkin dikirim dari frontend
    const { userId, totalAmount, items, paymentMethod, account_email, account_password, account_profile, account_pin } = req.body;

    // Validasi dasar
    if (!items || items.length === 0 || !totalAmount) {
        return res.status(400).json({ error: 'Data pesanan tidak lengkap (items atau totalAmount kosong).' });
    }

    const client = await db.pool.connect();

    try {
        await client.query('BEGIN'); // Mulai transaksi

        // 1. Masukkan data ke public.orders
        const orderResult = await client.query(
            `INSERT INTO public.orders 
                (user_id, total_amount, payment_method, account_email, account_password, account_profile, account_pin) 
             VALUES ($1, $2, $3, $4, $5, $6, $7) 
             RETURNING id, order_date`,
            [
                userId || null, 
                totalAmount, 
                paymentMethod || null,
                account_email || null,
                account_password || null,
                account_profile || null,
                account_pin || null
            ]
        );
        const orderId = orderResult.rows[0].id;
        const orderDate = orderResult.rows[0].order_date;

        // 2. Masukkan item detail ke public.order_details dan update stok
        for (const item of items) {
            const productCode = item.productCode;
            
            // a) Masukkan detail pesanan
            await client.query(
                'INSERT INTO public.order_details (order_id, product_code, quantity, unit_price) VALUES ($1, $2, $3, $4)',
                [orderId, productCode, item.quantity, item.unitPrice]
            );
            
            // b) Update Stok Produk dengan Pengecekan
            const updateResult = await client.query(
                // Query ini hanya akan mengupdate jika stok saat ini cukup
                'UPDATE public.products SET stock = stock - $1 WHERE product_code = $2 AND stock >= $1',
                [item.quantity, productCode]
            );
            
            // Pengecekan: Jika tidak ada baris yang diupdate, artinya stok kurang atau product_code salah
            if (updateResult.rowCount === 0) {
                // Lempar error agar ditangkap oleh blok catch dan memicu ROLLBACK
                throw new Error(`Stok produk ${productCode} tidak mencukupi atau produk tidak valid.`); 
            }
        }
        
        await client.query('COMMIT'); // Commit transaksi jika semua berhasil

        res.status(201).json({
            message: 'Pesanan berhasil dicatat dan stok diperbarui. Lanjutkan ke WhatsApp.',
            orderId: orderId,
            orderDate: orderDate
        });

    } catch (err) {
        await client.query('ROLLBACK'); // Batalkan semua operasi jika terjadi error
        console.error('Error saat membuat pesanan:', err.stack);
        
        // Tampilkan error yang lebih spesifik jika terkait stok
        if (err.message.includes('Stok produk')) {
             return res.status(400).json({ error: err.message });
        }
        
        res.status(500).json({ error: 'Gagal menyimpan order ke DB. Rollback dilakukan. (Cek log server)' });
    } finally {
        client.release();
    }
});

// =========================================================
// ROUTE 2: GET /api/orders/myhistory (Riwayat Pesanan Pengguna)
// PENTING: HARUS DITEMPATKAN DI ATAS /:id
// =========================================================
router.get('/myhistory', protect, async (req, res) => {
    try {
        // Ambil ID pengguna dari token (via middleware 'protect')
        const userId = req.user.userId;

        // Query untuk mengambil semua pesanan pengguna
        const query = `
            SELECT 
                o.id,
                o.order_date,
                o.status,
                o.payment_method,
                o.total_amount,
                o.account_email,
                o.account_password,
                o.account_profile,
                o.account_pin,
                json_agg(
                    json_build_object(
                        'product_name', p.package_name,
                        'duration', p.duration,
                        'price', p.price,
                        'product_code', p.product_code
                    )
                ) AS items
            FROM 
                public.orders o
            JOIN 
                public.order_details od ON o.id = od.order_id
            LEFT JOIN 
                public.products p ON od.product_code = p.product_code
            WHERE 
                o.user_id = $1
            GROUP BY 
                o.id
            ORDER BY 
                o.order_date DESC;
        `;

        const result = await db.query(query, [userId]);

        // Mengemas respons dalam objek { orders: [...] }
        res.status(200).json({ orders: result.rows });

    } catch (err) {
        console.error('Error fetching order history:', err.stack);
        res.status(500).json({ error: 'Gagal mengambil riwayat pesanan.' });
    }
});

// =========================================================
// ROUTE 3: GET /api/orders (Read All Orders - HANYA ADMIN)
// =========================================================
router.get('/', protect, admin, async (req, res) => {
    try {
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


// =========================================================
// ROUTE 4: PUT /api/orders/:id/status (Update Status Pesanan - HANYA ADMIN)
// =========================================================
router.put('/:id/status', protect, admin, async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    // Tambahkan validasi sederhana untuk status
    if (!status) {
        return res.status(400).json({ error: 'Status tidak boleh kosong.' });
    }

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

// =========================================================
// ROUTE 5: GET /api/orders/:id (Read Single Order Detail - HANYA ADMIN)
// =========================================================
router.get('/:id', protect, admin, async (req, res) => {
    const { id } = req.params;
    
    try {
        // 1. Ambil Header Pesanan
        const orderHeaderResult = await db.query(`
            SELECT 
                o.id, o.order_date, o.total_amount, o.status, o.payment_method,
                o.account_email, o.account_password, o.account_profile, o.account_pin,
                u.name as user_name, u.email as user_email
            FROM public.orders o
            LEFT JOIN public.users u ON o.user_id = u.id
            WHERE o.id = $1
        `, [id]);
        
        if (orderHeaderResult.rows.length === 0) {
            return res.status(404).json({ error: 'Pesanan tidak ditemukan.' });
        }
        
        const order = orderHeaderResult.rows[0];

        // 2. Ambil Detail Item Pesanan (JOIN menggunakan product_code)
        const orderDetailsResult = await db.query(`
            SELECT 
                od.quantity, od.unit_price, p.product_code, p.app_name, p.package_name, p.duration, p.price
            FROM public.order_details od
            JOIN public.products p ON od.product_code = p.product_code
            WHERE od.order_id = $1
        `, [id]);

        order.items = orderDetailsResult.rows;

        res.status(200).json(order);

    } catch (err) {
        console.error(`Error fetching order ${id} details:`, err.stack);
        res.status(500).json({ error: 'Gagal mengambil detail pesanan.' });
    }
});

// =========================================================
// ROUTE 6: DELETE /api/orders/:id (Delete Order - HANYA ADMIN)
// =========================================================
router.delete('/:id', protect, admin, async (req, res) => {
    const { id } = req.params;
    const client = await db.pool.connect();

    try {
        await client.query('BEGIN');
        
        // Hapus detail pesanan terlebih dahulu (jika tidak ada ON DELETE CASCADE)
        // Jika tabel order_details memiliki ON DELETE CASCADE pada order_id, baris ini bisa diabaikan:
        // await client.query('DELETE FROM public.order_details WHERE order_id = $1', [id]); 
        
        // Hapus Order Header
        const result = await client.query('DELETE FROM public.orders WHERE id = $1', [id]);

        if (result.rowCount === 0) {
            // Gunakan throw new Error() agar langsung masuk ke blok catch dan ROLLBACK
            throw new Error('Pesanan tidak ditemukan.'); 
        }
        
        await client.query('COMMIT');
        res.status(200).json({ message: `Pesanan #${id} berhasil dihapus.` });

    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error deleting order:', err.stack);
        
        // Tampilkan 404 jika errornya adalah 'Pesanan tidak ditemukan.'
        if (err.message === 'Pesanan tidak ditemukan.') {
             return res.status(404).json({ error: 'Pesanan tidak ditemukan.' });
        }
        
        res.status(500).json({ error: 'Gagal menghapus pesanan. Cek log server.' });
    } finally {
        client.release();
    }
});

module.exports = router;
