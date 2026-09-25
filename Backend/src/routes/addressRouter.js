const express = require("express");
const addressController = require("../controllers/addressController");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

router.post("/", authMiddleware, addressController.createAddress);
router.get("/", authMiddleware, addressController.getMyAddresses);

module.exports = router;
