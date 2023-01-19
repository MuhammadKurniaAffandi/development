const fs = require("fs");
const path = require("path");

const Product = require("./model");
const Category = require("../category/model");
const Tag = require("../tag/model");
const config = require("../config");
const { policyFor } = require("../policy");

async function index(req, res, next) {
  try {
    let { limit = 10, skip = 0, q = "", category = "", tags = [] } = req.query;

    let criteria = {};

    if (q.length) {
      // --- gabungkan dengan criteria --- //
      criteria = {
        ...criteria,
        name: { $regex: `${q}`, $options: "i" },
      };
    }

    if (category.length) {
      category = await Category.findOne({
        name: { $regex: `${category}`, $options: "i" },
      });

      if (category) {
        criteria = { ...criteria, category: category._id };
      }
    }

    if (tags.length) {
      tags = await Tag.find({ name: { $in: tags } });
      criteria = { ...criteria, tags: { $in: tags.map((tag) => tag._id) } };
    }

    let count = await Product.find(criteria).countDocuments();

    let products = await Product.find(criteria)
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .populate("category")
      .populate("tags");

    return res.json({ data: products, count });
  } catch (err) {
    next(err);
  }
}

async function store(req, res, next) {
  try {
    let policy = policyFor(req.user);

    if (!policy.can("create", "Product")) {
      return res.json({
        error: 1,
        message: `Anda tidak memiliki akses untuk membuat produk`,
      });
    }

    let payload = req.body;

    if (payload.category) {
      let category = await Category.findOne({
        name: { $regex: payload.category, $options: "i" },
      });

      if (category) {
        payload = { ...payload, category: category._id };
      } else {
        delete payload.category;
      }
    }

    if (payload.tags && payload.tags.length) {
      let tags = await Tag.find({ name: { $in: payload.tags } });

      // (1) cek apakah tags membuahkan hasil
      if (tags.length) {
        // (2) jika ada, maka kita ambil `_id` untuk masing-masing `Tag` dan gabungkan dengan payload
        payload = { ...payload, tags: tags.map((tag) => tag._id) };
      }
    }

    if (req.file) {
      let tmp_path = req.file.path;
      let originalExt =
        req.file.originalname.split(".")[
          req.file.originalname.split(".").length - 1
        ];
      let filename = req.file.filename + "." + originalExt;
      let target_path = path.resolve(
        config.rootPath,
        `public/upload/${filename}`
      );

      const src = fs.createReadStream(tmp_path);
      const dest = fs.createWriteStream(target_path);
      src.pipe(dest);

      src.on("end", async () => {
        try {
          let product = new Product({ ...payload, image_url: filename });
          await product.save();
          return res.json(product);
        } catch (err) {
          fs.unlinkSync(target_path);

          if (err && err.name === "ValidationError") {
            return res.json({
              error: 1,
              message: err.message,
              fields: err.errors,
            });
          }

          next(err);
        }
      });

      src.on("error", async () => {
        next(err);
      });
    } else {
      let product = new Product(payload);
      await product.save();
      return res.json(product);
    }
  } catch (err) {
    // ----- cek tipe error ---- //
    if (err && err.name === "ValidationError") {
      return res.json({
        error: 1,
        message: err.message,
        fields: err.errors,
      });
    }

    next(err);
  }
}

async function update(req, res, next) {
  try {
    let policy = policyFor(req.user);

    if (!policy.can("update", "Product")) {
      return res.json({
        error: 1,
        message: `Anda tidak memiliki akses untuk mengupdate produk`,
      });
    }

    let payload = req.body;

    if (payload.category) {
      let category = await Category.findOne({
        name: { $regex: payload.category, $options: "i" },
      });

      if (category) {
        payload = { ...payload, category: category._id };
      } else {
        delete payload.category;
      }
    }

    if (payload.tags && payload.tags.length) {
      let tags = await Tag.find({ name: { $in: payload.tags } });

      // (1) cek apakah tags membuahkan hasil
      if (tags.length) {
        // (2) jika ada, maka kita ambil `_id` untuk masing-masing `Tag` dan gabungkan dengan payload
        payload = { ...payload, tags: tags.map((tag) => tag._id) };
      }
    }

    if (req.file) {
      let tmp_path = req.file.path;
      let originalExt =
        req.file.originalname.split(".")[
          req.file.originalname.split(".").length - 1
        ];
      let filename = req.file.filename + "." + originalExt;
      let target_path = path.resolve(
        config.rootPath,
        `public/upload/${filename}`
      );

      const src = fs.createReadStream(tmp_path);
      const dest = fs.createWriteStream(target_path);
      src.pipe(dest);

      src.on("end", async () => {
        try {
          let product = await Product.findOne({ _id: req.params.id });

          let currentImage = `${config.rootPath}/public/upload/${product.image_url}`;

          if (fs.existsSync(currentImage)) {
            fs.unlinkSync(currentImage);
          }

          product = await Product.findOneAndUpdate(
            { _id: req.params.id },
            { ...payload, image_url: filename },
            { new: true, runValidators: true }
          );

          return res.json(product);
        } catch (err) {
          // ----- cek tipe error ---- //
          if (err && err.name === "ValidationError") {
            return res.json({
              error: 1,
              message: err.message,
              fields: err.errors,
            });
          }

          next(err);
        }
      });

      src.on("error", async () => {
        next(err);
      });
    } else {
      let product = await Product.findOneAndUpdate(
        { _id: req.params.id },
        payload,
        { new: true, runValidators: true }
      );

      return res.json(product);
    }
  } catch (err) {
    // ----- cek tipe error ---- //
    if (err && err.name === "ValidationError") {
      return res.json({
        error: 1,
        message: err.message,
        fields: err.errors,
      });
    }

    next(err);
  }
}

