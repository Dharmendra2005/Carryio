import { useState } from "react";
import { Link } from "react-router-dom";
import "./ProductDetail.css";

export default function ProductDetail({
  product,
  isAuthenticated,
  onLogin,
  onSignup,
  onAddToCart,
}) {
  const title = product?.name || "Selected Product";
  const category = product?.category || product?.cat || "Bag";
  const price = typeof product?.price === "number"
    ? `Rs. ${product.price.toLocaleString("en-IN")}`
    : (product?.price || "Rs. 0");
  const images = product?.images || [];
  const [activeImg, setActiveImg] = useState(0);

  const checkoutState = { product: { title, category, price, image: images[0] } };

  const stockText = product?.stock !== undefined && product?.stock !== null
    ? (Number(product.stock) > 0 ? `In stock - ${product.stock} pieces left` : "Out of stock")
    : "In stock";

  const productSpecs = [
    { label: "Availability", value: product?.availability || stockText },
    { label: "Dispatch", value: product?.dispatch || "Ships within 24 hours" },
    { label: "Delivery", value: product?.delivery || "2-5 business days across India" },
    { label: "Return", value: product?.returnPolicy || "Easy 30-day return available" },
  ];

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
              background: product?.thumbBg || product?.bg || "#F7F1ED",
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
                style={{ width: "100%", height: "100%", objectFit: "contain", padding: 12 }}
              />
            ) : (
              <i
                className={`ti ${product?.tiIcon || product?.icon || "ti-briefcase"}`}
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
                    padding: 4,
                    cursor: "pointer",
                    flexShrink: 0,
                    background: product?.thumbBg || product?.bg || "#F7F1ED",
                  }}
                >
                  <img
                    src={src}
                    alt={`view-${i}`}
                    style={{ width: "100%", height: "100%", objectFit: "contain" }}
                  />
                </button>
              ))}
            </div>
          )}

          <h1 style={{ fontFamily: "var(--font-heading)", marginBottom: 8 }}>
            {title}
          </h1>
          <p style={{ color: "var(--color-text-secondary)", marginBottom: 14 }}>
            {product?.description || "No description provided."}
          </p>

          <div className="hero-stats" style={{ marginTop: 0 }}>
            <div>
              <div className="stat-num">{price}</div>
              <div className="stat-label">Price</div>
            </div>
            <div>
              <div className="stat-num">{product?.brand || "Carryio"}</div>
              <div className="stat-label">Brand</div>
            </div>
            <div>
              <div className="stat-num">{product?.freeShipping ? "Free" : "Standard"}</div>
              <div className="stat-label">{product?.freeShipping ? "Free shipping included" : "Standard shipping"}</div>
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
                Review the product specs below and add this item to your cart.
              </p>

              <div className="product-specs">
                {productSpecs.map((spec) => (
                  <div className="product-spec" key={spec.label}>
                    <span>{spec.label}</span>
                    <strong>{spec.value}</strong>
                  </div>
                ))}
              </div>

              <div className="product-options">
                <div>
                  <span>Color</span>
                  <strong>{product?.colorName || (Array.isArray(product?.colors) && product?.colors[0]) || "Standard"}</strong>
                </div>
                <div>
                  <span>Size</span>
                  <strong>{product?.sizes || "Standard"}</strong>
                </div>
              </div>

              <button
                type="button"
                className="btn-primary"
                style={{ width: "100%", marginBottom: 10 }}
                onClick={() => onAddToCart?.({ ...product, name: title, cat: category, price: product?.price })}
              >
                Add to cart
              </button>
              <Link
                to="/checkout/address"
                state={checkoutState}
                className="btn-ghost product-continue"
              >
                Continue shopping
              </Link>

              {Array.isArray(product?.reviews) && product.reviews.length > 0 && (
                <div className="product-reviews">
                  <div className="product-reviews__top">
                    <span className="section-title">Customer reviews</span>
                    <span>{product.reviews.length} reviews</span>
                  </div>
                  {product.reviews.map((review, idx) => (
                    <div className="product-review" key={idx}>
                      <div>
                        <strong>{review.name}</strong>
                        <span>{review.rating} star</span>
                      </div>
                      <p>{review.text}</p>
                    </div>
                  ))}
                </div>
              )}
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
                onClick={onLogin}
              >
                Log in
              </button>
              <button
                type="button"
                className="btn-ghost"
                style={{ width: "100%" }}
                onClick={onSignup}
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