import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import HeroSection from "../Components/HeroSection/HeroSection";
import ProductGrid from "../Components/ProductItems/ProductGrid";
import { fetchStoreProducts } from "../api/products";

const CATEGORIES = [
  { label: "All products", value: "all" },
  { label: "Tote bags", value: "tote" },
  { label: "Backpacks", value: "backpack" },
  { label: "Wallets", value: "wallet" },
  { label: "Clutches", value: "clutch" },
  { label: "Sling bags", value: "sling" },
  { label: "Travel bags", value: "travel" },
];

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function Home() {
  const [active, setActive] = useState("all");
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;

    fetchStoreProducts()
      .then((items) => {
        if (active) setProducts(items);
      })
      .catch((err) => {
        console.error("Failed to load products:", err);
      })
      .finally(() => {
        if (active) setProductsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const filteredProducts =
    active === "all"
      ? products
      : products.filter((product) => product.cat === active);

  const handleProductClick = (product) => {
    navigate(`/product/${slugify(product.name)}`, {
      state: { product },
    });
  };

  return (
    <>
      <HeroSection />

      <div className="main">
        <div className="section-top">
          <span className="section-title">Browse by category</span>
        </div>
        <div className="cats" id="cats">
          {CATEGORIES.map((category) => (
            <div
              key={category.value}
              className={`cat-pill ${active === category.value ? "active" : ""}`}
              data-cat={category.value}
              onClick={() => setActive(category.value)}
            >
              {category.label}
            </div>
          ))}
        </div>

        <div className="section-top">
          <span className="section-title">Featured products</span>
          <span className="section-view-all">View all →</span>
        </div>

        {productsLoading ? (
          <p style={{ color: "#70665e", padding: "20px 0" }}>Loading products…</p>
        ) : (
          <ProductGrid products={filteredProducts} onCardClick={handleProductClick} />
        )}
      </div>

      <div className="trust-strip">
        <div className="trust-card">
          <div className="trust-icon">
            <i className="ti ti-truck" aria-hidden="true" />
          </div>
          <div>
            <div className="trust-title">Free shipping</div>
            <div className="trust-sub">On orders above ₹999</div>
          </div>
        </div>
        <div className="trust-card">
          <div className="trust-icon">
            <i className="ti ti-refresh" aria-hidden="true" />
          </div>
          <div>
            <div className="trust-title">Easy returns</div>
            <div className="trust-sub">30-day return policy</div>
          </div>
        </div>
        <div className="trust-card">
          <div className="trust-icon">
            <i className="ti ti-shield-check" aria-hidden="true" />
          </div>
          <div>
            <div className="trust-title">Secure payment</div>
            <div className="trust-sub">100% protected checkout</div>
          </div>
        </div>
        <div className="trust-card">
          <div className="trust-icon">
            <i className="ti ti-headset" aria-hidden="true" />
          </div>
          <div>
            <div className="trust-title">24/7 support</div>
            <div className="trust-sub">We're always here</div>
          </div>
        </div>
      </div>
    </>
  );
}
