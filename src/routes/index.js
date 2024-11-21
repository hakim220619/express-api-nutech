const express = require("express");
const multer = require("multer");
const path = require("path");
const router = express.Router();

const { register, login } = require("../controllers/membership/authController");

const {
  getProfile,
  updateProfile,
  updateProfileImage,
} = require("../controllers/membership/profileController");
const authMiddleware = require("../middlewares/autentikasi"); // Middleware untuk autentikasi
const { banner } = require("../controllers/information/bannerController");
const { fetchAllServices } = require("../controllers/information/serviceController");
const { getBalance } = require("../controllers/transaction/balanceController");
const { createTopup } = require('../controllers/transaction/topupController');
const { transaction, fetchTransactionHistory } = require('../controllers/transaction/transactionController');

// Konfigurasi multer untuk pengunggahan file
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Folder penyimpanan file
  },
  filename: (req, file, cb) => {
    // Menyimpan file dengan nama unik
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

// Filter file untuk memastikan hanya JPEG dan PNG yang diizinkan
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true); // Terima file
  } else {
    cb(
      new Error("Format file tidak sesuai. Hanya JPEG dan PNG yang diizinkan."),
      false
    ); // Tolak file
  }
};
const multerErrorHandler = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // Kesalahan yang terkait dengan multer
    return res.status(400).json({
      status: 400,
      message: err.message,
      data: null,
    });
  } else if (err) {
    // Kesalahan lainnya
    return res.status(400).json({
      status: 400,
      message: err.message,
      data: null,
    });
  }
  next();
};

// Inisialisasi multer dengan konfigurasi
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // Batas ukuran file: 5MB
  },
  fileFilter,
});

// Endpoint untuk registrasi
router.post("/register", register);

// Endpoint untuk login
router.post("/login", login);

// Endpoint untuk mendapatkan profil pengguna
router.get("/profile", authMiddleware, getProfile);

// Endpoint untuk memperbarui profil pengguna
router.put("/profile/update", authMiddleware, updateProfile);

// Endpoint untuk memperbarui gambar profil pengguna
router.post(
  "/profile/image",
  authMiddleware,
  upload.single("profile_image"),
  multerErrorHandler,
  updateProfileImage
);

router.get("/banner", banner);
router.get("/services", authMiddleware, fetchAllServices);
router.get("/balance", authMiddleware, getBalance);
router.post('/topup', authMiddleware, createTopup);
router.post('/transaction', authMiddleware, transaction);
router.get('/transaction/history', authMiddleware, fetchTransactionHistory);

module.exports = router;
