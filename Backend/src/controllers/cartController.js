const prisma = require("../config/prisma");

module.exports.addToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, price, quantity = 1 } = req.body;

    // Check if item exists in user's cart
    const existing = await prisma.cartItem.findFirst({
      where: {
        userId,
        name,
      },
    });

    let item;
    if (existing) {
      item = await prisma.cartItem.update({
        where: { id: existing.id },
        data: {
          quantity: existing.quantity + Number(quantity),
        },
      });
    } else {
      item = await prisma.cartItem.create({
        data: {
          userId,
          name: name || "Cart Item",
          price: Number(price || 0),
          quantity: Number(quantity),
        },
      });
    }

    res.status(200).json({ ...item, _id: item.id });
  } catch (err) {
    console.error("Error adding to cart:", err);
    res.status(500).json({
      message: err.message || "Server error",
    });
  }
};

module.exports.getCartItems = async (req, res) => {
  try {
    const items = await prisma.cartItem.findMany({
      where: {
        userId: req.user.id,
      },
      orderBy: { createdAt: "desc" },
    });

    const formatted = items.map((item) => ({ ...item, _id: item.id }));
    res.json(formatted);
  } catch (err) {
    console.error("Error fetching cart items:", err);
    res.status(500).json({
      message: err.message || "Server error",
    });
  }
};
