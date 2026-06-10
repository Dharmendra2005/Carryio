export function mapProductForManager(product) {
  return {
    id: product._id,
    _id: product._id,
    name: product.name,
    category: product.category,
    brand: product.brand,
    description: product.description,
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
    cat: product.cat || "bag",
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
