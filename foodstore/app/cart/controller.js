const { policyFor } = require("../policy");
const Product = require("../product/model");
const CartItem = require("../cart-item/model");

// endpoint update keranjang
async function update(req, res, next) {
  let policy = policyFor(req.user);

  if (!policy.can("update", "Cart")) {
    return res.json({
      error: 1,
      message: `You're not allowed to perform this action`,
    });
  }

  try {
    // dapatkan payload dari items
    const { items } = req.body;

    // ekstrak _id dari masing-masing item
    // UPDATE BUG FIXING 23/07/2021
    const productIds = items.map((item) => item.product._id); // <-- dirubah menjadi ini

    // cari data product di MongoDB berdasarkan _id dan simpan sebagai products
    const products = await Product.find({ _id: { $in: productIds } });

    // cari related products
    let cartItems = items.map((item) => {
      // cari related product dari products berdasarkan product._id dan item._id
      // UPDATE BUG FIXING 23/07/2021
      let relatedProduct = products.find(
        (product) => product._id.toString() === item.product._id // <-- dirubah menjadi ini
      );
      // lalu membuat object yang memuat informasi untuk disimpan sebagai CartItem
      return {
        // UPDATE BUG FIXING 23/07/2021
        // _id: relatedProduct._id, <--- _id harus dihapus karena ada bug duplikasi user
        product: relatedProduct._id,
        price: relatedProduct.price,
        image_url: relatedProduct.image_url,
        name: relatedProduct.name,
        user: req.user._id,
        qty: item.qty,
      };
    });

    await CartItem.bulkWrite(
      cartItems.map((item) => {
        return {
          updateOne: {
            filter: { user: req.user._id, product: item.product },
            update: item,
            upsert: true,
          },
        };
      })
    );
    // respon ke client dengan data cartItems yang sudah dibuat
    return res.json(cartItems);
  } catch (err) {
    // (1) tangani kemungkinan _error_
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

// endpoint Daftar Item di Keranjang Belanja / Cart
async function index(req, res, next) {
  let policy = policyFor(req.user);

  if (!policy.can("read", "Cart")) {
    return res.json({
      error: 1,
      message: `You're not allowed to perform this action`,
    });
  }

  try {
    // mencari items dari MongoDB berdasarkan user
    let items = await CartItem.find({ user: req.user._id }).populate("product");
    // respon ke client
    return res.json(items);
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
  update,
  index,
};
