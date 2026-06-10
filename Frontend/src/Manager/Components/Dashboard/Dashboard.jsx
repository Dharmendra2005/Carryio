import StatCard from "../StatCard/StatCard";
import ActivityFeed from "../ActivityFeed/ActivityFeed";
import { formatRevenue } from "../../../utils/productMappers";
import "./Dashboard.css";

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

function buildStats(stats, productCount) {
  const productsThisWeek = stats?.productsThisWeek ?? 0;
  const ordersToday = stats?.ordersToday ?? 0;
  const ordersDelta = stats?.ordersYesterdayDelta ?? 0;
  const monthRevenue = stats?.monthRevenue ?? 0;
  const managersCount = stats?.managersCount ?? 0;

  return [
    {
      label: "Total Products",
      value: String(stats?.productCount ?? productCount),
      change: `${productsThisWeek} this week`,
      changeType: productsThisWeek > 0 ? "up" : "neutral",
      icon: "📦",
    },
    {
      label: "Orders Today",
      value: String(ordersToday),
      change:
        ordersDelta >= 0
          ? `${ordersDelta} from yesterday`
          : `${Math.abs(ordersDelta)} fewer than yesterday`,
      changeType: ordersDelta >= 0 ? "up" : "down",
      icon: "🛒",
    },
    {
      label: "Revenue (Month)",
      value: formatRevenue(monthRevenue),
      change: monthRevenue > 0 ? "Based on placed orders" : "No revenue yet",
      changeType: monthRevenue > 0 ? "up" : "neutral",
      icon: "💰",
    },
    {
      label: "Managers",
      value: String(managersCount),
      change: managersCount > 1 ? "Team active" : "Invite more managers",
      changeType: "neutral",
      icon: "👥",
    },
  ];
}

export default function Dashboard({
  products = [],
  stats,
  activity = [],
  manager,
  onNavigate,
  onEdit,
}) {
  const recentProducts = [...products]
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, 5);
  const statCards = buildStats(stats, products.length);

  return (
    <div>
      <div className="stats-grid">
        {statCards.map((stat) => (
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
              {recentProducts.length === 0 ? (
                <div className="dashboard-empty">No products yet. Add your first product.</div>
              ) : (
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
              )}
            </div>
          </div>
        </div>

        <div>
          <div className="section-card">
            <div className="section-card__head">
              <div className="section-card__title">Recent activity</div>
            </div>
            <div className="section-card__body">
              {activity.length === 0 ? (
                <div className="dashboard-empty">Activity will appear as you add products and orders.</div>
              ) : (
                <ActivityFeed items={activity} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
