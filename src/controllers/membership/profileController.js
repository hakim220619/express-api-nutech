const userModel = require('../../models/membership/userModel');
const fs = require('fs');
const path = require('path');

const getProfile = async (req, res) => {
    try {
        const { email } = req.user;
        const user = await userModel.findUserByEmail(email);

        if (!user || user.length === 0) {
            return res.status(404).json({
                status: 1,
                message: 'Pengguna tidak ditemukan',
                data: null,
            });
        }

        const userData = user[0];
        res.status(200).json({
            status: 0,
            message: 'Sukses',
            data: {
                email: userData.email,
                first_name: userData.first_name,
                last_name: userData.last_name,
                profile_image: userData.profile_image || 'https://yoururlapi.com/profile.jpeg',
            },
        });
    } catch (error) {
        res.status(500).json({
            status: 2,
            message: 'Terjadi kesalahan pada server',
            data: null,
            error: error.message,
        });
    }
};

const updateProfile = async (req, res) => {
    try {
        const { email } = req.user;
        const { first_name, last_name } = req.body;

        if (!first_name || !last_name) {
            return res.status(400).json({
                status: 109,
                message: 'Field first_name dan last_name wajib diisi',
                data: null,
            });
        }

        const user = await userModel.findUserByEmail(email);

        if (!user || user.length === 0) {
            return res.status(404).json({
                status: 1,
                message: 'Pengguna tidak ditemukan',
                data: null,
            });
        }

        const userData = user[0];
        const updatedUser = await userModel.updateUserByEmail(email, { first_name, last_name });

        if (!updatedUser) {
            return res.status(500).json({
                status: 2,
                message: 'Gagal memperbarui profil',
                data: null,
            });
        }

        res.status(200).json({
            status: 0,
            message: 'Update Profil berhasil',
            data: {
                email,
                first_name,
                last_name,
                profile_image: userData.profile_image || 'https://yoururlapi.com/profile.jpeg',
            },
        });
    } catch (error) {
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            return res.status(401).json({
                status: 108,
                message: 'Token tidak valid atau kadaluwarsa',
                data: null,
            });
        }

        res.status(500).json({
            status: 2,
            message: 'Terjadi kesalahan pada server',
            data: null,
            error: error.message,
        });
    }
};

const updateProfileImage = async (req, res) => {
    try {
        const { email } = req.user;

        if (!req.file) {
            return res.status(400).json({
                status: 102,
                message: 'File gambar tidak ditemukan',
                data: null,
            });
        }

        const allowedFormats = ['image/jpeg', 'image/png'];
        if (!allowedFormats.includes(req.file.mimetype)) {
            fs.unlinkSync(req.file.path);
            return res.status(400).json({
                status: 102,
                message: 'Format Image tidak sesuai',
                data: null,
            });
        }

        const user = await userModel.findUserByEmail(email);
        if (!user || user.length === 0) {
            return res.status(404).json({
                status: 1,
                message: 'Pengguna tidak ditemukan',
                data: null,
            });
        }

        const userData = user[0];
        const baseUrl = process.env.BASE_URL_API || 'http://localhost:3000';
        const profileImageUrl = `${baseUrl}/uploads/${req.file.filename}`;

        const updatedUser = await userModel.updateUserImageByEmail(email, {
            profile_image: profileImageUrl,
        });

        if (!updatedUser) {
            return res.status(500).json({
                status: 2,
                message: 'Gagal memperbarui gambar profil',
                data: null,
            });
        }

        if (userData.profile_image && userData.profile_image !== `${baseUrl}/profile.jpeg`) {
            const oldImagePath = path.join(__dirname, '../uploads/', path.basename(userData.profile_image));
            if (fs.existsSync(oldImagePath)) {
                fs.unlinkSync(oldImagePath);
            }
        }

        res.status(200).json({
            status: 0,
            message: 'Update Profile Image berhasil',
            data: {
                email,
                first_name: userData.first_name,
                last_name: userData.last_name,
                profile_image: profileImageUrl,
            },
        });
    } catch (error) {
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            return res.status(401).json({
                status: 108,
                message: 'Token tidak valid atau kadaluwarsa',
                data: null,
            });
        }

        res.status(500).json({
            status: 2,
            message: 'Terjadi kesalahan pada server',
            data: null,
            error: error.message,
        });
    }
};

module.exports = {
    getProfile,
    updateProfile,
    updateProfileImage,
};
