// import "./ProductCard.css";

// SVG bag icon — replace with <img src={product.image} /> once backend sends real images
function BagIcon({ color }) {
  return (
    <svg viewBox="0 0 100 80" width="52" height="52" fill="none"
      stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <rect x="10" y="20" width="80" height="55" rx="6" />
      <path d="M35 20 C35 8 65 8 65 20" />
      <line x1="10" y1="38" x2="90" y2="38" />
      <rect x="42" y="30" width="16" height="16" rx="3" />
    </svg>
  );
}

export default function ProductCard({ product, onClick }) {
  const { name, category, price, badge, bg, iconColor } = product;

  return (
    <div className="product-card" onClick={onClick} role="button" tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onClick()}>

      {/* ── Image area ── */}
      <div className="product-card__img" style={{ background: bg }}>
        <BagIcon color={iconColor} />
        {badge && (
          <span className={`product-card__badge product-card__badge--${badge}`}>
            {badge === "new" ? "New" : "Hot"}
          </span>
        )}
      </div>

      {/* ── Body ── */}
      <div className="product-card__body">
        <span className="product-card__category">{category}</span>
        <h3 className="product-card__name">{name}</h3>
        <div className="product-card__footer">
          <span className="product-card__price">₹{price.toLocaleString("en-IN")}</span>
          {badge ? (
            <span className="product-card__arrow">→</span>
          ) : (
            <span className="product-card__lock">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              Login
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
