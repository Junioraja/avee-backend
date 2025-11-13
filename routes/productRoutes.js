// routes/productRoutes.js (KODE DIKOREKSI)
const express = require('express');
const router = express.Router();
const db = require('../db');
const { protect, admin } = require('../middleware/authMiddleware');

// Kunci utama Anda di DB adalah product_code (sesuai error "Kolom id tidak ada")
const PRIMARY_KEY_FIELD = 'product_code'; 

// Query dasar untuk mengambil SEMUA detail produk (menggunakan product_code sebagai ID)
const ALL_PRODUCT_FIELDS = `
    product_code, app_name, package_name, duration, price, stock, data_category, 
    logo_url, banner_url, purchase_price, discount_percentage, description
`;

// Endpoint 1: GET /api/products (Read All - Semua User)
router.get('/', async (req, res) => {
    try {
        // Menggunakan product_code sebagai ID utama untuk SELECT
        const result = await db.query(`SELECT ${ALL_PRODUCT_FIELDS} FROM products ORDER BY app_name, price ASC`);
        res.status(200).json(result.rows);
    } catch (err) {
        console.error("Error fetching products:", err.stack);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});

// Endpoint 2: POST /api/products (Create - HANYA ADMIN)
router.post('/', protect, admin, async (req, res) => {
    const { 
        app_name, package_name, duration, price, stock, data_category, 
        purchase_price, product_code, description, logo_url, banner_url, discount_percentage 
    } = req.body;

    try {
        const result = await db.query(
            `INSERT INTO products (
                app_name, package_name, duration, price, stock, data_category, 
                purchase_price, product_code, description, logo_url, banner_url, discount_percentage
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) 
            RETURNING ${ALL_PRODUCT_FIELDS}`,
            [app_name, package_name, duration, price, stock, data_category, 
             purchase_price || 0, product_code, description, logo_url, banner_url, discount_percentage || 0]
        );
        res.status(201).json({ message: 'Produk berhasil ditambahkan.', product: result.rows[0] });
    } catch (err) {
        console.error('Error adding product:', err.stack);
        res.status(500).json({ error: 'Gagal menambahkan produk.' });
    }
});

// Endpoint 3: PUT /api/products/:id (Update - HANYA ADMIN)
router.put('/:id', protect, admin, async (req, res) => {
    const productId = req.params.id; // ID yang dikirim dari frontend (seharusnya product_code)
    const { 
        app_name, package_name, duration, price, stock, data_category, 
        purchase_price, product_code, description, logo_url, banner_url, discount_percentage 
    } = req.body;

    try {
        // UPDATE menggunakan product_code sebagai kunci
        const result = await db.query(
            `UPDATE products SET
                app_name = $1, package_name = $2, duration = $3, price = $4, stock = $5, data_category = $6,
                purchase_price = $7, product_code = $8, description = $9, logo_url = $10, banner_url = $11, discount_percentage = $12
            WHERE ${PRIMARY_KEY_FIELD} = $13
            RETURNING ${ALL_PRODUCT_FIELDS}`,
            [app_name, package_name, duration, price, stock, data_category,
             purchase_price || 0, product_code, description, logo_url, banner_url, discount_percentage || 0, productId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Produk tidak ditemukan.' });
        }
        res.status(200).json({ message: 'Produk berhasil diperbarui.', product: result.rows[0] });
    } catch (err) {
        console.error('Error updating product:', err.stack);
        res.status(500).json({ error: 'Gagal memperbarui produk.' });
    }
});

// Endpoint 4: DELETE /api/products/:id (Delete - HANYA ADMIN)
router.delete('/:id', protect, admin, async (req, res) => {
    const productId = req.params.id;
    
    try {
        // DELETE menggunakan product_code sebagai kunci
        const result = await db.query(`DELETE FROM products WHERE ${PRIMARY_KEY_FIELD} = $1`, [productId]);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Produk tidak ditemukan.' });
        }
        res.status(200).json({ message: 'Produk berhasil dihapus.' });
    } catch (err) {
        console.error('Error deleting product:', err.stack);
        res.status(500).json({ error: 'Gagal menghapus produk.' });
    }
});

module.exports = router;