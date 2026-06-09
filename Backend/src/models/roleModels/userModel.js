const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  cart: [
  {
    type: mongoose.Schema.Types.ObjectId,
    ref: "cartItem",
  },
],
  orders: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "order",
    },
  ],
  contact: String,
  Address: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "address",
    },
  ],
});

module.exports = mongoose.models.user || mongoose.model("user", userSchema);
