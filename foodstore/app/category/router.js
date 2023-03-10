// (1) dapatkan router dari Express
const router = require("express").Router();

// (2) import multer untuk menangani form data
const multer = require("multer");

// (3) import category controller
const categoryController = require("./controller");

// (4) endpoint untuk membuat kategori baru
router.post("/categories", multer().none(), categoryController.store);
router.put("/categories/:id", multer().none(), categoryController.update);

// (5) export router agar bisa dipakai di file `app.js`
module.exports = router;

// const router = require("express").Router();
// const multer = require("multer");
// const categoryController = require("./controller");

// /* endpoint untuk membuat kategori baru */
// router.post("/categories", multer().none(), categoryController.store);

// /* endpoint untuk membuat update category */
// router.put("/categories/:id", multer().none(), categoryController.update);

// /* endpoint untuk membuat delete category */
// router.delete("/categories/:id", categoryController.destroy);

// module.exports = router;
