const { findAllBanners } = require("../../models/information/bannerModel");

const banner = async (req, res) => {
  try {
    const banners = await findAllBanners();
    res.json({
      status: 0,
      message: "Sukses",
      data: banners,
    });
  } catch (error) {
    console.error("Error fetching banners:", error);
    res.status(500).json({
      status: 1,
      message: "Gagal mendapatkan data",
      error: error.message,
    });
  }
};

module.exports = {
  banner,
};
