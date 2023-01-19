const router = require("express").Router();
const multer = require("multer");
const tagController = require("./controller");

/* endpoint untuk membuat tag baru */
router.post("/tags", multer().none(), tagController.store);
/* endpoint untuk membuat update tag */
router.put("/tags/:id", multer().none(), tagController.update);
/* endpoint untuk membuat delete tag */
router.delete("/tags/:id", tagController.destroy);

module.exports = router;
