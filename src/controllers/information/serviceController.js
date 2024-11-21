const { getAllServices } = require('../../models/information/serviceModel');

const fetchAllServices = async (req, res) => {
    try {
        const services = await getAllServices();
        res.status(200).json({
            status: 0,
            message: 'Sukses',
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
    fetchAllServices,
};
