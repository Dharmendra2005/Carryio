// import "./Orders.css";

const STATUS_PILL = {
  New:       "pill--new",
  Shipped:   "pill--active",
  Delivered: "pill--draft",
  Cancelled: "pill--admin",
};

export default function Orders({ orders, onProcess, onTrack, onView }) {
  return (
    <div className="section-card">
      <div className="section-card__body--flush">
        <div className="orders-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td style={{ fontWeight: 600, color: "var(--text-primary)" }}>
                    #{o.id}
                  </td>
                  <td>{o.customer}</td>
                  <td style={{ maxWidth: 180 }}>{o.items}</td>
                  <td style={{ fontWeight: 500, color: "var(--text-primary)" }}>
                    ₹{o.total.toLocaleString("en-IN")}
                  </td>
                  <td style={{ color: "var(--text-muted)" }}>{o.date}</td>
                  <td>
                    <span className={`pill ${STATUS_PILL[o.status] ?? "pill--draft"}`}>
                      {o.status}
                    </span>
                  </td>
                  <td>
                    {o.status === "New" && (
                      <button className="act-btn" onClick={() => onProcess?.(o)}>Process</button>
                    )}
                    {o.status === "Shipped" && (
                      <button className="act-btn" onClick={() => onTrack?.(o)}>Track</button>
                    )}
                    {(o.status === "Delivered" || o.status === "Cancelled") && (
                      <button className="act-btn" onClick={() => onView?.(o)}>View</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
