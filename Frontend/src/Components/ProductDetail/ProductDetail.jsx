import { Link } from "react-router-dom";
import "./ProductDetail.css";

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

export default function ProductDetail({
  product,
  isAuthenticated,
  onLogin,
  onSignup,
  onAddToCart,
}) {
  const title = product?.name || "Selected product";
  const category = product?.cat || "bag";
  const price = product?.price || "Rs. 1,999";
  const checkoutState = { product: { title, category, price } };

  return (
    <div className="main" style={{ paddingTop: 24 }}>
      <div className="section-top">
        <span className="section-title">Product details</span>
        <Link to="/" className="section-view-all">
          Back to home
        </Link>
      </div>

      <div className="product-detail">
        <div>
          <div
            style={{
              height: 320,
              borderRadius: 18,
              background: product?.bg || "#F7F1ED",
              display: "grid",
              placeItems: "center",
              marginBottom: 18,
            }}
          >
            <i
              className={`ti ${product?.icon || "ti-briefcase"}`}
              style={{ fontSize: 84, color: product?.color || "#D85A30" }}
              aria-hidden="true"
            />
          </div>

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
                onClick={() =>
                  onAddToCart?.({
                    ...product,
                    name: title,
                    cat: category,
                    price,
                  })
                }
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
              <p
                style={{
                  color: "var(--color-text-secondary)",
                  marginBottom: 16,
                }}
              >
                Sign in or create an account to continue on this product detail
                page.
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
