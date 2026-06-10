const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      default: "",
    },
    price: {
      type: Number,
      required: true,
    },
    quantity: {
      type: Number,
      default: 1,
      min: 1,
    },
  },
  { _id: false },
);

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    address: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "address",
      required: true,
    },
    items: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator(items) {
          return items.length > 0;
        },
        message: "At least one order item is required",
      },
    },
    paymentMethod: {
      type: String,
      enum: ["upi", "cod", "card"],
      required: true,
    },
    itemTotal: {
      type: Number,
      required: true,
    },
    platformFee: {
      type: Number,
      default: 35,
    },
    codFee: {
      type: Number,
      default: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["New", "Shipped", "Delivered", "Cancelled", "placed", "paid", "cancelled"],
      default: "New",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.models.order || mongoose.model("order", orderSchema);
