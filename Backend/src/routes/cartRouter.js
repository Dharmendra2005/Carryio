const express = require('express');

const router = express.Router();

const cartController = require("../controllers/cartController");
const authMiddleware = require("../middlewares/authMiddleware");

router.post("/", authMiddleware.authMiddleware, cartController.addToCart);
router.get("/", authMiddleware.authMiddleware, cartController.getCartItems);


module.exports = router;