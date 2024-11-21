const pool = require('../../config/db');


// Fungsi untuk mendapatkan semua layanan, dengan opsi filter service_code
const getAllServices = async (service_code = null) => {
    try {
        // Dasar query SQL
        let query = 'SELECT * FROM services';
        const params = [];

        // Tambahkan filter jika service_code disediakan
        if (service_code) {
            query += ' WHERE service_code = ?';
            params.push(service_code);
        }

        // Eksekusi query
        const [rows] = await pool.execute(query, params);
        return rows;
    } catch (error) {
        console.error('Database error:', error);
        throw error;
    }
};

module.exports = {
    getAllServices,
};
