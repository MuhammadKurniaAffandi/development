const mongoose = require("mongoose");
const Order = require("./model");
const OrderItem = require("../order-item/model");
const CartItem = require("../cart-item/model");
const DeliveryAddress = require("../delivery-address/model");
const { policyFor } = require("../policy");
const { subject } = require("@casl/ability");

// endpoint untuk create order
async function store(req, res, next) {
  // dapatkan policy untuk user yang sedang login
  let policy = policyFor(req.user);
  // cek apakah policy mengizinkan untuk membuat order
  if (!policy.can("create", "Order")) {
    return res.json({
      error: 1,
      message: `tidak bisa create Order karena policy tidak mengizinkan atau sedang tidak login`,
    });
  }

  // jika policy mengizinkan create Order
  try {
    // dapatkan delivery_fee dan delivery_address
    let { delivery_fee, delivery_address } = req.body;
    // dapatkan items dari collection cartItems
    let items = await CartItem.find({ user: req.user._id }).populate("product");

    // cek jika keranjang belanja (cart) masih kosong
    if (!items.length) {
      return res.json({
        error: 1,
        message: `tidak bisa create order karena items masih kosong`,
      });
    }

    let address = await DeliveryAddress.findOne({ _id: delivery_address });

    // membuat object order baru menggunakan new Order
    let order = new Order({
      _id: new mongoose.Types.ObjectId(),
      status: "waiting_payment",
      delivery_fee,
      delivery_address: {
        provinsi: address.provinsi,
        kabupaten: address.kabupaten,
        kecamatan: address.kecamatan,
        kelurahan: address.kelurahan,
        detail: address.detail,
      },
      user: req.user._id,
    });

    // membuat dan menyimpan sekaligus OrderItem
    // berdasarkan data items di keranjang belanja yang sudah kita dapatkan sebelumnya
    let orderItems = await OrderItem.insertMany(
      items.map((item) => ({
        ...item,
        name: item.product.name,
        qty: parseInt(item.qty),
        price: parseInt(item.product.price),
        order: order._id,
        product: item.product._id,
      }))
    );
    // relasikan OrderItem dengan orderItems
    orderItems.forEach((item) => order.order_items.push(item));
    // lalu simpan object order yang sudah dibuat
    await order.save();

    // kemudian hapus semua items yang ada di keranjang belanja
    // karena order sudah berhasil dibuat
    await CartItem.deleteMany({ user: req.user._id });
    // berikan respon ke client jika order sudah berhasil dibuat
    return res.json(order);
  } catch (err) {
    if (err && err.name == "ValidationError") {
      return res.json({
        error: 1,
        message: err.message,
        fields: err.errors,
      });
    }

    next(err);
  }
}

// endpoint untuk daftar order
async function index(req, res, next) {
  // dapatkan policy untuk user yang sedang login
  let policy = policyFor(req.user);
  // cek apakag policy mengizinkan atau tidak untuk melihat Daftar Order
  if (!policy.can("view", "Order")) {
    return res.json({
      error: 1,
      message: `tidak bisa Lihat Daftar Order karena policy tidak mengizinkan atau sedang tidak login`,
    });
  }

  try {
    // dapatkan limit dan skip dari _query string_
    let { limit = 10, skip = 0 } = req.query;
    // hitung jumlah semua order yang diliki oleh user yang sedang login tanpa pagination alias tanpa limit dan skip
    let count = await Order.find({ user: req.user._id }).countDocuments();
    /* dapatkan data order dari MongoDB, dengan pagination,
dengan kata lain setelah kita batasi per halaman dengan limit dan
melewati beberapa data sesuai nilai skip */
    let orders = await Order.find({ user: req.user._id })
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .populate("order_items")
      .sort("-createdAt");
    /* respon ke client, kita mengembalikan data dan count */
    return res.json({
      data: orders.map((order) => order.toJSON({ virtuals: true })),
      count,
    });
  } catch (err) {
    if (err && err.name == "ValidationError") {
      return res.json({
        error: 1,
        message: err.message,
        fields: err.errors,
      });
    }

    next(err);
  }
}

module.exports = {
  store,
  index,
};
