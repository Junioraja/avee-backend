<!DOCTYPE html>
<html lang="id" class="light">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Konfirmasi Pesanan - Avee Premium Store</title>
    <!-- Memuat Tailwind CSS -->
    <script src="https://cdn.tailwindcss.com"></script>
    <!-- Memuat ikon Lucide -->
    <script src="https://unpkg.com/lucide@latest"></script>
    <!-- Memuat Font Inter -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap" rel="stylesheet">

    <script>
        // Konfigurasi Tailwind
        tailwind.config = {
            darkMode: 'class',
            theme: {
                extend: {
                    colors: {
                        'soft-blue': '#C8E6F7',
                        'deep-blue': '#2563EB',
                        'light-bg': '#F0F8FF',
                        'card-bg': '#FFFFFF',
                        'text-primary': '#1F2937',
                        'accent-wa': '#25D366',
                    },
                    fontFamily: {
                        sans: ['Inter', 'sans-serif'],
                    },
                    boxShadow: {
                        'soft': '0 4px 12px rgba(0, 0, 0, 0.05)',
                        'lg-soft': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                    }
                }
            }
        }
    </script>

    <style>
        body {
            font-family: 'Inter', sans-serif;
            background-color: #F0F8FF;
            /* light-bg */
            color: #1F2937;
            /* text-primary */
        }

        html.dark body {
            background-color: #111827;
            /* gray-900 */
            color: #d1d5db;
            /* gray-300 */
        }

        /* Gaya Accordion (Tab Grup) */
        .accordion-item .accordion-question {
            transition: background-color 0.2s ease;
        }

        .accordion-item .accordion-answer {
            max-height: 0;
            overflow: hidden;
            transition: max-height 0.4s ease-out, padding 0.4s ease-out;
            padding-top: 0;
            padding-bottom: 0;
        }

        .accordion-item.active .accordion-answer {
            max-height: 500px;
            /* Cukup besar untuk konten */
            padding-top: 1rem;
            padding-bottom: 1.5rem;
        }

        .accordion-item .accordion-toggle {
            transition: transform 0.3s ease-in-out;
        }

        .accordion-item.active .accordion-toggle {
            transform: rotate(180deg);
        }

        .accordion-item.active .accordion-question {
            background-color: #FFFFFF;
            /* card-bg */
        }

        html.dark .accordion-item.active .accordion-question {
            background-color: #1f2937;
            /* gray-800 */
        }

        /* Gaya Tombol Metode Pembayaran */
        .payment-button {
            transition: all 0.2s ease;
            border: 2px solid #E5E7EB;
            /* gray-200 */
        }

        html.dark .payment-button {
            border: 2px solid #4B5563;
            /* gray-600 */
        }

        .payment-button.active {
            border-color: #2563EB;
            /* deep-blue */
            background-color: #EFF6FF;
            /* blue-50 */
            box-shadow: 0 4px 10px rgba(59, 130, 246, 0.2);
        }

        html.dark .payment-button.active {
            border-color: #3B82F6;
            /* blue-500 */
            background-color: #1F2937;
            /* gray-800 */
        }

        /* Konten Pembayaran Tersembunyi */
        .payment-content {
            display: none;
            animation: fadeIn 0.5s ease;
        }

        .payment-content.active {
            display: block;
        }

        @keyframes fadeIn {
            from {
                opacity: 0;
                transform: translateY(-10px);
            }

            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
    </style>
</head>

<body class="antialiased">

    <!-- Header Sederhana -->
    <header class="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-50">
        <div class="container mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
            <a href="index.html" class="flex items-center space-x-2 group">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"
                    class="text-blue-600">
                    <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2z"
                        fill="currentColor" opacity="0.15" />
                    <path d="M8 12.5L11 15.5L16 9.5" stroke="#3b82f6" stroke-width="2.5" stroke-linecap="round"
                        stroke-linejoin="round" />
                </svg>
                <span class="text-xl font-extrabold tracking-tight text-blue-700">Avee Premium Store</span>
            </a>
            <div class="flex items-center space-x-3">
                <button id="theme-toggle" onclick="toggleTheme()"
                    class="p-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 rounded-full transition duration-200 hover:bg-blue-50 dark:hover:bg-gray-700">
                    <i data-lucide="moon" id="moon-icon" class="w-5 h-5 block dark:hidden"></i>
                    <i data-lucide="sun" id="sun-icon" class="w-5 h-5 hidden dark:block"></i>
                </button>
                <a href="index.html#produk" class="text-gray-600 dark:text-gray-300 hover:text-blue-600 font-medium">
                    Kembali
                </a>
            </div>
        </div>
    </header>

    <main class="container mx-auto max-w-4xl p-4 my-8">

        <div class="space-y-8">

            <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
                <div id="product-banner" class="h-48 w-full bg-gray-200 dark:bg-gray-700">
                </div>
                <div class="flex items-center p-6">
                    <img id="product-logo" src="https://placehold.co/64x64/E5E7EB/A1A1AA?text=..." alt="Logo Produk"
                        class="w-16 h-16 rounded-lg mr-4 border border-gray-100 dark:border-gray-700">
                    <div>
                        <h1 id="product-name" class="text-3xl font-bold text-gray-900 dark:text-gray-100">Memuat...
                        </h1>
                        <p class="text-gray-500 dark:text-gray-400">Konfirmasi pesanan Anda</p>
                    </div>
                </div>
            </div>

            <div id="accordion-container" class="space-y-4 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">

                <div class="accordion-item border-b dark:border-gray-700 active">
                    <button class="accordion-question w-full flex justify-between items-center text-left py-4">
                        <span class="text-xl font-semibold text-deep-blue dark:text-blue-400">Informasi Paket</span>
                        <i data-lucide="chevron-down"
                            class="accordion-toggle w-5 h-5 text-deep-blue dark:text-blue-400"></i>
                    </button>
                    <div class="accordion-answer pr-4">
                        <div id="info-content" class="text-gray-700 dark:text-gray-300 space-y-2">
                            <p>Memuat detail paket...</p>
                        </div>
                    </div>
                </div>

                <div class="accordion-item border-b dark:border-gray-700">
                    <button class="accordion-question w-full flex justify-between items-center text-left py-4">
                        <span class="text-xl font-semibold text-deep-blue dark:text-blue-400">Skema
                            Berlangganan</span>
                        <i data-lucide="chevron-down"
                            class="accordion-toggle w-5 h-5 text-deep-blue dark:text-blue-400"></i>
                    </button>
                    <div class="accordion-answer pr-4">
                        <ol class="list-decimal list-inside text-gray-700 dark:text-gray-300 space-y-3">
                            <li>Pilih **Metode Pembayaran** di bawah (QRIS, DANA, dll).</li>
                            <li>Lakukan pembayaran sesuai instruksi.</li>
                            <li>Klik tombol **"Order via WhatsApp"** di halaman ini.</li>
                            <li>Anda akan diarahkan ke WhatsApp. Kirim format pesanan yang sudah otomatis terisi.</li>
                            <li>Jika sudah bayar, **lampirkan bukti pembayaran** di chat WA.</li>
                            <li>Tunggu 5-10 menit, admin akan segera memproses pesanan dan mengirimkan detail akun Anda.
                            </li>
                        </ol>
                    </div>
                </div>

                <div class="accordion-item">
                    <button class="accordion-question w-full flex justify-between items-center text-left py-4">
                        <span class="text-xl font-semibold text-deep-blue dark:text-blue-400">Pilih Metode
                            Pembayaran</span>
                        <i data-lucide="chevron-down"
                            class="accordion-toggle w-5 h-5 text-deep-blue dark:text-blue-400"></i>
                    </button>
                    <div class="accordion-answer pr-4">
                        <div class="flex flex-wrap gap-3 mb-4">
                            <button onclick="selectPayment('QRIS', this)"
                                class="payment-button active rounded-lg py-2 px-4 font-medium flex items-center gap-2">
                                <i data-lucide="qr-code" class="w-4 h-4"></i> QRIS
                            </button>
                            <button onclick="selectPayment('DANA', this)"
                                class="payment-button rounded-lg py-2 px-4 font-medium">DANA</button>
                            <button onclick="selectPayment('GoPay', this)"
                                class="payment-button rounded-lg py-2 px-4 font-medium">GoPay</button>
                            <button onclick="selectPayment('BCA', this)"
                                class="payment-button rounded-lg py-2 px-4 font-medium">BCA</button>
                        </div>

                        <div id="payment-details-container" class="mt-4">
                            <div id="payment-QRIS"
                                class="payment-content active p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-center">
                                <p class="font-medium mb-2 dark:text-gray-200">Scan QRIS (Semua E-Wallet & M-Banking)
                                </p>
                                <img src="qrisavee.jpeg" alt="QRIS Code" class="mx-auto rounded-lg" id="qris-image">
                                <p class="text-sm text-gray-600 dark:text-gray-400 mt-2">a.n TOKO FAMSS OK1341772</p>
                            </div>
                            <div id="payment-DANA" class="payment-content p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                <p class="font-medium dark:text-gray-200">Transfer DANA ke:</p>
                                <div class="flex items-center justify-between mt-2">
                                    <p id="dana-account"
                                        class="text-2xl font-bold text-deep-blue dark:text-blue-400 select-all">
                                        0877-6610-7867</p>
                                    <button onclick="copyToClipboard('dana-account')"
                                        class="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 shadow-md flex items-center text-sm">
                                        <i data-lucide="copy" class="w-4 h-4 mr-1"></i> Salin
                                    </button>
                                </div>
                                <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">a.n Felicia</p>
                            </div>
                            <div id="payment-GoPay" class="payment-content p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                <p class="font-medium dark:text-gray-200">Transfer GoPay ke:</p>
                                <div class="flex items-center justify-between mt-2">
                                    <p id="gopay-account"
                                        class="text-2xl font-bold text-deep-blue dark:text-blue-400 select-all">
                                        0877-6610-7867</p>
                                    <button onclick="copyToClipboard('gopay-account')"
                                        class="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 shadow-md flex items-center text-sm">
                                        <i data-lucide="copy" class="w-4 h-4 mr-1"></i> Salin
                                    </button>
                                </div>
                                <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">a.n Avee</p>
                            </div>
                            <div id="payment-BCA" class="payment-content p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                <p class="font-medium dark:text-gray-200">Transfer Bank BCA ke:</p>
                                <div class="flex items-center justify-between mt-2">
                                    <p id="bca-account"
                                        class="text-2xl font-bold text-deep-blue dark:text-blue-400 select-all">123 456
                                        7890</p>
                                    <button onclick="copyToClipboard('bca-account')"
                                        class="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 shadow-md flex items-center text-sm">
                                        <i data-lucide="copy" class="w-4 h-4 mr-1"></i> Salin
                                    </button>
                                </div>
                                <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">a.n Avee</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mt-8">
                <h2 class="text-2xl font-bold mb-4 border-b dark:border-gray-700 pb-2 text-gray-900 dark:text-gray-100">
                    Rincian Biaya</h2>

                <div class="space-y-3 mb-4">
                    <div class="flex justify-between">
                        <span class="text-gray-600 dark:text-gray-400">Paket:</span>
                        <span id="summary-package-name"
                            class="font-semibold text-right dark:text-gray-200">Memuat...</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-600 dark:text-gray-400">Durasi:</span>
                        <span id="summary-duration" class="font-semibold dark:text-gray-200">...</span>
                    </div>

                    <div class="flex justify-between items-center py-2">
                        <span class="text-gray-600 dark:text-gray-400">Jumlah:</span>
                        <div class="flex items-center space-x-3">
                            <button onclick="updateQuantity(-1)"
                                class="p-1 w-8 h-8 bg-gray-200 rounded-full text-lg font-bold hover:bg-gray-300 transition duration-150 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                                aria-label="Kurangi Jumlah">-</button>
                            <span id="quantity-display"
                                class="text-xl font-bold w-6 text-center dark:text-gray-100">1</span>
                            <button onclick="updateQuantity(1)"
                                class="p-1 w-8 h-8 bg-deep-blue text-white rounded-full text-lg font-bold hover:bg-blue-600 transition duration-150"
                                aria-label="Tambah Jumlah">+</button>
                        </div>
                    </div>
                </div>

                <div class="border-t dark:border-gray-700 pt-4 space-y-2">
                    <div class="flex justify-between text-gray-600 dark:text-gray-400">
                        <span>Harga Satuan:</span>
                        <span id="summary-unit-price">Rp0</span>
                    </div>
                    <div class="flex justify-between text-gray-600 dark:text-gray-400">
                        <span>Biaya Admin:</span>
                        <span>Gratis</span>
                    </div>
                    <div class="flex justify-between text-2xl font-bold text-gray-900 dark:text-gray-100 mt-2">
                        <span>TOTAL:</span>
                        <span id="summary-total-price">Rp0</span>
                    </div>
                </div>

                <button onclick="submitOrder()"
                    class="w-full mt-6 py-3 text-lg font-bold text-white bg-accent-wa rounded-xl hover:bg-green-600 transition duration-200 shadow-md transform hover:scale-[1.01]">
                    <i data-lucide="send" class="w-5 h-5 mr-2 inline-block -mt-1"></i>
                    Order via WhatsApp
                </button>
                <p class="text-xs text-gray-500 dark:text-gray-400 text-center mt-3">Anda akan diarahkan ke
                    WhatsApp untuk konfirmasi.</p>
            </div>
        </div>
    </main>

    <!-- DATA JAVASCRIPT (Disalin dari index.html) -->
    <script>
        // ====== [JAVASCRIPT LENGKAP UNTUK order.html] ======

        // --- Variabel Global & Konfigurasi ---
        let selectedApp = null;
        let selectedItem = null; // Ini akan menampung objek produk lengkap dari API
        let currentQuantity = 1;
        let selectedPaymentMethod = 'QRIS'; // Default
        const API_BASE_URL = 'https://avee-backend-production-69b5.up.railway.app/api';

        // --- Fungsi Helper ---
        const formatRupiah = (number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);

        function showNotification(message, type = 'error') {
            // Implementasi notifikasi toast atau alert
            console.log(`[${type.toUpperCase()}] ${message}`);
            const color = type === 'success' ? 'bg-green-500' : 'bg-red-500';
            const container = document.getElementById('notification-container') || document.body;

            const toast = document.createElement('div');
            toast.className = `fixed top-4 right-4 z-[100] p-4 rounded-lg shadow-lg text-white font-medium ${color} transition transform duration-300 translate-x-full`;
            toast.textContent = message;

            container.appendChild(toast);

            // Animasi masuk
            setTimeout(() => toast.classList.remove('translate-x-full'), 10);

            // Animasi keluar
            setTimeout(() => {
                toast.classList.add('opacity-0', 'scale-90');
                toast.addEventListener('transitionend', () => toast.remove());
            }, 4000);
        }

        // --- LOGIKA DARK MODE ---
        function loadTheme() {
            const savedTheme = localStorage.getItem('theme');
            if (savedTheme === 'dark') {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
        }

        function toggleTheme() {
            const html = document.documentElement;
            const isDark = html.classList.toggle('dark');
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
            lucide.createIcons();
        }

        // --- LOGIKA ACCORDION (FAQ) ---
        function initAccordion() {
            const container = document.getElementById('accordion-container');
            if (!container) return;

            container.addEventListener('click', function (e) {
                const questionButton = e.target.closest('.accordion-question');
                if (!questionButton) return;

                const faqItem = questionButton.parentElement;
                const isActive = faqItem.classList.contains('active');

                // Tutup semua item
                container.querySelectorAll('.accordion-item').forEach(item => {
                    item.classList.remove('active');
                });

                // Buka yang diklik (jika sebelumnya tidak aktif)
                if (!isActive) {
                    faqItem.classList.add('active');
                }
                lucide.createIcons();
            });
        }

        function copyToClipboard(elementId) {
            const element = document.getElementById(elementId);
            if (!element) return;

            // Ambil teks tanpa format (menghilangkan spasi berlebih)
            const textToCopy = element.textContent.replace(/[^0-9A-Z]/gi, '');

            // Gunakan modern API (navigator.clipboard)
            if (navigator.clipboard && window.isSecureContext) {
                navigator.clipboard.writeText(textToCopy).then(() => {
                    showNotification('Nomor berhasil disalin!', 'success');
                }).catch(err => {
                    console.error('Could not copy text: ', err);
                    showNotification('Gagal menyalin. Silakan salin manual.', 'error');
                });
            } else {
                // Fallback untuk browser lama atau HTTP (tidak disarankan)
                const textArea = document.createElement("textarea");
                textArea.value = textToCopy;
                textArea.style.position = "fixed";
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                try {
                    document.execCommand('copy');
                    showNotification('Nomor berhasil disalin!', 'success');
                } catch (err) {
                    showNotification('Gagal menyalin. Silakan salin manual.', 'error');
                }
                document.body.removeChild(textArea);
            }
        }

        // --- LOGIKA PEMILIHAN PEMBAYARAN ---
        function selectPayment(method, buttonElement) {
            selectedPaymentMethod = method;

            // Update status tombol
            document.querySelectorAll('.payment-button').forEach(btn => btn.classList.remove('active'));
            buttonElement.classList.add('active');

            // Tampilkan konten yang sesuai
            document.querySelectorAll('.payment-content').forEach(content => content.classList.remove('active'));
            const content = document.getElementById(`payment-${method}`);
            if (content) content.classList.add('active');
        }

        // --- LOGIKA KUANTITAS & HARGA ---
        function updateQuantity(change) {
            if (!selectedItem) return;

            let newQty = currentQuantity + change;

            if (newQty < 1) newQty = 1;
            // Cek stok (contoh)
            if (selectedItem.stock !== null && selectedItem.stock !== undefined && newQty > selectedItem.stock) {
                showNotification(`Stok hanya tersisa ${selectedItem.stock}!`, 'error');
                newQty = selectedItem.stock;
            }
            if (newQty > 10) newQty = 10; // Batas maks umum

            currentQuantity = newQty;
            document.getElementById('quantity-display').textContent = currentQuantity;
            updateTotal();
        }

        function updateTotal() {
            if (!selectedItem) return;
            const unitPrice = selectedItem.price;
            const totalPrice = unitPrice * currentQuantity;

            document.getElementById('summary-unit-price').textContent = formatRupiah(unitPrice);
            document.getElementById('summary-total-price').textContent = formatRupiah(totalPrice);
        }

        // --- FUNGSI KRITIS: Ambil Data dari API Berdasarkan Kode Produk ---
        async function fetchProductDetails(productCode) {
            try {
                const response = await fetch(`${API_BASE_URL}/products?product_code=${productCode}`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();

                // --- KRITIS: Cek struktur data ---
                // Jika API Anda mengembalikan array, Anda mungkin perlu mengambil elemen pertama.
                if (Array.isArray(data) && data.length > 0) {
                    return data[0]; // Ambil objek produk pertama
                } else if (data && data.product_code) {
                    return data; // Jika langsung mengembalikan objek produk
                } else {
                    throw new Error('Data produk tidak ditemukan atau struktur API salah.');
                }

            } catch (error) {
                console.error('Gagal mengambil detail produk:', error);
                return null;
            }
        }

        // --- LOGIKA PENGIRIMAN PESANAN (KE WA DAN DB) ---
        async function submitOrder() {
            if (!selectedItem) {
                showNotification('Gagal: Detail paket belum dimuat.', 'error');
                return;
            }
            if (currentQuantity < 1) {
                showNotification('Kuantitas tidak valid.', 'error');
                return;
            }



            const total = selectedItem.price * currentQuantity;
            const userInfoString = localStorage.getItem('userInfo');
            let userId = null;
            if (userInfoString) {
                try {
                    const userInfo = JSON.parse(userInfoString);
                    userId = userInfo.userId;
                } catch (e) {
                    console.error('Error parsing userInfo:', e);
                    showNotification('Gagal memproses ID pengguna. Coba login ulang.', 'error');
                    // Jika Anda ingin memaksa login untuk order, uncomment baris di bawah:
                    // return; 
                }
            }

            const orderData = {
                userId: userId,
                totalAmount: total,
                paymentMethod: selectedPaymentMethod, // <-- Tambahkan baris ini
                items: [{
                    productId: selectedItem.id,
                    productCode: selectedItem.product_code,
                    quantity: currentQuantity,
                    unitPrice: selectedItem.price
                }]
            };

            try {
                const response = await fetch(`${API_BASE_URL}/orders`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(orderData)
                });

                const data = await response.json();

                if (response.ok) {
                    showNotification(`Pesanan #${data.orderId} berhasil dicatat. Lanjutkan ke WhatsApp.`, 'success');
                    // Lanjutkan ke WhatsApp dengan ID Pesanan dari server
                    generateWaLink(data.orderId);
                } else {
                    showNotification(`Gagal menyimpan order ke DB: ${data.error}`, 'error');
                }
            } catch (error) {
                console.error('API Error:', error);
                showNotification('Gagal terhubung ke server backend.', 'error');
            }
        }

        function generateWaLink(orderId = 'BELUM_DICATAT') {
            if (!selectedItem) return;
            const total = selectedItem.price * currentQuantity;

            // Pastikan nomor WA Anda sudah benar di sini
            const waNumber = '6287766107867';

            const message = `
Halo Avee, saya ingin memesan paket berikut:
--------------------------------
ID Pesanan   : ${orderId}
Produk       : ${selectedApp}
Paket        : ${selectedItem.package_name}
Durasi       : ${selectedItem.duration}
Jumlah       : ${currentQuantity}
Total Harga  : ${formatRupiah(total)}
--------------------------------
Metode Pembayaran : ${selectedPaymentMethod}

Mohon info ketersediaan dan instruksi pembayarannya. Terima Terima kasih!
(Jika sudah bayar, mohon lampirkan bukti transfer di bawah ini)
    `.trim().replace(/\n/g, '%0A').replace(/ /g, '%20');

            const waLink = `https://wa.me/${waNumber}?text=${message}`;

            window.open(waLink, '_blank');
        }


        // --- FUNGSI INISIALISASI HALAMAN ---
        document.addEventListener('DOMContentLoaded', async () => {
            loadTheme();
            lucide.createIcons();
            initAccordion();

            // 1. Baca URL Parameters
            const params = new URLSearchParams(window.location.search);
            const itemCode = params.get('id'); // MENGAMBIL KODE PRODUK (e.g., NETFLIX-6M)

            // --- PERBAIKAN 1: AMBIL NAMA APLIKASI DARI PARAMETER 'app' ---
            const appNameFromUrl = params.get('app');

            if (!itemCode) {
                document.getElementById('product-name').textContent = "Error: Kode Produk Tidak Ditemukan";
                document.getElementById('summary-package-name').textContent = "Error";
                return;
            }

            // 2. Ambil data dari API
            selectedItem = await fetchProductDetails(itemCode);

            if (!selectedItem) {
                document.getElementById('product-name').textContent = "Error: Paket Tidak Valid atau API Gagal";
                document.getElementById('summary-package-name').textContent = "Error";
                return;
            }

            // --- PERBAIKAN 2: SET selectedApp ---
            // Gunakan appName dari URL (lebih cepat) atau dari data API
            selectedApp = appNameFromUrl || selectedItem.app_name;
            // Ambil warna (jika Anda mendefinisikannya di tailwind.config di order.html)
            // Jika tidak, gunakan warna default atau dari data API
            const brandColor = tailwind.config.theme.extend.colors[`brand-${selectedApp.toLowerCase().replace('+', '').replace(' ', '')}`] || '#2563EB';

            // 4. Isi Banner, Logo, dan Judul
            const bannerEl = document.getElementById('product-banner');
            if (bannerEl) {
                bannerEl.style.backgroundImage = `url(${selectedItem.banner_url || 'https://placehold.co/600x200/eeeeee/cccccc?text=Banner+Produk'})`;
                bannerEl.style.backgroundSize = 'cover';
                bannerEl.style.backgroundPosition = 'center';
            }

            const logoEl = document.getElementById('product-logo');
            if (logoEl) {
                logoEl.src = selectedItem.logo_url || 'https://placehold.co/64x64/eeeeee/cccccc?text=Logo';
            }

            document.getElementById('product-name').textContent = selectedApp;
            document.getElementById('product-name').style.color = brandColor;

            // 5. Isi Info Paket
            document.getElementById('info-content').innerHTML = `
        <p><strong>Kode Produk:</strong> ${selectedItem.product_code}</p>
        <p><strong>Paket:</strong> ${selectedItem.package_name}</p>
        <p><strong>Deskripsi:</strong> ${selectedItem.description || 'Informasi tidak tersedia.'}</p>
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-2">Pastikan Anda telah membaca dan memahami detail paket sebelum memesan.</p>
    `;

            // 6. Isi Rincian Biaya
            document.getElementById('summary-package-name').textContent = `${selectedApp} - ${selectedItem.package_name}`;
            document.getElementById('summary-duration').textContent = selectedItem.duration || 'N/A'; // Pertahankan fallback N/A
            document.getElementById('summary-unit-price').textContent = formatRupiah(selectedItem.price);

            // Inisialisasi Kuantitas dan Harga
            currentQuantity = 1;
            document.getElementById('quantity-display').textContent = currentQuantity;
            updateTotal();

            // 7. Atur warna tombol WA
            const waButton = document.querySelector('.bg-accent-wa');
            if (waButton) {
                waButton.style.backgroundColor = brandColor;
            }
        });

        // Daftarkan fungsi global
        window.toggleTheme = toggleTheme;
        window.selectPayment = selectPayment;
        window.updateQuantity = updateQuantity;
        window.generateWaLink = generateWaLink;
        window.submitOrder = submitOrder;
    </script>
</body>

</html>
