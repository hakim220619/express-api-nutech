const Balance = require('../../models/transaction/balanceModel');

// Controller untuk mendapatkan semua layanan
const getBalance = async (req, res) => {
    try {
        const { email } = req.user;
        const services = await Balance.fetchBalance(email);
        res.status(200).json({
            status: 0,
            message: 'Get Balance Berhasil',
            data: services,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: 1,
            message: 'Terjadi kesalahan saat mengambil data layanan.',
            data: [],
        });
    }
};

module.exports = {
    getBalance,
};
