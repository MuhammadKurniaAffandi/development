// file app/product/router.js
const router = require("express").Router();
const multer = require("multer");
const os = require("os");

const productController = require("./controller");

router.get("/products", productController.index);
router.post(
  "/products",
  multer({ dest: os.tmpdir() }).single("image"),
  productController.store
);
router.put(
  "/products/:id",
  multer({ dest: os.tmpdir() }).single("image"),
  productController.update
);
router.delete("/products/:id", productController.destroy);

module.exports = router;
// /* import router dari express */
// const router = require("express").Router();
// /* require multer */
// const multer = require("multer");
// const os = require("os");

// /* import product controller */
// const productController = require("./controller");

// /* route daftar product */
// router.get("/products", productController.index);

// /* route upload product */
// router.post(
//   "/products",
//   multer({ dest: os.tmpdir() }).single("image"),
//   productController.store
// );

// /* route update product */
// router.put(
//   "/products/:id",
//   multer({ dest: os.tmpdir() }).single("image"),
//   productController.update
// );

// /* route untuk delete product */
// router.delete("/products/:id", productController.destroy);
// /* export router */
// module.exports = router;
