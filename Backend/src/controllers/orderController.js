const addressModel = require("../models/addressModel");
const orderModel = require("../models/orderModel");
const userModel = require(".././models/roleModels/userModel");

function toAmount(value) {
  const amount = String(value).replace(/[^0-9]/g, "");
  return Number(amount || 0);
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
    const address = await addressModel.findOne({
      _id: addressId,
      user: req.user.id,
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
      0,
    );
    const finalCodFee = paymentMethod === "cod" ? Number(codFee || 9) : 0;
    const finalPlatformFee = Number(platformFee || 35);
    const totalAmount = itemTotal + finalPlatformFee + finalCodFee;

    const order = await orderModel.create({
      user: req.user.id,
      address: address._id,
      items: normalizedItems,
      paymentMethod,
      itemTotal,
      platformFee: finalPlatformFee,
      codFee: finalCodFee,
      totalAmount,
    });

    await userModel.findByIdAndUpdate(
      req.user.id,
      {
        $push: {
          orders: order._id,
        },
      },
      { new: true },
    );

    return res.status(201).json({
      message: "Order placed successfully",
      order,
    });
  } catch (err) {
    console.error("Error creating order:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports.getMyOrders = async (req, res) => {
  const orders = await orderModel
    .find({ user: req.user.id })
    .populate("address")
    .sort({ createdAt: -1 });

  return res.status(200).json({
    message: "Orders retrieved successfully",
    orders,
    totalOrders: orders.length,
  });
};
