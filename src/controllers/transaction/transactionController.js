const Service = require("../../models/information/serviceModel");
const Balance = require("../../models/transaction/balanceModel");
const Transaction = require("../../models/transaction/transactionModel");
const Topup = require("../../models/transaction/topupModel");

// Controller untuk mendapatkan semua layanan dengan filter
const transaction = async (req, res) => {
    try {
      const email = req.user.email;
      const { service_code } = req.body; // Ambil filter dan email dari body request
  
      // Ambil semua layanan atau filter jika service_code disediakan
      const services = await Service.getAllServices(service_code);
  
      if (!services || services.length === 0) {
        return res.status(404).json({
          status: 1,
          message: "Service ataus Layanan tidak ditemukan.",
        });
      }
  
      // Ambil saldo pengguna berdasarkan email
      const balance = await Balance.fetchBalance(email);
  
      if (balance[0]["balance"] < services[0]["service_tariff"]) {
        return res.status(400).json({
          status: 1,
          message: "Saldo tidak mencukupi untuk layanan yang dipilih.",
          data: balance[0]["balance"], // Mengembalikan saldo pengguna
        });
      }
  
      const userId = await Topup.getUserIdByEmail(email);
      if (!userId) {
        return res.status(404).json({
          status: 1,
          message: "Pengguna dengan email tersebut tidak ditemukan.",
        });
      }
  
      // Buat transaksi dan ambil nomor invoice dari model
      const { invoiceNumber } = await Transaction.createTransaction(
        service_code,
        userId,
        "payment",
        services[0]["service_tariff"]
      );
  
      // Perbarui saldo pengguna
      await Topup.updateUserBalance(userId, "credit", services[0]["service_tariff"]);
  
      // Respons detail transaksi
      const response = {
        invoice_number: invoiceNumber, // Gunakan nomor invoice dari model
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
      const { limit } = req.query; // Ambil limit dari query parameter
  
      // Cari userId berdasarkan email
      const userId = await Topup.getUserIdByEmail(email);
      if (!userId) {
        return res.status(404).json({
          status: 1,
          message: "Pengguna dengan email tersebut tidak ditemukan.",
        });
      }

  
      // Ambil data riwayat transaksi
      let DataTransactionHistory = await Transaction.fetchTransactionHistory(userId);
  
      // Urutkan data berdasarkan tanggal transaksi (created_on) secara descending
      DataTransactionHistory = DataTransactionHistory.sort(
        (a, b) => new Date(b.created_on) - new Date(a.created_on)
      );
  
      // Jika limit diberikan, potong data sesuai limit
      if (limit) {
        const limitedData = DataTransactionHistory.slice(0, parseInt(limit, 10));
        DataTransactionHistory = limitedData;
      }
  console.log(DataTransactionHistory);
  
      // Bentuk respons sesuai format yang diminta
      const response = {
        offset: 0, // Untuk saat ini tetap 0 karena offset tidak diterapkan
        limit: limit ? parseInt(limit, 10) : DataTransactionHistory.length,
        records: DataTransactionHistory.map((transaction) => ({
          invoice_number: transaction.invoice_number,
          transaction_type: transaction.transaction_type, // Ubah ke huruf besar (contoh: TOPUP, PAYMENT)
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
