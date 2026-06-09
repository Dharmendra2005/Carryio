const CartItem = require("../models/cartModel");
const userModel = require(".././models/roleModels/userModel");

module.exports.addToCart = async (req, res) => {
  try {
    console.log("Request Body:", req.body);
    console.log("User ID:", req.user.id);
    const userId = req.user.id;

    const { productId, name, price, quantity = 1 } = req.body;
    console.log("Product ID:", productId);

    // Check if already exists
    let item = await CartItem.findOne({
      userId,
      productId,
    });

    if (item) {
      item.quantity += quantity;
      await item.save();
    } else {
      item = await CartItem.create({
        userId,
        productId,
        name,
        price,
        quantity,
      });

      await userModel.findByIdAndUpdate(
        userId,
        {
          $push: {
            cart: item._id,
          },
        },
        { new: true },
      );
    }

    res.status(200).json(item);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

module.exports.getCartItems = async (req, res) => {
  try {
    const items = await CartItem.find({
      userId: req.user.id,
    });

    res.json(items);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};
