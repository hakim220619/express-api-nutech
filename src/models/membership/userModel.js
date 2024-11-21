const pool = require('../../config/db');

const findUserByEmail = async (email) => {
    const query = 'SELECT email, first_name, last_name, password, profile_image FROM users WHERE email = ?';
    const [rows] = await pool.query(query, [email]);
    return rows || [];
};

const createUser = async (email, first_name, last_name, hashedPassword) => {
    const query = `
        INSERT INTO users (email, first_name, last_name, password)
        VALUES (?, ?, ?, ?)
    `;
    await pool.query(query, [email, first_name, last_name, hashedPassword]);
};

const updateUserByEmail = async (email, { first_name, last_name }) => {
    const query = `
        UPDATE users 
        SET first_name = ?, last_name = ?
        WHERE email = ?
    `;
    const [result] = await pool.execute(query, [first_name, last_name, email]);
    return result.affectedRows > 0;
};

const updateUserImageByEmail = async (email, data) => {
    try {
        const query = `
            UPDATE users
            SET profile_image = ?
            WHERE email = ?
        `;
        const [result] = await pool.execute(query, [data.profile_image, email]);

        return result.affectedRows > 0;
    } catch (error) {
        console.error('Error updating user image:', error);
        throw new Error('Database error');
    }
};

module.exports = {
    findUserByEmail,
    createUser,
    updateUserByEmail,
    updateUserImageByEmail
};
