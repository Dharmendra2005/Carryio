const express = require("express");
const addressController = require("../controllers/addressController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/", authMiddleware.authMiddleware, addressController.createAddress);
router.get("/", authMiddleware.authMiddleware, addressController.getMyAddresses);

module.exports = router;
