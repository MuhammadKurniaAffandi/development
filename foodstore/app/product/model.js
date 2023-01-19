const mongoose = require("mongoose");
const { model, Schema } = mongoose;

const productSchema = Schema(
  {
    name: {
      type: String,
      minlength: [5, "Panjang nama makanan minimal 5 karakter"],
      required: [true, "name must be filled"],
    },

    description: {
      type: String,
      maxlength: [1000, "Panjang deskripsi maksimal 1000 karakter"],
    },

    price: {
      type: Number,
      default: 0,
    },

    image_url: String,

    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
    },

    tags: [{ type: Schema.Types.ObjectId, ref: "Tag" }],
  },
  { timestamps: true }
);

module.exports = model("Product", productSchema);

// /* import package mongoose */
// const mongoose = require("mongoose");

// /* ambil module 'model' dan 'Schema' dari package mongoose */
// const { model, Schema } = mongoose;

// /* schema Product */
// const productSchema = Schema(
//   {
//     name: {
//       type: String,
//       minLength: [3, "Panjang nama makanan minimal 3 karakter"],
//       maxLength: [255, "Panjang nama makanan maksimal 255 karakter"],
//       required: [true, "Nama produk harus diisi"],
//     },

//     description: {
//       type: String,
//       maxLength: [1000, "Panjang deskripsi maksimal 1000 karakter"],
//     },

//     price: {
//       type: Number,
//       default: 0,
//     },

//     image_url: String,

//     /* relasi one-to-one dengan Collection Category */
//     category: {
//       type: Schema.Types.ObjectId,
//       ref: "Category",
//     },
//     /* relasi one-to-many dengan Collections Tag */
//     tags: [
//       {
//         type: Schema.Types.ObjectId,
//         ref: "Tag",
//       },
//     ],
//   },
//   { timestamps: true }
// );

// module.exports = model("Product", productSchema);
