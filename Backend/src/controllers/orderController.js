const prisma = require("../config/prisma");

function toAmount(value) {
  const amount = String(value).replace(/[^0-9.]/g, "");
  return Number(amount || 0);
}

function mapOrderStatus(status) {
  if (status === "placed" || status === "paid" || status === "New") return "New";
  if (status === "shipped" || status === "Shipped") return "Shipped";
  if (status === "delivered" || status === "Delivered") return "Delivered";
  return "Cancelled";
}

function formatOrderDate(date) {
  const created = new Date(date);
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfYesterday.getDate() - 1);

  if (created >= startOfToday) return "Today";
  if (created >= startOfYesterday) return "Yesterday";

  return created.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
  });
}

function formatManagerOrder(order) {
  const customerName = order.user
    ? `${order.user.firstName || ""} ${order.user.lastName || ""}`.trim()
    : "Customer";

  const itemsStr = (order.items || [])
    .map((item) => `${item.name} × ${item.quantity}`)
    .join(", ");

  return {
    id: order.id,
    _id: order.id,
    customer: customerName || "Customer",
    items: itemsStr,
    total: order.totalAmount,
    date: formatOrderDate(order.createdAt),
    status: mapOrderStatus(order.status),
    createdAt: order.createdAt,
  };
}

module.exports.createOrder = async (req, res) => {
  const {
    addressId,
    items,
    product,
    paymentMethod,
    platformFee = 35,
    codFee = 0,
  } = req.body;

  const orderItems =
    Array.isArray(items) && items.length > 0
      ? items
      : product
        ? [{ ...product, quantity: 1 }]
        : [];

  if (!addressId || !paymentMethod || orderItems.length === 0) {
    return res.status(400).json({
      message: "Address, payment method and product are required",
    });
  }

  try {
    const userId = req.user.id;
    const address = await prisma.address.findFirst({
      where: {
        id: addressId,
        userId,
      },
    });

    if (!address) {
      return res.status(404).json({ message: "Address not found" });
    }

    const normalizedItems = orderItems.map((item) => ({
      name: item.name || item.title,
      category: item.category || item.cat || "",
      price: typeof item.price === "number" ? item.price : toAmount(item.price),
      quantity: Number(item.quantity || 1),
    }));

    const itemTotal = normalizedItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const finalCodFee = paymentMethod === "cod" ? Number(codFee || 9) : 0;
    const finalPlatformFee = Number(platformFee || 35);
    const totalAmount = itemTotal + finalPlatformFee + finalCodFee;

    const order = await prisma.order.create({
      data: {
        userId,
        addressId: address.id,
        paymentMethod,
        itemTotal,
        platformFee: finalPlatformFee,
        codFee: finalCodFee,
        totalAmount,
        status: "New",
        items: {
          create: normalizedItems,
        },
      },
      include: {
        items: true,
        address: true,
      },
    });

    return res.status(201).json({
      message: "Order placed successfully",
      order: { ...order, _id: order.id },
    });
  } catch (err) {
    console.error("Error creating order:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports.getMyOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user.id },
      include: {
        address: true,
        items: true,
        shipment: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const formatted = orders.map((order) => ({ ...order, _id: order.id }));

    return res.status(200).json({
      message: "Orders retrieved successfully",
      orders: formatted,
      totalOrders: formatted.length,
    });
  } catch (err) {
    console.error("Error getting user orders:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports.getAllOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
        address: true,
        items: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json({
      orders: orders.map(formatManagerOrder),
      totalOrders: orders.length,
    });
  } catch (err) {
    console.error("Error fetching all orders:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports.updateOrderStatus = async (req, res) => {
  const { status } = req.body;
  const allowed = ["New", "Shipped", "Delivered", "Cancelled"];

  if (!allowed.includes(status)) {
    return res.status(400).json({ message: "Invalid order status" });
  }

  try {
    const order = await prisma.order.update({
      where: { id: req.params.id },
      data: { status },
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
        items: true,
      },
    });

    return res.status(200).json({
      message: "Order status updated",
      order: formatManagerOrder(order),
    });
  } catch (err) {
    console.error("Error updating order status:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
