function slugifyCategory(categoryName) {
  if (!categoryName) return "tote";
  const catLower = categoryName.trim().toLowerCase();
  const slugMap = {
    "tote bags": "tote",
    "tote bag": "tote",
    "tote": "tote",
    "backpacks": "backpack",
    "backpack": "backpack",
    "wallets": "wallet",
    "wallet": "wallet",
    "clutches": "clutch",
    "clutch": "clutch",
    "sling bags": "sling",
    "sling bag": "sling",
    "sling": "sling",
    "travel bags": "travel",
    "travel bag": "travel",
    "travel": "travel",
  };
  return slugMap[catLower] || catLower.replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "tote";
}

export function mapProductForManager(product) {
  const catSlug = product.cat ? product.cat.toLowerCase() : slugifyCategory(product.category);

  return {
    id: product._id || product.id,
    _id: product._id || product.id,
    name: product.name,
    category: product.category || "General",
    brand: product.brand || "Carryio",
    description: product.description || "",
    price: Number(product.price || 0),
    mrp: product.mrp ?? null,
    stock: Number(product.stock || 0),
    sku: product.sku || "",
    weight: product.weight ?? "",
    badge: product.badge || null,
    status: product.status || "Active",
    published: product.published !== false,
    featured: Boolean(product.featured),
    freeShipping: product.freeShipping !== false,
    cod: product.cod !== false,
    colors: product.colors || ["#1a1a1a"],
    sizes: product.sizes || "",
    material: product.material || "",
    metaTitle: product.metaTitle || "",
    metaDesc: product.metaDesc || "",
    thumbBg: product.thumbBg || "#F7F4F1",
    icon: product.icon || "👜",
    color: product.color || "#D85A30",
    tiIcon: product.tiIcon || "ti-briefcase",
    cat: catSlug,
    images: product.images || [],
    createdAt: product.createdAt,
  };
}

export function mapProductForStore(product) {
  const mapped = mapProductForManager(product);

  return {
    ...mapped,
    price: `₹${mapped.price.toLocaleString("en-IN")}`,
    bg: mapped.thumbBg,
    icon: mapped.tiIcon,
    badge: mapped.badge ? mapped.badge.toLowerCase() : "",
    image: Array.isArray(product.images) ? product.images[0] || "" : "",
  };
}

export function buildProductPayload(form, statusOverride) {
  const published = statusOverride
    ? statusOverride !== "Draft"
    : form.published !== false;

  return {
    name: form.name,
    category: form.category,
    brand: form.brand,
    description: form.description,
    price: Number(form.price || 0),
    mrp: form.mrp ? Number(form.mrp) : null,
    stock: Number(form.stock || 0),
    sku: form.sku,
    weight: form.weight ? Number(form.weight) : null,
    badge: form.badge,
    sizes: form.sizes,
    material: form.material,
    metaTitle: form.metaTitle,
    metaDesc: form.metaDesc,
    status: statusOverride || (published ? "Active" : "Draft"),
    published,
    featured: Boolean(form.featured),
    freeShipping: form.freeShipping !== false,
    cod: form.cod !== false,
    colors: form.colors || ["#1a1a1a"],
  };
}

export function formatRevenue(amount) {
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(1)}L`;
  }
  if (amount >= 1000) {
    return `₹${Math.round(amount / 1000)}k`;
  }
  return `₹${amount}`;
}
