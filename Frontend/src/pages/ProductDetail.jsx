import { useEffect, useState, useMemo } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { fetchStoreProducts } from "../api/products";
import "../Components/ProductDetail/ProductDetail.css";

const PRODUCT_SPECS = [
  { label: "Availability", value: "In stock - 12 pieces left" },
  { label: "Dispatch", value: "Ships within 24 hours" },
  { label: "Delivery", value: "2-5 business days across India" },
  { label: "Return", value: "Easy 30-day return available" },
];

const CUSTOMER_REVIEWS = [
  {
    name: "Aarav Mehta",
    rating: "5.0",
    text: "The finish feels premium and the stitching is neat. It fits my daily essentials without looking bulky.",
  },
  {
    name: "Priya Nair",
    rating: "4.8",
    text: "Color matched the photos and delivery was quick. The inside pockets make it easy to organize small items.",
  },
  {
    name: "Neha Sharma",
    rating: "4.9",
    text: "Good value for the price. I have used it for work and weekend outings, and it still holds its shape well.",
  },
];

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function ProductDetail() {
  const { slug } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, addToCart } = useApp();
  const isAuthenticated = Boolean(user);

  const [product, setProduct] = useState(location.state?.product || null);
  const [loading, setLoading] = useState(!product);

  useEffect(() => {
    if (product) return;

    let active = true;
    fetchStoreProducts()
      .then((products) => {
        const found = products.find((p) => slugify(p.name) === slug);
        if (active && found) {
          setProduct(found);
        }
      })
      .catch((err) => {
        console.error("Error loading product detail:", err);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [slug, product]);

  const title = product?.name || "Selected product";
  const category = product?.cat || "bag";
  const price = product?.price || "Rs. 1,999";
  const images = product?.images || [];
  const [activeImg, setActiveImg] = useState(0);

  const handleBuyNow = () => {
    const amount = Number(String(price).replace(/[^0-9]/g, ""));
    const checkoutData = {
      items: [{ name: title, price: amount, quantity: 1, cat: category }],
      total: amount,
      title: title,
    };
    navigate("/checkout/address", { state: checkoutData });
  };

  const handleAddToCartClick = () => {
    addToCart({ ...product, name: title, cat: category, price });
    navigate("/cart");
  };

  if (loading) {
    return (
      <div className="main" style={{ padding: 24, color: "#70665e" }}>
        Loading product details…
      </div>
    );
  }

  if (!product) {
    return (
      <div className="main" style={{ padding: 24, color: "#70665e" }}>
        <h2>Product not found</h2>
        <Link to="/">Back to Home</Link>
      </div>
    );
  }

  return (
    <div className="main" style={{ paddingTop: 24 }}>
      <div className="section-top">
        <span className="section-title">Product details</span>
        <Link to="/" className="section-view-all">Back to home</Link>
      </div>

      <div className="product-detail">
        <div>
          {/* ── Main image / fallback icon ── */}
          <div
            style={{
              height: 320,
              borderRadius: 18,
              background: product?.bg || "#F7F1ED",
              display: "grid",
              placeItems: "center",
              marginBottom: 12,
              overflow: "hidden",
            }}
          >
            {images.length > 0 ? (
              <img
                src={images[activeImg]}
                alt={title}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <i
                className={`ti ${product?.icon || "ti-briefcase"}`}
                style={{ fontSize: 84, color: product?.color || "#D85A30" }}
                aria-hidden="true"
              />
            )}
          </div>

          {/* ── Thumbnail strip ── */}
          {images.length > 1 && (
            <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
              {images.map((src, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActiveImg(i)}
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 10,
                    overflow: "hidden",
                    border: activeImg === i ? "2px solid #D85A30" : "2px solid transparent",
                    padding: 0,
                    cursor: "pointer",
                    flexShrink: 0,
                    background: product?.bg || "#F7F1ED",
                  }}
                >
                  <img
                    src={src}
                    alt={`view-${i}`}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </button>
              ))}
            </div>
          )}

          <h1 style={{ fontFamily: "var(--font-heading)", marginBottom: 8 }}>
            {title}
          </h1>
          <p style={{ color: "var(--color-text-secondary)", marginBottom: 14 }}>
            A clean everyday {category} made for daily carry, quick travel, and
            polished casual looks. The structured body keeps essentials secure
            while the soft-touch finish makes it comfortable to use all day.
          </p>

          <div className="hero-stats" style={{ marginTop: 0 }}>
            <div>
              <div className="stat-num">{price}</div>
              <div className="stat-label">Price</div>
            </div>
            <div>
              <div className="stat-num">4.9 star</div>
              <div className="stat-label">Rating</div>
            </div>
            <div>
              <div className="stat-num">Free</div>
              <div className="stat-label">Shipping over Rs. 999</div>
            </div>
          </div>
        </div>

        <div className="product-purchase">
          {isAuthenticated ? (
            <>
              <div className="section-title" style={{ marginBottom: 10 }}>
                Ready to order
              </div>
              <p className="product-summary">
                Review the details below, add this item to your cart, or
                continue browsing more Carryio picks.
              </p>

              <div className="product-specs">
                {PRODUCT_SPECS.map((spec) => (
                  <div className="product-spec" key={spec.label}>
                    <span>{spec.label}</span>
                    <strong>{spec.value}</strong>
                  </div>
                ))}
              </div>

              <div className="product-options">
                <div>
                  <span>Color</span>
                  <strong>Classic tan</strong>
                </div>
                <div>
                  <span>Size</span>
                  <strong>Medium</strong>
                </div>
              </div>

              <button
                type="button"
                className="btn-primary"
                style={{ width: "100%", marginBottom: 10 }}
                onClick={handleAddToCartClick}
              >
                Add to cart
              </button>

              <button
                type="button"
                className="btn-ghost"
                style={{ width: "100%", marginBottom: 10, textAlign: "center", display: "block" }}
                onClick={handleBuyNow}
              >
                Buy now
              </button>

              <div className="product-reviews">
                <div className="product-reviews__top">
                  <span className="section-title">Customer reviews</span>
                  <span>4.9 from 128 reviews</span>
                </div>
                {CUSTOMER_REVIEWS.map((review) => (
                  <div className="product-review" key={review.name}>
                    <div>
                      <strong>{review.name}</strong>
                      <span>{review.rating} star</span>
                    </div>
                    <p>{review.text}</p>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              <div className="section-title" style={{ marginBottom: 10 }}>
                Log in to continue
              </div>
              <p style={{ color: "var(--color-text-secondary)", marginBottom: 16 }}>
                Sign in or create an account to continue on this product detail page.
              </p>
              <button
                type="button"
                className="btn-primary"
                style={{ width: "100%", marginBottom: 10 }}
                onClick={() => navigate("/login", { state: { returnTo: location.pathname, product } })}
              >
                Log in
              </button>
              <button
                type="button"
                className="btn-ghost"
                style={{ width: "100%" }}
                onClick={() => navigate("/register", { state: { returnTo: location.pathname, product } })}
              >
                Sign up
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
