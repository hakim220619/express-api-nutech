const Topup = require("../../models/transaction/topupModel");
const Transaction = require("../../models/transaction/transactionModel");

const createTopup = async (req, res) => {
  try {
    const email = req.user.email;
    const { top_up_amount } = req.body;

    if (!top_up_amount || isNaN(top_up_amount) || top_up_amount <= 0) {
      return res.status(400).json({
        status: 1,
        message: "Jumlah top-up harus berupa angka positif lebih besar dari 0.",
      });
    }

    const userId = await Topup.getUserIdByEmail(email);
    if (!userId) {
      return res.status(404).json({
        status: 1,
        message: "Pengguna dengan email tersebut tidak ditemukan.",
      });
    }

    const transactionId = await Transaction.createTransaction(
      "topup",
      userId,
      "topup",
      top_up_amount
    );

    await Topup.updateUserBalance(userId, "debit", top_up_amount);

    const updatedBalance = await Topup.getUserBalanceById(userId);

    return res.status(201).json({
      status: 0,
      message: "Top Up Balance berhasil.",
      data: {
        balance: updatedBalance,
      },
    });
  } catch (error) {
    console.error("Error saat memproses top-up:", error.message);
    return res.status(500).json({
      status: 1,
      message: "Terjadi kesalahan saat memproses top-up.",
      error: error.message,
    });
  }
};

module.exports = {
  createTopup,
};
