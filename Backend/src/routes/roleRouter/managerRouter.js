const express = require('express');

const managerController = require('../../controllers/roleController/managerController');
const authMiddleware = require('../../middlewares/authMiddleware');

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
router.get("/get-me", authMiddleware.authMiddleware, managerController.getManagerProfile);
 



module.exports = router;