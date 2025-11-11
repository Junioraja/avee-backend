// server.js (PERBAIKAN CORS FINAL)

// Hapus const allowedOrigins = [...];

const corsOptions = {
    // Mengizinkan SEMUA origin (SOLUSI UNIVERSAL)
    origin: '*', 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    // Hapus 'credentials: true' untuk SSL/CORS Universal, karena ini bisa menyebabkan konflik
    // credentials: true, 
    optionsSuccessStatus: 204
};

// Pastikan app.use(cors(corsOptions)) sudah diterapkan setelah const app = express();
app.use(cors(corsOptions));

// ... (sisa kode server.js tetap sama)
