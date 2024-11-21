const pool = require('../../config/db');

const getAllServices = async (service_code = null) => {
    try {
        let query = 'SELECT * FROM services';
        const params = [];

        if (service_code) {
            query += ' WHERE service_code = ?';
            params.push(service_code);
        }

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
