const Service = require("../../models/information/serviceModel");
const Balance = require("../../models/transaction/balanceModel");
const Transaction = require("../../models/transaction/transactionModel");
const Topup = require("../../models/transaction/topupModel");

const transaction = async (req, res) => {
    try {
      const email = req.user.email;
      const { service_code } = req.body;
  
      const services = await Service.getAllServices(service_code);
  
      if (!services || services.length === 0) {
        return res.status(404).json({
          status: 1,
          message: "Service ataus Layanan tidak ditemukan.",
        });
      }
  
      const balance = await Balance.fetchBalance(email);
  
      if (balance[0]["balance"] < services[0]["service_tariff"]) {
        return res.status(400).json({
          status: 1,
          message: "Saldo tidak mencukupi untuk layanan yang dipilih.",
          data: balance[0]["balance"],
        });
      }
  
      const userId = await Topup.getUserIdByEmail(email);
      if (!userId) {
        return res.status(404).json({
          status: 1,
          message: "Pengguna dengan email tersebut tidak ditemukan.",
        });
      }
  
      const { invoiceNumber } = await Transaction.createTransaction(
        service_code,
        userId,
        "payment",
        services[0]["service_tariff"]
      );
  
      await Topup.updateUserBalance(userId, "credit", services[0]["service_tariff"]);
  
      const response = {
        invoice_number: invoiceNumber,
        service_code: services[0]["service_code"],
        service_name: services[0]["service_name"],
        transaction_type: "PAYMENT",
        total_amount: services[0]["service_tariff"],
        created_on: new Date().toISOString(),
      };
  
      res.status(200).json({
        status: 0,
        message: "Transaksi berhasil",
        data: response,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        status: 1,
        message: "Terjadi kesalahan saat memproses transaksi.",
        data: [],
      });
    }
  };
  const fetchTransactionHistory = async (req, res) => {
    try {
      const { email } = req.user;
      const { limit } = req.query;
  
      const userId = await Topup.getUserIdByEmail(email);
      if (!userId) {
        return res.status(404).json({
          status: 1,
          message: "Pengguna dengan email tersebut tidak ditemukan.",
        });
      }

      let DataTransactionHistory = await Transaction.fetchTransactionHistory(userId);
  
      DataTransactionHistory = DataTransactionHistory.sort(
        (a, b) => new Date(b.created_on) - new Date(a.created_on)
      );
  
      if (limit) {
        const limitedData = DataTransactionHistory.slice(0, parseInt(limit, 10));
        DataTransactionHistory = limitedData;
      }
  
      const response = {
        offset: 0,
        limit: limit ? parseInt(limit, 10) : DataTransactionHistory.length,
        records: DataTransactionHistory.map((transaction) => ({
          invoice_number: transaction.invoice_number,
          transaction_type: transaction.transaction_type,
          description: transaction.description,
          total_amount: transaction.amount,
          created_on: transaction.created_at,
        })),
      };
  
      res.status(200).json({
        status: 0,
        message: "Get History Berhasil",
        data: response,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        status: 1,
        message: "Terjadi kesalahan saat mengambil data layanan.",
        data: [],
      });
    }
  };
  

module.exports = {
  transaction,
  fetchTransactionHistory
};
