const pool = require('../../config/db');

const fetchTransactionHistory = async (user_id) => {
    const query = 'SELECT * FROM transactions WHERE user_id = ?';
    const [rows] = await pool.query(query, [user_id]);
    return rows || [];
};

const createTransaction = async (desc, userId, transaction_type, amount) => {
    try {
        const [transactionCountResult] = await pool.execute(
            `SELECT COUNT(*) AS count FROM transactions`
        );
        const transactionCount = transactionCountResult[0].count;

        const invoiceNumber = `INV${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${(transactionCount + 1)
            .toString()
            .padStart(3, "0")}`;

        const [result] = await pool.execute(
            `INSERT INTO transactions (user_id, transaction_type, amount,description, invoice_number, status, created_at) 
             VALUES (?, ?, ?, ?, ?, 'completed', NOW())`,
            [userId, transaction_type, amount, desc, invoiceNumber]
        );

        return {
            transaction: result,
            invoiceNumber: invoiceNumber,
        };
    } catch (error) {
        console.error("Error saat membuat transaksi:", error.message);
        throw error;
    }
};
module.exports = {
    fetchTransactionHistory,
    createTransaction
};
