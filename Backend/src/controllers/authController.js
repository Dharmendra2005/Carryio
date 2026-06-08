const userModel = require("../models/userModel");
const bcrypt = require("bcrypt");
const generateToken = require('../utils/generateToken');
const blacklistTokenModel = require("../models/blacklistTokenModel");
/**
 * @name registerUser
 * @description register a new user expects username, email and password
 * @access Public
 */
module.exports.registerUser = async (req, res) => {
  let { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const user = await userModel.findOne({ email });
  if (user) {
    return res.status(400).json({ message: "User already exists" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new userModel({
      username,
      email,
      password: hashedPassword,
    });
    await newUser.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error("Error registering user:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * @name loginUser
 * @description login an existing user expects email and password
 * @access Public
 */
module.exports.loginUser = async (req, res) => {
  let { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }
  const user = await userModel.findOne({ email });
  if (!user) {
    return res.status(400).json({ message: "Invalid credentials" });
  }
  bcrypt.compare(password, user.password, (err, isMatch) => {
    if (isMatch) {
      let token = generateToken(user);
      res.cookie("token", token, {
        httpOnly: true,
        sameSite: "lax",
      });
      return res.status(200).json({ message: "Login successful", token, user });
    } else {
      return res.status(400).json({ message: "Invalid credentials" });
    }
  });
};

/**
 * @name logOut 
 * @description logout a user
 * @access Public
 */
module.exports.logout = async (req, res) => {
  let token = req.cookies?.token;
    if(token){
        await blacklistTokenModel.create({token});
    }
    res.clearCookie('token');
    return res.status(200).json({
    message : "User successfully LogOut !!"
  });
}


module.exports.getme = async (req, res) => {
  const user = await userModel.findById(req.user.id);
  return res.status(200).json({
    message : "User data reterive successfully",
    user
  });
}