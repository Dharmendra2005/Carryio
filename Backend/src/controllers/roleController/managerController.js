const bcrypt = require("bcrypt");
const managerModel = require("../../models/roleModels/managerModel");
const blacklistTokenModel = require("../../models/blacklistTokenModel");

const generateToken = require("../../utils/generateToken");

module.exports.managerRegister = async (req, res) => {
  let { Username, email, password } = req.body;

  if (!Username || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const manager = await managerModel.findOne({ email });

  if (manager) {
    return res.status(400).json({ message: "Manager already exists" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newManager = await managerModel.create({
      Username,
      email,
      password: hashedPassword,
    });
    res
      .status(201)
      .json({
        message: "Manager registered successfully",
        manager: newManager,
      });
  } catch (err) {
    console.error("Error registering manager:", err);
    res.status(500).json({ message: "Server error" });
  }
};


module.exports.managerLogin = async (req, res) => {
    let { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
    }

    try {
        const manager = await managerModel.findOne({ email });

        if (!manager) {
            return res.status(404).json({ message: "Manager not found" });
        }

        const isMatch = await bcrypt.compare(password, manager.password);

        if(isMatch){
            let token = generateToken(manager);
            res.cookie("token", token, {
                httpOnly: true,
                sameSite: "lax",
            });
            res.status(200).json({ message: "Login successful", token,  manager });
        }else{
            return res.status(400).json({ message: "Invalid credentials" });
        }
    } catch (err) {
        console.error("Error logging in manager:", err);
        res.status(500).json({ message: "Server error" });
    }
};


module.exports.managerLogout = async (req, res) => {
    const token = req.cookies?.token;

    if (!token) {
        return res.status(400).json({ message: "Token is required for logout" });
    }
    await blacklistTokenModel.create({ token });

    res.clearCookie("token", {
        httpOnly: true,
        sameSite: "lax",
    });
    res.status(200).json({ message: "Logout successful" });
};


module.exports.getManagerProfile = async (req, res) => {
    const managerId = req.user.id;
    try {
        const manager = await managerModel.findById(managerId).select("-password");
        if (!manager) {
            return res.status(404).json({ message: "Manager not found" });
        }
        res.status(200).json({ manager });
    } catch (err) {
        console.error("Error fetching manager profile:", err);
        res.status(500).json({ message: "Server error" });
    }
};
