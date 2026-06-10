import StatCard from "../StatCard/StatCard";
import ActivityFeed from "../ActivityFeed/ActivityFeed";
import "./Dashboard.css";

const BASE_STATS = [
  { label: "Total Products", change: "3 this week", changeType: "up", icon: "📦" },
  { label: "Orders Today", value: "7", change: "2 from yesterday", changeType: "up", icon: "🛒" },
  { label: "Revenue (Month)", value: "₹84k", change: "12% vs last month", changeType: "up", icon: "💰" },
  { label: "Managers", value: "3", change: "1 pending invite", changeType: "down", icon: "👥" },
];

function buildStats(productCount) {
  return BASE_STATS.map((stat) =>
    stat.label === "Total Products"
      ? { ...stat, value: String(productCount) }
      : stat,
  );
}

const ACTIVITY = [
  { title: 'Product "Canvas Backpack" added', time: "2 hours ago · by Dharm", type: "success" },
  { title: "Order #1042 marked as shipped", time: "4 hours ago · by Dharm", type: "default" },
  { title: 'Manager "Priya" invited', time: "Yesterday · by Dharm", type: "success" },
  { title: "Price updated on 3 products", time: "2 days ago · by Dharm", type: "default" },
  { title: '"Velvet Clutch" set to Draft', time: "3 days ago · by Dharm", type: "muted" },
];

const STATUS_PILL = {
  Hot: "pill--hot",
  New: "pill--new",
  Active: "pill--active",
  Draft: "pill--draft",
};

function getDisplayStatus(product) {
  if (product.badge === "Hot") return "Hot";
  if (product.badge === "New") return "New";
  if (product.status === "Draft") return "Draft";
  return "Active";
}

export default function Dashboard({ products = [], manager, onNavigate, onEdit }) {
  const recentProducts = products.filter((p) => p.id !== 4).slice(0, 5);
  const stats = buildStats(products.length);
  const managerName = manager?.name?.split(" ")[0] ?? "Manager";

  const activity = ACTIVITY.map((item, index) =>
    index === 0
      ? { ...item, time: item.time.replace("Dharm", managerName) }
      : item,
  );

  return (
    <div>
      <div className="stats-grid">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <div className="db-two-col">
        <div>
          <div className="section-card">
            <div className="section-card__head">
              <div>
                <div className="section-card__title">Recent products</div>
                <div className="section-card__sub">Last 5 added</div>
              </div>
              <button className="btn btn--ghost" onClick={() => onNavigate("products")}>
                View all
              </button>
            </div>
            <div className="section-card__body--flush">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {recentProducts.map((product) => {
                    const displayStatus = getDisplayStatus(product);
                    return (
                      <tr key={product.id}>
                        <td>
                          <div className="td-product">
                            <div
                              className="td-thumb"
                              style={{ background: product.thumbBg }}
                            >
                              {product.icon}
                            </div>
                            <div>
                              <div className="td-name">{product.name}</div>
                              <div className="td-meta">{product.category}</div>
                            </div>
                          </div>
                        </td>
                        <td>₹{product.price.toLocaleString("en-IN")}</td>
                        <td>{product.stock}</td>
                        <td>
                          <span
                            className={`pill ${STATUS_PILL[displayStatus] ?? "pill--draft"}`}
                          >
                            {displayStatus}
                          </span>
                        </td>
                        <td>
                          <button
                            className="act-btn"
                            onClick={() => onEdit?.(product)}
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div>
          <div className="section-card">
            <div className="section-card__head">
              <div className="section-card__title">Recent activity</div>
            </div>
            <div className="section-card__body">
              <ActivityFeed items={activity} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
