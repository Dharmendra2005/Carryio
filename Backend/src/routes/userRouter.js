const express = require('express');

const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/', (req, res) => {
    res.send('User route is working!');
});
/**
 * @api {post} /api/users/register
 * @description register a new user expects username, email and password
 * @access Public
 */
router.post('/register', authController.registerUser);

/**
 * @api {post} /api/users/login
 * @description login an existing user expects email and password
 * @access Public
 */
router.post('/login', authController.loginUser);

/**
 * @api {post} /api/users/logout
 * @description logout a user
 * @access Public
 */
router.post('/logout', authController.logout);


/**
 * @routes GET /api/user/profile
 * @description middleware that check the valid token or not and get data from token
 * @access Public
 */

router.get("/get-me", authMiddleware.authMiddleware, authController.getme);


module.exports = router;