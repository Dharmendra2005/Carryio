const express = require('express');

const managerController = require('../../controllers/roleController/managerController');
const authMiddleware = require('../../middleware/auth');

const router = express.Router();

/**
 * @route POST /register
 * @desc Create a new manager
 * @access Public
 */
router.post('/register', managerController.managerRegister);

/**
 * @route POST /login   
 * @desc login a manager
 * @access Public
 */
router.post('/login', managerController.managerLogin);


/**
 * @route POST /logout
 * @desc logout a manager
 * @access Public
 */
router.post('/logout', managerController.managerLogout);


/**
 * @route get /get-me
 * @desc get manager data from token
 * @access Public
 */
router.get("/get-me", authMiddleware, managerController.getManagerProfile);
router.get("/all", authMiddleware, managerController.getAllManagers);
router.get("/dashboard", authMiddleware, managerController.getDashboardStats);

module.exports = router;