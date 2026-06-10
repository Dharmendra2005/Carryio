const bcrypt = require("bcrypt");
const managerModel = require("../../models/roleModels/managerModel");
const productModel = require("../../models/productModel");
const orderModel = require("../../models/orderModel");
const blacklistTokenModel = require("../../models/blacklistTokenModel");

const generateToken = require("../../utils/generateToken");

function formatRelativeTime(date) {
  const diffMs = Date.now() - new Date(date).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 60) return `${Math.max(minutes, 1)} minutes ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  return `${days} days ago`;
}

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

module.exports.getAllManagers = async (req, res) => {
    try {
        const currentManagerId = String(req.user.id);
        const managers = await managerModel.find().select("-password").sort({ createdAt: 1 });

        const formatted = managers.map((manager, index) => ({
            id: manager._id,
            _id: manager._id,
            name: manager.Username,
            email: manager.email,
            isAdmin: index === 0,
            status: "active",
            since: manager.createdAt
                ? `Since ${new Date(manager.createdAt).getFullYear()}`
                : "Recently joined",
            isSelf: String(manager._id) === currentManagerId,
            avatarBg: "#fdf3ef",
            avatarColor: "#D85A30",
            avatarBorder: "#f5c4b3",
        }));

        return res.status(200).json({ managers: formatted });
    } catch (err) {
        console.error("Error fetching managers:", err);
        return res.status(500).json({ message: "Server error" });
    }
};

module.exports.getDashboardStats = async (req, res) => {
    try {
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfWeek = new Date(startOfToday);
        startOfWeek.setDate(startOfWeek.getDate() - 7);
        const startOfYesterday = new Date(startOfToday);
        startOfYesterday.setDate(startOfYesterday.getDate() - 1);

        const [
            productCount,
            managersCount,
            productsThisWeek,
            ordersToday,
            ordersYesterday,
            monthOrders,
            newOrderCount,
            recentProducts,
            recentOrders,
        ] = await Promise.all([
            productModel.countDocuments(),
            managerModel.countDocuments(),
            productModel.countDocuments({ createdAt: { $gte: startOfWeek } }),
            orderModel.countDocuments({ createdAt: { $gte: startOfToday } }),
            orderModel.countDocuments({
                createdAt: { $gte: startOfYesterday, $lt: startOfToday },
            }),
            orderModel.find({ createdAt: { $gte: startOfMonth } }),
            orderModel.countDocuments({
                status: { $in: ["New", "placed", "paid"] },
            }),
            productModel.find().sort({ createdAt: -1 }).limit(5),
            orderModel.find().sort({ createdAt: -1 }).limit(5),
        ]);

        const monthRevenue = monthOrders.reduce(
            (sum, order) => sum + Number(order.totalAmount || 0),
            0,
        );

        const managerName = req.user?.email?.split("@")[0] || "Manager";

        const activity = [
            ...recentProducts.map((product) => ({
                title: `Product "${product.name}" added`,
                time: `${formatRelativeTime(product.createdAt)} · by ${managerName}`,
                type: product.status === "Draft" ? "muted" : "success",
                createdAt: product.createdAt,
            })),
            ...recentOrders.map((order) => ({
                title: `Order #${String(order._id).slice(-4)} received`,
                time: `${formatRelativeTime(order.createdAt)} · system`,
                type: "default",
                createdAt: order.createdAt,
            })),
        ]
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 6)
            .map(({ title, time, type }) => ({ title, time, type }));

        return res.status(200).json({
            stats: {
                productCount,
                ordersToday,
                monthRevenue,
                managersCount,
                productsThisWeek,
                ordersYesterdayDelta: ordersToday - ordersYesterday,
                newOrderCount,
            },
            recentProducts,
            activity,
        });
    } catch (err) {
        console.error("Error fetching dashboard stats:", err);
        return res.status(500).json({ message: "Server error" });
    }
};
