import "./ProductTable.css";

const PILL_MAP = {
  active: "pill--active",
  draft:  "pill--draft",
  hot:    "pill--hot",
  new:    "pill--new",
};

export default function ProductTable({ products, onEdit, onDelete }) {
  return (
    <div className="product-table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th>Product</th>
            <th>Price</th>
            <th>MRP</th>
            <th>Stock</th>
            <th>Badge</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id}>
              {/* Product cell */}
              <td>
                <div className="td-product">
                  <div className="td-thumb" style={{ background: p.thumbBg }}>
                    <span style={{ fontSize: 18 }}>{p.icon}</span>
                  </div>
                  <div>
                    <div className="td-name">{p.name}</div>
                    <div className="td-meta">{p.category} · SKU: {p.sku}</div>
                  </div>
                </div>
              </td>

              {/* Price */}
              <td style={{ fontWeight: 500, color: "var(--text-primary)" }}>
                ₹{p.price.toLocaleString("en-IN")}
              </td>

              {/* MRP */}
              <td>
                {p.mrp ? (
                  <span style={{ textDecoration: "line-through", color: "var(--text-muted)" }}>
                    ₹{p.mrp.toLocaleString("en-IN")}
                  </span>
                ) : "—"}
              </td>

              {/* Stock */}
              <td>
                <span className={p.stock <= 5 ? "pt-low-stock" : ""}>
                  {p.stock}
                </span>
              </td>

              {/* Badge */}
              <td>
                {p.badge ? (
                  <span className={`pill ${PILL_MAP[p.badge.toLowerCase()] ?? "pill--draft"}`}>
                    {p.badge}
                  </span>
                ) : "—"}
              </td>

              {/* Status */}
              <td>
                <span className={`pill ${PILL_MAP[p.status.toLowerCase()] ?? "pill--draft"}`}>
                  {p.status}
                </span>
              </td>

              {/* Actions */}
              <td>
                <div className="td-actions">
                  <button className="act-btn" onClick={() => onEdit?.(p)}>Edit</button>
                  <button className="act-btn act-btn--danger" onClick={() => onDelete?.(p)}>Delete</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
