import StatCard from "../StatCard/StatCard";
import ActivityFeed from "../ActivityFeed/ActivityFeed";
import "./Dashboard.css";

const STATS = [
  { label: "Total Products", value: "24", change: "3 this week",      changeType: "up",   icon: "📦" },
  { label: "Orders Today",   value: "7",  change: "2 from yesterday", changeType: "up",   icon: "🛒" },
  { label: "Revenue (Month)",value: "₹84k",change:"12% vs last month",changeType: "up",   icon: "💰" },
  { label: "Managers",       value: "3",  change: "1 pending invite", changeType: "down", icon: "👥" },
];

const RECENT_PRODUCTS = [
  { id:1, name:"Classic Leather Tote", category:"Tote bags",   price:2499, stock:18, badge:"Hot",  thumbBg:"#FAECE7", icon:"👜" },
  { id:2, name:"Canvas Backpack",      category:"Backpacks",   price:1899, stock:32, badge:"New",  thumbBg:"#E1F5EE", icon:"🎒" },
  { id:3, name:"Slim Bifold Wallet",   category:"Wallets",     price:699,  stock:45, badge:null,   thumbBg:"#EEF2F8", icon:"👛" },
  { id:4, name:"Urban Sling Bag",      category:"Sling bags",  price:1499, stock:9,  badge:"Hot",  thumbBg:"#FAEEDA", icon:"👜" },
  { id:5, name:"Weekend Travel Bag",   category:"Travel bags", price:3299, stock:6,  badge:null,   thumbBg:"#EAF3DE", icon:"🧳" },
];

const ACTIVITY = [
  { title: 'Product "Canvas Backpack" added',  time: "2 hours ago · by Dharm",  type: "success" },
  { title: "Order #1042 marked as shipped",    time: "4 hours ago · by Dharm",  type: "default" },
  { title: 'Manager "Priya" invited',          time: "Yesterday · by Dharm",    type: "success" },
  { title: "Price updated on 3 products",      time: "2 days ago · by Dharm",   type: "default" },
  { title: '"Velvet Clutch" set to Draft',     time: "3 days ago · by Dharm",   type: "muted"   },
];

export default function Dashboard({ onNavigate }) {
  return (
    <div>
      {/* Stats */}
      <div className="stats-grid">
        {STATS.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      <div className="db-two-col">
        {/* Recent products mini table */}
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
                  <tr><th>Product</th><th>Price</th><th>Stock</th><th>Badge</th><th></th></tr>
                </thead>
                <tbody>
                  {RECENT_PRODUCTS.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <div className="td-product">
                          <div className="td-thumb" style={{ background: p.thumbBg }}>
                            {p.icon}
                          </div>
                          <div>
                            <div className="td-name">{p.name}</div>
                            <div className="td-meta">{p.category}</div>
                          </div>
                        </div>
                      </td>
                      <td>₹{p.price.toLocaleString("en-IN")}</td>
                      <td>{p.stock}</td>
                      <td>
                        {p.badge ? (
                          <span className={`pill ${p.badge === "Hot" ? "pill--hot" : "pill--new"}`}>
                            {p.badge}
                          </span>
                        ) : "—"}
                      </td>
                      <td>
                        <button className="act-btn" onClick={() => onNavigate("add-product")}>
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Activity feed */}
        <div>
          <div className="section-card">
            <div className="section-card__head">
              <div className="section-card__title">Recent activity</div>
            </div>
            <div className="section-card__body">
              <ActivityFeed items={ACTIVITY} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
