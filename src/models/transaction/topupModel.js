const db = require('../../config/db');

const getUserIdByEmail = async (email) => {
    const [rows] = await db.execute(
        `SELECT id FROM users WHERE email = ?`,
        [email]
    );
    return rows.length > 0 ? rows[0].id : null;
};

const updateUserBalance = async (userId, type, amount) => {
    try {
        if (type !== 'debit' && type !== 'credit') {
            throw new Error('Invalid transaction type. Use "debit" or "credit".');
        }

        const updateAmount = type === 'debit' ? amount : -amount;

        await db.execute(
            `UPDATE users SET balance = balance + ? WHERE id = ?`,
            [updateAmount, userId]
        );

        console.log(`Balance updated successfully for user ${userId}.`);
    } catch (error) {
        console.error(`Error updating balance for user ${userId}:`, error.message);
        throw error;
    }
};


const getUserBalanceById = async (userId) => {
    try {
        const [rows] = await db.execute(
            `SELECT balance FROM users WHERE id = ?`,
            [userId]
        );
        return rows.length > 0 ? rows[0].balance : null;
    } catch (error) {
        console.error('Error saat mengambil saldo pengguna:', error.message);
        throw error;
    }
};

const completeTopup = async (email, amount, method, provider) => {
    const userId = await getUserIdByEmail(email);
    if (!userId) {
        throw new Error('User not found');
    }

    const transactionId = await createTransaction(userId, amount);

    await createTopupDetail(transactionId, method, provider);

    await updateUserBalance(userId, amount);

    return transactionId;
};

module.exports = {
    getUserIdByEmail,
    updateUserBalance,
    completeTopup,
    getUserBalanceById
};
