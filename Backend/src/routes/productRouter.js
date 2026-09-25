const express = require("express");
const productController = require("../controllers/productController");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

router.get("/", productController.getPublishedProducts);
router.get("/manager/all", authMiddleware, productController.getAllProducts);
router.post("/", authMiddleware, productController.uploadImages, productController.createProduct);  // ← uploadImages added
router.get("/:id", productController.getProductById);
router.put("/:id", authMiddleware, productController.uploadImages, productController.updateProduct);  // ← uploadImages added
router.delete("/:id", authMiddleware, productController.deleteProduct);

module.exports = router;