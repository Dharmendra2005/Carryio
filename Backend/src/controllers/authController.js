const bcrypt = require("bcrypt");
const prisma = require("../config/prisma");
const generateToken = require("../utils/generateToken");

/**
 * @name registerUser
 * @description register a new user expects firstName, lastName, email and password
 * @access Public
 */
module.exports.registerUser = async (req, res) => {
  let { firstName, lastName, email, password } = req.body;

  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        password: hashedPassword,
      },
    });

    let token = generateToken(newUser);
    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax",
    });

    const { password: _, ...userWithoutPassword } = newUser;
    res.status(201).json({
      message: "User registered successfully",
      token,
      user: { ...userWithoutPassword, _id: newUser.id },
    });
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

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    let token = generateToken(user);
    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax",
    });

    const { password: _, ...userWithoutPassword } = user;
    return res.status(200).json({
      message: "Login successful",
      token,
      user: { ...userWithoutPassword, _id: user.id },
    });
  } catch (err) {
    console.error("Error logging in user:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * @name logout
 * @description logout a user
 * @access Public
 */
module.exports.logout = async (req, res) => {
  let token = req.cookies?.token;
  if (token) {
    try {
      await prisma.blacklistedToken.create({ data: { token } });
    } catch (e) {
      // ignore if duplicate
    }
  }
  res.clearCookie("token");
  return res.status(200).json({
    message: "User successfully LogOut !!",
  });
};

module.exports.getme = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const { password: _, ...userWithoutPassword } = user;
    return res.status(200).json({
      message: "User data retrieved successfully",
      user: { ...userWithoutPassword, _id: user.id },
    });
  } catch (err) {
    console.error("Error retrieving user:", err);
    res.status(500).json({ message: "Server error" });
  }
};
