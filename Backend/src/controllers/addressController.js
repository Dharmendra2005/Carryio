const addressModel = require("../models/addressModel");
const userModel = require(".././models/roleModels/userModel");

module.exports.createAddress = async (req, res) => {
  const {
    fullName,
    mobile,
    addressLine,
    city,
    state,
    pincode,
    landmark,
    isDefault,
  } = req.body;

  if (!fullName || !mobile || !addressLine || !city || !state || !pincode) {
    return res.status(400).json({ message: "All address fields are required" });
  }

  try {
    if (isDefault) {
      await addressModel.updateMany(
        { user: req.user.id },
        { $set: { isDefault: false } },
      );
    }

    const address = await addressModel.create({
      user: req.user.id,
      fullName,
      mobile,
      addressLine,
      city,
      state,
      pincode,
      landmark,
      isDefault: Boolean(isDefault),
    });

    await userModel.findByIdAndUpdate(
      req.user.id,
      {
        $push: {
          Address: address._id,
        },
      },
      { new: true }
    );

    return res.status(201).json({
      message: "Address saved successfully",
      address,
    });
  } catch (err) {
    console.error("Error saving address:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports.getMyAddresses = async (req, res) => {
  const addresses = await addressModel
    .find({ user: req.user.id })
    .sort({ isDefault: -1, createdAt: -1 });

  return res.status(200).json({
    message: "Addresses retrieved successfully",
    addresses,
  });
};
