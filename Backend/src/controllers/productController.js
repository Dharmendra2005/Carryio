const multer = require("multer");
const prisma = require("../config/prisma");

// ── Multer setup ──────────────────────────────────────────────────────────────
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) cb(null, true);
  else cb(new Error("Only image files allowed"), false);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

module.exports.uploadImages = upload.array("images", 3);

// ─────────────────────────────────────────────────────────────────────────────

function getCategoryDefaults(category) {
  const cat = (category || "").toLowerCase();
  if (cat.includes("luggage") || cat.includes("trolley")) {
    return { cat: "Luggage", icon: "🧳", color: "#2B5329", tiIcon: "ti-briefcase", thumbBg: "#F0F4EF" };
  }
  if (cat.includes("backpack")) {
    return { cat: "Backpack", icon: "🎒", color: "#1D4ED8", tiIcon: "ti-bag", thumbBg: "#EFF6FF" };
  }
  if (cat.includes("duffel")) {
    return { cat: "Duffels", icon: "👝", color: "#D97706", tiIcon: "ti-briefcase", thumbBg: "#FFFBEB" };
  }
  if (cat.includes("accessory") || cat.includes("accessories")) {
    return { cat: "Accessories", icon: "👛", color: "#7C3AED", tiIcon: "ti-tag", thumbBg: "#F5F3FF" };
  }
  return { cat: "Bags", icon: "👜", color: "#D85A30", tiIcon: "ti-briefcase", thumbBg: "#F7F4F1" };
}

function normalizeBadge(badge) {
  if (!badge || badge === "None") return null;
  return badge;
}

function parseBoolean(val, fallback = true) {
  if (val === undefined || val === null || val === "") return fallback;
  if (typeof val === "boolean") return val;
  return val === "true" || val === true;
}

function imageDocToDataUrl(image) {
  if (!image) return null;
  const rawData = image.data;
  const buffer = Buffer.isBuffer(rawData) ? rawData : Buffer.from(rawData || []);
  const contentType = image.contentType || "image/jpeg";
  return `data:${contentType};base64,${buffer.toString("base64")}`;
}

function serializeProduct(product) {
  if (!product) return null;
  const images = Array.isArray(product.images)
    ? product.images.map(imageDocToDataUrl).filter(Boolean)
    : [];

  return {
    ...product,
    _id: product.id,
    images,
  };
}

function buildProductData(body, managerId) {
  const published = parseBoolean(body.published, true) && body.status !== "Draft";
  const status = body.status || (published ? "Active" : "Draft");
  const category = body.category || "";
  const defaults = getCategoryDefaults(category);

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
    weight: body.weight !== undefined && body.weight !== null && body.weight !== "" ? Number(body.weight) : null,
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
      } catch {
        return ["#1a1a1a"];
      }
    })(),
    dispatch: body.dispatch || "Ships within 24 hours",
    delivery: body.delivery || "2-5 business days across India",
    returnPolicy: body.returnPolicy || "Easy 30-day return available",
    colorName: body.colorName || "Classic tan",
    thumbBg: body.thumbBg || defaults.thumbBg,
    icon: body.icon || defaults.icon,
    color: body.color || defaults.color,
    tiIcon: body.tiIcon || defaults.tiIcon,
    createdById: managerId || null,
  };
}

module.exports.getPublishedProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: { published: true, status: "Active" },
      include: { images: true },
      orderBy: { createdAt: "desc" },
    });
    return res.status(200).json({ products: products.map(serializeProduct) });
  } catch (err) {
    console.error("Error fetching published products:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports.getAllProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      include: { images: true },
      orderBy: { createdAt: "desc" },
    });
    return res.status(200).json({ products: products.map(serializeProduct) });
  } catch (err) {
    console.error("Error fetching all products:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports.getProductById = async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: { images: true },
    });
    if (!product) return res.status(404).json({ message: "Product not found" });
    return res.status(200).json({ product: serializeProduct(product) });
  } catch (err) {
    console.error("Error fetching product by ID:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports.createProduct = async (req, res) => {
  const data = buildProductData(req.body, req.user?.id);

  if (!data.name) return res.status(400).json({ message: "Product name is required" });
  if (!data.price || data.price <= 0) return res.status(400).json({ message: "Valid sale price is required" });

  try {
    const product = await prisma.product.create({
      data: {
        ...data,
        images: req.files && req.files.length > 0 ? {
          create: req.files.map((file) => ({
            data: file.buffer,
            contentType: file.mimetype,
            originalName: file.originalname || "",
          })),
        } : undefined,
      },
      include: { images: true },
    });

    return res.status(201).json({ message: "Product created", product: serializeProduct(product) });
  } catch (err) {
    console.error("Error creating product:", err);
    return res.status(500).json({ message: err.message || "Server error" });
  }
};

module.exports.updateProduct = async (req, res) => {
  const data = buildProductData(req.body, req.user?.id);
  delete data.createdById;

  if (!data.name) return res.status(400).json({ message: "Product name is required" });
  if (!data.price || data.price <= 0) return res.status(400).json({ message: "Valid sale price is required" });

  try {
    const productId = req.params.id;

    if (req.files && req.files.length > 0) {
      await prisma.productImage.deleteMany({ where: { productId } });
    }

    const product = await prisma.product.update({
      where: { id: productId },
      data: {
        ...data,
        images: req.files && req.files.length > 0 ? {
          create: req.files.map((file) => ({
            data: file.buffer,
            contentType: file.mimetype,
            originalName: file.originalname || "",
          })),
        } : undefined,
      },
      include: { images: true },
    });

    return res.status(200).json({ message: "Product updated", product: serializeProduct(product) });
  } catch (err) {
    console.error("Error updating product:", err);
    return res.status(500).json({ message: err.message || "Server error" });
  }
};

module.exports.deleteProduct = async (req, res) => {
  try {
    await prisma.product.delete({
      where: { id: req.params.id },
    });
    return res.status(200).json({ message: "Product deleted" });
  } catch (err) {
    console.error("Error deleting product:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
