const pool = require('../../config/db');

const fetchBalance = async (email) => {
    const query = 'SELECT balance FROM users WHERE email = ?';
    const [rows] = await pool.query(query, [email]);
    return rows || [];
};
module.exports = {
    fetchBalance,
};
