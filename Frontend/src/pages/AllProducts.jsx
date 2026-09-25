import { useState, useMemo, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "./AllProducts.css";

const CATEGORIES = [
  { label: "All products", value: "all", icon: "ti-apps" },
  { label: "Tote bags", value: "tote", icon: "ti-shopping-bag" },
  { label: "Backpacks", value: "backpack", icon: "ti-backpack" },
  { label: "Wallets", value: "wallet", icon: "ti-wallet" },
  { label: "Clutches", value: "clutch", icon: "ti-briefcase" },
  { label: "Sling bags", value: "sling", icon: "ti-bag" },
  { label: "Travel bags", value: "travel", icon: "ti-luggage" },
];

function slugify(value) {
  return (value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function AllProducts({
  products = [],
  loading = false,
  onProductClick,
  onAddToCart,
}) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Read initial category from URL query param if present
  const initialCat = searchParams.get("cat") || "all";
  const [activeCategory, setActiveCategory] = useState(initialCat);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("featured");
  const [badgeFilter, setBadgeFilter] = useState("all");

  useEffect(() => {
    const catFromUrl = searchParams.get("cat");
    if (catFromUrl && catFromUrl !== activeCategory) {
      setActiveCategory(catFromUrl);
    }
  }, [searchParams]);

  const handleCategorySelect = (catValue) => {
    setActiveCategory(catValue);
    if (catValue === "all") {
      searchParams.delete("cat");
    } else {
      searchParams.set("cat", catValue);
    }
    setSearchParams(searchParams);
  };

  // Compute category item counts dynamically
  const categoryCounts = useMemo(() => {
    const counts = { all: products.length };
    CATEGORIES.forEach((c) => {
      if (c.value !== "all") {
        counts[c.value] = products.filter(
          (p) => (p.cat || "").toLowerCase() === c.value
        ).length;
      }
    });
    return counts;
  }, [products]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Category filter
    if (activeCategory !== "all") {
      result = result.filter(
        (p) => (p.cat || "").toLowerCase() === activeCategory
      );
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name?.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q)
      );
    }

    // Badge filter
    if (badgeFilter === "new") {
      result = result.filter((p) => (p.badge || "").toLowerCase() === "new");
    } else if (badgeFilter === "hot") {
      result = result.filter((p) => (p.badge || "").toLowerCase() === "hot");
    }

    // Sorting logic
    if (sortBy === "price-low") {
      result.sort((a, b) => (a.priceRaw || parseFloat(String(a.price).replace(/[^0-9.]/g, '')) || 0) - (b.priceRaw || parseFloat(String(b.price).replace(/[^0-9.]/g, '')) || 0));
    } else if (sortBy === "price-high") {
      result.sort((a, b) => (b.priceRaw || parseFloat(String(b.price).replace(/[^0-9.]/g, '')) || 0) - (a.priceRaw || parseFloat(String(a.price).replace(/[^0-9.]/g, '')) || 0));
    } else if (sortBy === "name-asc") {
      result.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    } else if (sortBy === "newest") {
      result.reverse();
    }

    return result;
  }, [products, activeCategory, searchQuery, sortBy, badgeFilter]);

  const activeCategoryLabel =
    CATEGORIES.find((c) => c.value === activeCategory)?.label || "All products";

  return (
    <div className="catalog-page">
      {/* ── HERO BANNER ── */}
      <div className="catalog-hero">
        <div className="catalog-hero-inner">
          <div className="catalog-breadcrumb">
            <span onClick={() => navigate("/")} className="crumb-link">
              Home
            </span>
            <i className="ti ti-chevron-right crumb-sep" />
            <span className="crumb-active">All Products</span>
            {activeCategory !== "all" && (
              <>
                <i className="ti ti-chevron-right crumb-sep" />
                <span className="crumb-active">{activeCategoryLabel}</span>
              </>
            )}
          </div>
          <h1 className="catalog-title">Explore Our Collection</h1>
          <p className="catalog-subtitle">
            Discover handcrafted bags, wallets, and accessories designed for everyday luxury and durability.
          </p>
        </div>
      </div>

      <div className="catalog-container">
        {/* ── CATEGORY PILLS / TABS ── */}
        <div className="catalog-categories-bar">
          <span className="catalog-cat-heading">Filter by category:</span>
          <div className="catalog-cat-pills">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                type="button"
                className={`cat-pill-btn ${
                  activeCategory === cat.value ? "active" : ""
                }`}
                onClick={() => handleCategorySelect(cat.value)}
              >
                <i className={`ti ${cat.icon}`} aria-hidden="true" />
                <span>{cat.label}</span>
                <span className="cat-count-badge">
                  {categoryCounts[cat.value] || 0}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* ── CONTROLS & SEARCH BAR ── */}
        <div className="catalog-controls">
          <div className="catalog-search-wrap">
            <i className="ti ti-search search-icon" aria-hidden="true" />
            <input
              type="text"
              className="catalog-search-input"
              placeholder="Search products by title, tag, category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                className="search-clear-btn"
                onClick={() => setSearchQuery("")}
                title="Clear search"
              >
                <i className="ti ti-x" />
              </button>
            )}
          </div>

          <div className="catalog-filters-right">
            {/* Badge Filter */}
            <div className="badge-filter-group">
              <button
                type="button"
                className={`filter-chip ${badgeFilter === "all" ? "active" : ""}`}
                onClick={() => setBadgeFilter("all")}
              >
                All
              </button>
              <button
                type="button"
                className={`filter-chip ${badgeFilter === "new" ? "active" : ""}`}
                onClick={() => setBadgeFilter("new")}
              >
                New
              </button>
              <button
                type="button"
                className={`filter-chip ${badgeFilter === "hot" ? "active" : ""}`}
                onClick={() => setBadgeFilter("hot")}
              >
                Hot
              </button>
            </div>

            {/* Sort Selector */}
            <div className="catalog-sort-wrap">
              <label htmlFor="catalog-sort" className="sort-label">
                Sort by:
              </label>
              <select
                id="catalog-sort"
                className="catalog-sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="featured">Featured</option>
                <option value="newest">Newest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name-asc">Name: A to Z</option>
              </select>
            </div>
          </div>
        </div>

        {/* ── RESULTS HEADER STATUS ── */}
        <div className="catalog-results-status">
          <span className="results-count">
            Showing <strong>{filteredProducts.length}</strong> {filteredProducts.length === 1 ? "product" : "products"}
            {activeCategory !== "all" ? ` in "${activeCategoryLabel}"` : ""}
            {searchQuery ? ` matching "${searchQuery}"` : ""}
          </span>
          {(activeCategory !== "all" || searchQuery || badgeFilter !== "all") && (
            <button
              type="button"
              className="reset-all-btn"
              onClick={() => {
                handleCategorySelect("all");
                setSearchQuery("");
                setBadgeFilter("all");
                setSortBy("featured");
              }}
            >
              Reset all filters <i className="ti ti-rotate-clockwise" />
            </button>
          )}
        </div>

        {/* ── PRODUCT GRID ── */}
        {loading ? (
          <div className="catalog-loading">
            <i className="ti ti-loader catalog-spinner" />
            <p>Loading catalog products…</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="catalog-empty">
            <div className="empty-icon">
              <i className="ti ti-package-off" />
            </div>
            <h3>No products found</h3>
            <p>
              We couldn't find any products matching your current category or search filters.
            </p>
            <button
              type="button"
              className="btn-primary"
              onClick={() => {
                handleCategorySelect("all");
                setSearchQuery("");
                setBadgeFilter("all");
              }}
            >
              View all products
            </button>
          </div>
        ) : (
          <div className="catalog-grid">
            {filteredProducts.map((product) => {
              const productSlug = slugify(product.name);
              return (
                <div
                  key={product._id || product.id || productSlug}
                  className="card catalog-card"
                  onClick={() =>
                    onProductClick
                      ? onProductClick(product)
                      : navigate(`/product/${productSlug}`, { state: { product } })
                  }
                >
                  <div
                    className="card-img"
                    style={{ background: product.bg || product.thumbBg || "#f3f4f6", position: "relative" }}
                  >
                    {product.images?.[0] || product.image ? (
                      <img
                        src={product.images?.[0] || product.image}
                        alt={product.name}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "contain",
                          padding: 8,
                          borderRadius: "inherit",
                        }}
                      />
                    ) : (
                      <i
                        className={`ti ${product.icon || product.tiIcon || "ti-briefcase"}`}
                        style={{ color: product.color || "#D85A30", fontSize: 48 }}
                        aria-hidden="true"
                      />
                    )}

                    {product.badge && (
                      <span
                        className={`card-badge badge-${(product.badge || "").toLowerCase()}`}
                        style={{ position: "absolute", top: 10, left: 10 }}
                      >
                        {(product.badge || "").toLowerCase() === "new" ? "New" : "Hot"}
                      </span>
                    )}
                  </div>

                  <div className="card-body">
                    <div className="card-cat">{product.category || product.cat}</div>
                    <div className="card-name" title={product.name}>
                      {product.name}
                    </div>
                    <div className="card-bottom">
                      <span className="card-price">{product.price}</span>
                      <button
                        type="button"
                        className="catalog-add-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onAddToCart) onAddToCart(product);
                        }}
                        title="Add to cart"
                      >
                        <i className="ti ti-shopping-bag-plus" /> Add
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
