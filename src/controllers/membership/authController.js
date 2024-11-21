const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userModel = require('../../models/membership/userModel');

exports.register = async (req, res) => {
    try {
        const { email, password, first_name, last_name } = req.body;

        if (!email || !password || !first_name || !last_name) {
            return res.status(400).json({
                status: 101,
                message: 'Semua kolom wajib diisi',
                data: null,
            });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                status: 102,
                message: 'Parameter email tidak sesuai format',
                data: null,
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                status: 105,
                message: 'Password harus memiliki minimal 8 karakter',
                data: null,
            });
        }

        const existingUser = await userModel.findUserByEmail(email);
        if (existingUser.length > 0) {
            return res.status(409).json({
                status: 103,
                message: 'Email sudah terdaftar',
                data: null,
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await userModel.createUser(email, first_name, last_name, hashedPassword);

        res.status(200).json({
            status: 0,
            message: 'Registrasi berhasil, silahkan login',
            data: null,
        });
    } catch (error) {
        res.status(500).json({
            status: 104,
            message: 'Terjadi kesalahan pada server',
            data: null,
            error: error.message,
        });
    }
};

// Login User
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validasi input
        if (!email || !password) {
            return res.status(400).json({
                status: 101,
                message: 'Email dan password wajib diisi',
                data: null,
            });
        }

        // Validasi format email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                status: 102,
                message: 'Parameter email tidak sesuai format',
                data: null,
            });
        }

        // Cari pengguna berdasarkan email
        const rows = await userModel.findUserByEmail(email);
        if (rows.length === 0) {
            return res.status(401).json({
                status: 103,
                message: 'Username atau password salah',
                data: null,
            });
        }

        const user = rows[0];

        // Pastikan password pengguna ada di data
        if (!user.password) {
            return res.status(500).json({
                status: 106,
                message: 'Data pengguna tidak valid, kata sandi tidak ditemukan',
                data: null,
            });
        }

        // Verifikasi password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                status: 103,
                message: 'Username atau password salah',
                data: null,
            });
        }

        // Buat token JWT
        const token = jwt.sign(
            { id: user.id, email: user.email, first_name: user.first_name, last_name: user.last_name },
            process.env.JWT_SECRET,
            { expiresIn: '12h' }
        );

        res.status(200).json({
            status: 0,
            message: 'Login Sukses',
            data: { token },
        });
    } catch (error) {
        res.status(500).json({
            status: 105,
            message: 'Terjadi kesalahan pada server',
            data: null,
            error: error.message,
        });
    }
};


