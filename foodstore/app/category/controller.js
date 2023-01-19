const Category = require("./model");
const { policyFor } = require("../policy");

async function store(req, res, next) {
  try {
    let policy = policyFor(req.user);

    if (!policy.can("create", "Category")) {
      // <-- can create Category
      return res.json({
        error: 1,
        message: `Anda tidak memiliki akses untuk membuat kategori`,
      });
    }

    let payload = req.body;

    let category = new Category(payload);

    await category.save();

    return res.json(category);
  } catch (err) {
    // (1) tangani error yang disebabkan oleh validasi model
    if (err && err.name === "ValidationError") {
      return res.json({
        error: 1,
        message: err.message,
        fields: err.errors,
      });
    }

    // (2) tangani error yang tidak kita ketahui
    next(err);
  }
}

async function update(req, res, next) {
  try {
    let policy = policyFor(req.user);

    if (!policy.can("update", "Category")) {
      // <-- can update Category
      return res.json({
        error: 1,
        message: `Anda tidak memiliki akses untuk mengupdate kategori`,
      });
    }

    let payload = req.body;

    let category = await Category.findOneAndUpdate(
      { _id: req.params.id },
      payload,
      { new: true, runValidators: true }
    );

    return res.json(category);
  } catch (err) {
    // (1) tangani error yang disebabkan oleh validasi model
    if (err && err.name === "ValidationError") {
      return res.json({
        error: 1,
        message: err.message,
        fields: err.errors,
      });
    }

    // (2) tangani error yang tidak kita ketahui
    next(err);
  }
}

async function destroy(req, res, next) {
  try {
    let policy = policyFor(req.user);

    if (!policy.can("delete", "Category")) {
      // <-- can delete Category
      return res.json({
        error: 1,
        message: `Anda tidak memiliki akses untuk menghapus kategori`,
      });
    }

    // (1) cari dan hapus categori di MongoDB berdasarkan field _id
    let deleted = await Category.findOneAndDelete({ _id: req.params.id });

    // (2) respon ke client dengan data category yang baru saja dihapus
    return res.json(deleted);
  } catch (err) {
    // (3) handle kemungkinan error
    next(err);
  }
}

module.exports = {
  store,
  update,
  destroy,
};

// const { policyFor } = require("../policy");
// const Category = require("./model");

// /* function untuk membuat category baru */
// async function store(req, res, next) {
//   try {
//     /* cek policy */
//     let policy = policyFor(req.user);
//     if (!policy.can("create", "Category")) {
//       return res.json({
//         error: 1,
//         message: "Anda tidak memiliki akses untuk membuat category",
//       });
//     }
//     let payload = req.body;
//     let category = new Category(payload);

//     await category.save();

//     return res.json(category);
//   } catch (error) {
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

// /* function untuk membuat update category */
// async function update(req, res, next) {
//   try {
//     /* cek policy */
//     let policy = policyFor(req.user);
//     if (!policy.can("update", "Category")) {
//       return res.json({
//         error: 1,
//         message: "Anda tidak memiliki akses untuk mengupdate category",
//       });
//     }

//     let payload = req.body;

//     let category = await Category.findOneAndUpdate(
//       { _id: req.params.id },
//       payload,
//       { new: true, runValidators: true }
//     );

//     return res.json(category);
//   } catch (error) {
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

// /* Function untuk membuat delete category */
// async function destroy(req, res, next) {
//   try {
//     /* cek policy */
//     let policy = policyFor(req.user);
//     if (!policy.can("delete", "Category")) {
//       return res.json({
//         error: 1,
//         message: "Anda tidak memiliki akses untuk menghapus category",
//       });
//     }

//     let deleted = await Category.findOneAndDelete({ _id: req.params.id });

//     return res.json(deleted);
//   } catch (error) {
//     next(error);
//   }
// }

// module.exports = {
//   store,
//   update,
//   destroy,
// };
