const db = require('../../config/db'); // Koneksi database

// Fungsi untuk mendapatkan user_id berdasarkan email
const getUserIdByEmail = async (email) => {
    const [rows] = await db.execute(
        `SELECT id FROM users WHERE email = ?`,
        [email]
    );
    return rows.length > 0 ? rows[0].id : null;
};




// Fungsi untuk memperbarui saldo user
const updateUserBalance = async (userId, type, amount) => {
    try {
        // Validasi jenis transaksi
        if (type !== 'debit' && type !== 'credit') {
            throw new Error('Invalid transaction type. Use "debit" or "credit".');
        }

        // Hitung jumlah yang akan di-update
        const updateAmount = type === 'debit' ? amount : -amount;

        // Lakukan update pada database
        await db.execute(
            `UPDATE users SET balance = balance + ? WHERE id = ?`,
            [updateAmount, userId]
        );

        console.log(`Balance updated successfully for user ${userId}.`);
    } catch (error) {
        console.error(`Error updating balance for user ${userId}:`, error.message);
        throw error; // Lempar error agar bisa ditangani di level pemanggil
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


// Fungsi untuk menyelesaikan proses top-up
const completeTopup = async (email, amount, method, provider) => {
    const userId = await getUserIdByEmail(email);
    if (!userId) {
        throw new Error('User not found');
    }

    // Buat transaksi top-up
    const transactionId = await createTransaction(userId, amount);

    // Simpan detail top-up
    await createTopupDetail(transactionId, method, provider);

    // Perbarui saldo pengguna
    await updateUserBalance(userId, amount);

    return transactionId; // Kembalikan ID transaksi untuk referensi
};

// Export fungsi model
module.exports = {
    getUserIdByEmail,
    updateUserBalance,
    completeTopup,
    getUserBalanceById
};