async function destroy(req, res, next) {
  try {
    let policy = policyFor(req.user);

    if (!policy.can("delete", "Product")) {
      // <-- can delete
      return res.json({
        error: 1,
        message: `Anda tidak memiliki akses untuk menghapus produk`,
      });
    }

    let product = await Product.findOneAndDelete({ _id: req.params.id });

    let currentImage = `${config.rootPath}/public/upload/${product.image_url}`;

    if (fs.existsSync(currentImage)) {
      fs.unlinkSync(currentImage);
    }

    return res.json(product);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  index,
  update,
  store,
  destroy,
};
// /* import model 'Product' */
// const { error } = require("console");
// const fs = require("fs");
// const path = require("path");
// const config = require("../config");
// const Product = require("./model");
// /* import Category dari model Schema Category */
// const Category = require("../category/model");
// /* import Tag dari model Schema Tag */
// const Tag = require("../tags/model");
// /* import policyFor */
// const { policyFor } = require("../policy");

// /* function untuk membuat Store Product atau membuat Product Baru */
// async function store(req, res, next) {
//   try {
//     /* cek policy */
//     let policy = policyFor(req.user);
//     if (!policy.can("create", "Product")) {
//       return res.json({
//         error: 1,
//         message: "Anda tidak memiliki akses untuk membuat produk",
//       });
//     }

//     /* menangkap data form yang dikirimkan oleh client sebagai variabel payload  */
//     let payload = req.body;

//     /* pengecekan request Relasi Product dengan Category */
//     if (payload.category) {
//       let category = await Category.findOne({
//         name: { $regex: payload.category, $options: "i" },
//       });
//       /* pengecekan kriteria Category */
//       if (category) {
//         payload = { ...payload, category: category._id };
//       } else {
//         delete payload.category;
//       }
//     }

//     /* pengecekan request relasi Product dengan Tag */
//     if (payload.tags && payload.tags.length) {
//       let tags = await Tag.find({ name: { $in: payload.tags } });
//       if (tags.length) {
//         payload = { ...payload, tags: tags.map((tag) => tag._id) };
//       }
//     }

//     /* pengecekan request file */
//     if (req.file) {
//       let tmp_path = req.file.path;
//       let originExt =
//         req.file.originalname.split(".")[
//           req.file.originalname.split(".").length - 1
//         ];
//       let filename = req.file.filename + "." + originExt;
//       let target_path = path.resolve(
//         config.rootPath,
//         `public/upload/${filename}`
//       );

//       const src = fs.createReadStream(tmp_path);
//       const dest = fs.createWriteStream(target_path);
//       src.pipe(dest);

//       src.on("end", async () => {
//         try {
//           let product = new Product({ ...payload, image_url: filename });
//           await product.save();
//           return res.json(product);
//         } catch (error) {
//           /* jika error, hapus file yang sudah terupload pada direktori */
//           fs.unlinkSync(target_path);

//           /* cek apakah error disebabkan validasi MongoDB */
//           if (error && error.name === "ValidationError") {
//             return res.json({
//               error: 1,
//               message: error.message,
//               fields: error.errors,
//             });
//           }
//           next(error);
//         }
//       });
//     } else {
//       let product = new Product(payload);
//       await product.save();
//       return res.json(product);
//     }
//   } catch (error) {
//     /* cek tipe error */
//     if (error && error.name === "ValidationError") {
//       return res.json({
//         error: 1,
//         message: error.message,
//         fields: error.errors,
//       });
//     }
//     next(error);
//   }
// }

// /* function untuk membuat Update Product */
// async function update(req, res, next) {
//   try {
//     /* cek policy */
//     let policy = policyFor(req.user);
//     if (!policy.can("update", "Product")) {
//       return res.json({
//         error: 1,
//         message: "Anda tidak memiliki akses untuk mengupdate produk",
//       });
//     }
//     /* menangkap data form yang dikirimkan oleh client sebagai variabel payload  */
//     let payload = req.body;
//     /* pengecekan request Relasi Product dengan Category */
//     if (payload.category) {
//       let category = await Category.findOne({
//         name: { $regex: payload.category, $options: "i" },
//       });
//       /* pengecekan kriteria Category */
//       if (category) {
//         payload = { ...payload, category: category._id };
//       } else {
//         delete payload.category;
//       }
//     }

//     /* pengecekan request relasi Product dengan Tag */
//     if (payload.tags && payload.tags.length) {
//       let tags = await Tag.find({ name: { $in: payload.tags } });
//       if (tags.length) {
//         payload = { ...payload, tags: tags.map((tag) => tag._id) };
//       }
//     }

//     /* pengecekan request file */
//     if (req.file) {
//       let tmp_path = req.file.path;
//       let originExt =
//         req.file.originalname.split(".")[
//           req.file.originalname.split(".").length - 1
//         ];
//       let filename = req.file.filename + "." + originExt;
//       let target_path = path.resolve(
//         config.rootPath,
//         `public/upload/${filename}`
//       );

//       const src = fs.createReadStream(tmp_path);
//       const dest = fs.createWriteStream(target_path);
//       src.pipe(dest);

//       src.on("end", async () => {
//         try {
//           let product = await Product.findOne({ _id: req.params.id });

//           let currentImage = `${config.rootPath}/public/upload/${product.image_url}`;

//           if (fs.existsSync(currentImage)) {
//             fs.unlinkSync(currentImage);
//           }

//           product = await Product.findOneAndUpdate(
//             { _id: req.params.id },
//             { ...payload, image_url: filename },
//             { new: true, runValidators: true }
//           );

//           return res.json(product);
//         } catch (error) {
//           /* jika error, hapus file yang sudah terupload pada direktori */
//           fs.unlinkSync(target_path);

//           /* cek apakah error disebabkan validasi MongoDB */
//           if (error && error.name === "ValidationError") {
//             return res.json({
//               error: 1,
//               message: error.message,
//               fields: error.errors,
//             });
//           }
//           next(error);
//         }
//       });

//       src.on("error", async () => {
//         next(error);
//       });
//     } else {
//       let product = new Product.findOneAndUpdate(
//         {
//           _id: req.params.id,
//         },
//         payload,
//         { new: true, runValidators: true }
//       );
//       return res.json(product);
//     }
//   } catch (error) {
//     /* cek tipe error */
//     if (error && error.name === "ValidationError") {
//       return res.json({
//         error: 1,
//         message: error.message,
//         fields: error.errors,
//       });
//     }
//     next(error);
//   }
// }

// /* Function untuk membuat daftar product atau melihat semua data product */
// async function index(req, res, next) {
//   try {
//     let { limit = 10, skip = 0, q = "", category = "", tags = [] } = req.query;
//     let criteria = {};
//     /* pengecekan keyword q */
//     if (q.length) {
//       criteria = { ...criteria, name: { $regex: `${q}`, $options: "i" } };
//     }

//     /* pengecekan keyword category */
//     if (category.length) {
//       category = await Category.findOne({
//         name: { $regex: `${category}`, $options: "i" },
//       });
//       if (category) {
//         criteria = { ...criteria, category: category._id };
//       }
//     }

//     /* pengecekan keyword tags */
//     if (tags.length) {
//       tags = await Tag.find({ name: { $in: tags } });
//       criteria = { ...criteria, tags: { $in: tags.map((tag) => tag._id) } };
//     }

//     let count = await Product.find(criteria).countDocuments();
//     let products = await Product.find(criteria)
//       .limit(parseInt(limit))
//       .skip(parseInt(skip))
//       .populate("category")
//       .populate("tags");
//     return res.json({ data: products, count });
//   } catch (error) {
//     next(error);
//   }
// }

// /* Function untuk membuat delete Product */
// async function destroy(req, res, next) {
//   try {
//     /* cek policy */
//     let policy = policyFor(req.user);
//     if (!policy.can("delete", "Product")) {
//       return res.json({
//         error: 1,
//         message: "Anda tidak memiliki akses untuk menghapus produk",
//       });
//     }

//     let product = await Product.findOneAndDelete({ _id: req.params.id });
//     let currentImage = `${config.rootPath}/public/upload/${product.image_url}`;

//     if (fs.existsSync(currentImage)) {
//       fs.unlinkSync(currentImage);
//     }

//     return res.json(product);
//   } catch (error) {
//     next(error);
//   }
// }

// module.exports = {
//   index,
//   update,
//   store,
//   destroy,
// };
