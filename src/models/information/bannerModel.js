const pool = require('../../config/db');

const findAllBanners = async () => {
    const query = 'SELECT * FROM banners';
    const [rows] = await pool.query(query);
    return rows || [];
};

module.exports = {
    findAllBanners,
};
