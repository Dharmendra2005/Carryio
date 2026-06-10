const mongoose = require("mongoose");

const CATEGORY_DEFAULTS = {
  "Tote bags": { cat: "tote", thumbBg: "#FAECE7", icon: "👜", color: "#D85A30", tiIcon: "ti-briefcase" },
  Backpacks: { cat: "backpack", thumbBg: "#E1F5EE", icon: "🎒", color: "#0F6E56", tiIcon: "ti-backpack" },
  Wallets: { cat: "wallet", thumbBg: "#EEF2F8", icon: "👛", color: "#185FA5", tiIcon: "ti-wallet" },
  Clutches: { cat: "clutch", thumbBg: "#FBEAF0", icon: "👝", color: "#993556", tiIcon: "ti-heart" },
  "Sling bags": { cat: "sling", thumbBg: "#FAEEDA", icon: "👜", color: "#854F0B", tiIcon: "ti-bag" },
  "Travel bags": { cat: "travel", thumbBg: "#EAF3DE", icon: "🧳", color: "#3B6D11", tiIcon: "ti-luggage" },
};

function getCategoryDefaults(category) {
  return (
    CATEGORY_DEFAULTS[category] || {
      cat: String(category || "bag")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-"),
      thumbBg: "#F7F4F1",
      icon: "👜",
      color: "#D85A30",
      tiIcon: "ti-briefcase",
    }
  );
}

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    category: { type: String, default: "" },
    cat: { type: String, default: "" },
    brand: { type: String, default: "Carryio Originals" },
    description: { type: String, default: "" },
    price: { type: Number, required: true, min: 0 },
    mrp: { type: Number, default: null },
    stock: { type: Number, default: 0, min: 0 },
    sku: { type: String, default: "" },
    weight: { type: Number, default: null },
    badge: { type: String, default: null },
    sizes: { type: String, default: "" },
    material: { type: String, default: "" },
    metaTitle: { type: String, default: "" },
    metaDesc: { type: String, default: "" },
    status: {
      type: String,
      enum: ["Active", "Draft"],
      default: "Active",
    },
    published: { type: Boolean, default: true },
    featured: { type: Boolean, default: false },
    freeShipping: { type: Boolean, default: true },
    cod: { type: Boolean, default: true },
    colors: { type: [String], default: ["#1a1a1a"] },
    thumbBg: { type: String, default: "#F7F4F1" },
    icon: { type: String, default: "👜" },
    color: { type: String, default: "#D85A30" },
    tiIcon: { type: String, default: "ti-briefcase" },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "manager",
      default: null,
    },
  },
  { timestamps: true },
);

if (mongoose.models.product) {
  delete mongoose.models.product;
}

module.exports = mongoose.model("product", productSchema);
module.exports.getCategoryDefaults = getCategoryDefaults;
