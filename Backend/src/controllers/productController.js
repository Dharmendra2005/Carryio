const multer = require("multer");
const path = require("path");
const productModel = require("../models/productModel");
const { getCategoryDefaults } = require("../models/productModel");

// ── Multer setup ──────────────────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/products"),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
    cb(null, unique + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) cb(null, true);
  else cb(new Error("Only image files allowed"), false);
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

// Export so the router can use it as middleware
module.exports.uploadImages = upload.array("images", 3);

// ─────────────────────────────────────────────────────────────────────────────

function normalizeBadge(badge) {
  if (!badge || badge === "None") return null;
  return badge;
}

function parseBoolean(val, fallback = true) {
  if (val === undefined || val === null || val === "") return fallback;
  if (typeof val === "boolean") return val;
  return val === "true" || val === true;
}

function buildProductPayload(body, files, managerId) {
  const published = parseBoolean(body.published, true) && body.status !== "Draft";
  const status = body.status || (published ? "Active" : "Draft");
  const category = body.category || "";
  const defaults = getCategoryDefaults(category);

  // images uploaded via multer — build public URLs
  const images = files && files.length > 0
    ? files.map((f) => `/uploads/products/${f.filename}`)
    : [];

  return {
    name: String(body.name || "").trim(),
    category,
    cat: body.cat || defaults.cat,
    brand: body.brand || "Carryio Originals",
    description: body.description || "",
    price: Number(body.price || 0),
    mrp: body.mrp ? Number(body.mrp) : null,
    stock: Number(body.stock || 0),
    sku: body.sku || "",
    weight: body.weight !== undefined && body.weight !== null && body.weight !== ""
      ? Number(body.weight) : null,
    badge: normalizeBadge(body.badge),
    sizes: body.sizes || "",
    material: body.material || "",
    metaTitle: body.metaTitle || "",
    metaDesc: body.metaDesc || "",
    status,
    published,
    featured: parseBoolean(body.featured, false),
    freeShipping: parseBoolean(body.freeShipping, true),
    cod: parseBoolean(body.cod, true),
    colors: (() => {
      try {
        const c = typeof body.colors === "string" ? JSON.parse(body.colors) : body.colors;
        return Array.isArray(c) ? c : ["#1a1a1a"];
      } catch { return ["#1a1a1a"]; }
    })(),
    images,                          // ← added
    thumbBg: body.thumbBg || defaults.thumbBg,
    icon: body.icon || defaults.icon,
    color: body.color || defaults.color,
    tiIcon: body.tiIcon || defaults.tiIcon,
    createdBy: managerId || null,
  };
}

module.exports.getPublishedProducts = async (req, res) => {
  try {
    const products = await productModel
      .find({ published: true, status: "Active" })
      .sort({ createdAt: -1 });
    return res.status(200).json({ products });
  } catch (err) {
    console.error("Error fetching products:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports.getAllProducts = async (req, res) => {
  try {
    const products = await productModel.find().sort({ createdAt: -1 });
    return res.status(200).json({ products });
  } catch (err) {
    console.error("Error fetching manager products:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports.getProductById = async (req, res) => {
  try {
    const product = await productModel.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    return res.status(200).json({ product });
  } catch (err) {
    console.error("Error fetching product:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports.createProduct = async (req, res) => {
  console.log("body:", req.body);       // ← add this
  console.log("files:", req.files);     // ← add this
  const payload = buildProductPayload(req.body, req.files, req.user?.id);

  if (!payload.name)
    return res.status(400).json({ message: "Product name is required" });
  if (!payload.price || payload.price <= 0)
    return res.status(400).json({ message: "Valid sale price is required" });

  try {
    const product = await productModel.create(payload);
    return res.status(201).json({ message: "Product created", product });
  } catch (err) {
    console.error("Error creating product:", err);
    return res.status(500).json({ message: err.message || "Server error" });
  }
};

module.exports.updateProduct = async (req, res) => {
  const payload = buildProductPayload(req.body, req.files, req.user?.id);
  delete payload.createdBy;

  if (!payload.name)
    return res.status(400).json({ message: "Product name is required" });
  if (!payload.price || payload.price <= 0)
    return res.status(400).json({ message: "Valid sale price is required" });

  // if no new images uploaded, keep existing ones
  if (payload.images.length === 0) {
    delete payload.images;
  }

  try {
    const product = await productModel.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      runValidators: true,
    });
    if (!product) return res.status(404).json({ message: "Product not found" });
    return res.status(200).json({ message: "Product updated", product });
  } catch (err) {
    console.error("Error updating product:", err);
    return res.status(500).json({ message: err.message || "Server error" });
  }
};

module.exports.deleteProduct = async (req, res) => {
  try {
    const product = await productModel.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    return res.status(200).json({ message: "Product deleted" });
  } catch (err) {
    console.error("Error deleting product:", err);
    return res.status(500).json({ message: "Server error" });
  }
};