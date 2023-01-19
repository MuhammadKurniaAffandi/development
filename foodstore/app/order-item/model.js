const mongoose = require("mongoose");
const { model, Schema } = mongoose;

const orderItemSchema = Schema({
  name: {
    type: String,
    minlength: [5, "Panjang nama makanan minimal 50 karakter"],
    required: [true, "name must be filled"],
  },

  price: {
    type: Number,
    required: [true, "Harga item harus diisi"],
  },

  qty: {
    type: Number,
    required: [true, "Kuantitas harus diisi"],
    min: [1, "Kuantitas minimal 1"],
  },

  product: {
    type: Schema.Types.ObjectId,
    ref: "Product",
  },

  order: {
    type: Schema.Types.ObjectId,
    ref: "Order",
  },
});

module.exports = model("OrderItem", orderItemSchema);

// const mongoose = require("mongoose");
// const { model, Schema } = mongoose;

// const orderItemSchema = Schema({
//   name: {
//     type: String,
//     minlength: [5, "Panjang nama makanan item minimal 5 karakter"],
//     required: [true, "name must be filled"],
//   },
//   qty: {
//     type: Number,
//     required: [true, "qty harus diisi"],
//     min: [1, "minimal qty adalah 1"],
//   },
//   price: {
//     type: Number,
//     default: 0,
//   },
//   image_url: {
//     type: String,
//   },
//   product: {
//     type: Schema.Types.ObjectId,
//     ref: "Product",
//   },
//   order: {
//     type: Schema.Types.ObjectId,
//     ref: "Order",
//   },
// });

// module.exports = model("OrderItem", orderItemSchema);
