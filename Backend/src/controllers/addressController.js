const prisma = require("../config/prisma");

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
    const userId = req.user.id;

    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }

    const address = await prisma.address.create({
      data: {
        userId,
        fullName,
        mobile,
        addressLine,
        city,
        state,
        pincode,
        landmark: landmark || "",
        isDefault: Boolean(isDefault),
      },
    });

    return res.status(201).json({
      message: "Address saved successfully",
      address: { ...address, _id: address.id },
    });
  } catch (err) {
    console.error("Error saving address:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports.getMyAddresses = async (req, res) => {
  try {
    const addresses = await prisma.address.findMany({
      where: { userId: req.user.id },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });

    const formatted = addresses.map((addr) => ({ ...addr, _id: addr.id }));

    return res.status(200).json({
      message: "Addresses retrieved successfully",
      addresses: formatted,
    });
  } catch (err) {
    console.error("Error retrieving addresses:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
