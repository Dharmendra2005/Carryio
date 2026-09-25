const bcrypt = require("bcrypt");
const prisma = require("../../config/prisma");
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
  let { Username, username, email, password } = req.body;
  const managerUsername = username || Username;

  if (!managerUsername || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const existingManager = await prisma.manager.findUnique({ where: { email } });

    if (existingManager) {
      return res.status(400).json({ message: "Manager already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newManager = await prisma.manager.create({
      data: {
        username: managerUsername,
        email,
        password: hashedPassword,
      },
    });

    const { password: _, ...managerWithoutPassword } = newManager;
    res.status(201).json({
      message: "Manager registered successfully",
      manager: { ...managerWithoutPassword, _id: newManager.id, Username: newManager.username },
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
    const manager = await prisma.manager.findUnique({ where: { email } });

    if (!manager) {
      return res.status(404).json({ message: "Manager not found" });
    }

    const isMatch = await bcrypt.compare(password, manager.password);

    if (isMatch) {
      let token = generateToken(manager);
      res.cookie("token", token, {
        httpOnly: true,
        sameSite: "lax",
      });
      const { password: _, ...managerWithoutPassword } = manager;
      res.status(200).json({
        message: "Login successful",
        token,
        manager: { ...managerWithoutPassword, _id: manager.id, Username: manager.username },
      });
    } else {
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
  try {
    await prisma.blacklistedToken.create({ data: { token } });
  } catch (e) {
    // ignore if duplicate
  }

  res.clearCookie("token", {
    httpOnly: true,
    sameSite: "lax",
  });
  res.status(200).json({ message: "Logout successful" });
};

module.exports.getManagerProfile = async (req, res) => {
  const managerId = req.user.id;
  try {
    const manager = await prisma.manager.findUnique({
      where: { id: managerId },
    });
    if (!manager) {
      return res.status(404).json({ message: "Manager not found" });
    }
    const { password: _, ...managerWithoutPassword } = manager;
    res.status(200).json({
      manager: { ...managerWithoutPassword, _id: manager.id, Username: manager.username },
    });
  } catch (err) {
    console.error("Error fetching manager profile:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports.getAllManagers = async (req, res) => {
  try {
    const currentManagerId = String(req.user.id);
    const managers = await prisma.manager.findMany({
      orderBy: { createdAt: "asc" },
    });

    const formatted = managers.map((manager, index) => ({
      id: manager.id,
      _id: manager.id,
      name: manager.username,
      email: manager.email,
      isAdmin: index === 0,
      status: "active",
      since: manager.createdAt
        ? `Since ${new Date(manager.createdAt).getFullYear()}`
        : "Recently joined",
      isSelf: String(manager.id) === currentManagerId,
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
      prisma.product.count(),
      prisma.manager.count(),
      prisma.product.count({ where: { createdAt: { gte: startOfWeek } } }),
      prisma.order.count({ where: { createdAt: { gte: startOfToday } } }),
      prisma.order.count({
        where: { createdAt: { gte: startOfYesterday, lt: startOfToday } },
      }),
      prisma.order.findMany({ where: { createdAt: { gte: startOfMonth } } }),
      prisma.order.count({
        where: { status: { in: ["New", "placed", "paid"] } },
      }),
      prisma.product.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
      prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
    ]);

    const monthRevenue = monthOrders.reduce(
      (sum, order) => sum + Number(order.totalAmount || 0),
      0
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
        title: `Order #${String(order.id).slice(-4)} received`,
        time: `${formatRelativeTime(order.createdAt)} · system`,
        type: "default",
        createdAt: order.createdAt,
      })),
    ]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 6)
      .map(({ title, time, type }) => ({ title, time, type }));

    const formattedProducts = recentProducts.map((p) => ({ ...p, _id: p.id }));

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
      recentProducts: formattedProducts,
      activity,
    });
  } catch (err) {
    console.error("Error fetching dashboard stats:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
