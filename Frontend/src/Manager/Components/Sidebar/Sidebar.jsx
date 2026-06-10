import "./Sidebar.css";

function buildNav(productCount, orderCount) {
  return [
  {
    label: "Overview",
    items: [
      { id: "dashboard", icon: "ti-layout-dashboard", label: "Dashboard" },
      { id: "products", icon: "ti-package", label: "Products", badge: productCount },
      { id: "orders", icon: "ti-shopping-cart", label: "Orders", badge: orderCount },
    ],
  },
  {
    label: "Manage",
    items: [
      { id: "add-product", icon: "ti-circle-plus",  label: "Add product" },
      { id: "managers",    icon: "ti-users",         label: "Managers" },
      { id: "settings",    icon: "ti-settings",      label: "Settings" },
    ],
  },
];
}

export default function Sidebar({
  active,
  onNavigate,
  manager,
  productCount = 24,
  orderCount = 7,
}) {
  const nav = buildNav(productCount, orderCount);

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar__logo">
        <div className="sidebar__logo-name">
          Carry<span>io</span>
        </div>
        <div className="sidebar__logo-tag">Manager Panel</div>
      </div>

      {/* Nav groups */}
      <nav className="sidebar__nav">
        {nav.map((group) => (
          <div key={group.label} className="sidebar__group">
            <div className="sidebar__group-label">{group.label}</div>
            {group.items.map((item) => (
              <button
                key={item.id}
                className={`sidebar__item ${active === item.id ? "sidebar__item--active" : ""}`}
                onClick={() => onNavigate(item.id)}
              >
                <i className={`ti ${item.icon} sidebar__item-icon`} aria-hidden="true" />
                <span>{item.label}</span>
                {item.badge && (
                  <span className="sidebar__badge">{item.badge}</span>
                )}
              </button>
            ))}
          </div>
        ))}
      </nav>

      {/* Manager profile at bottom */}
      <div className="sidebar__bottom">
        <div className="sidebar__profile">
          <div className="sidebar__avatar">
            {manager?.name?.[0] ?? "M"}
          </div>
          <div className="sidebar__profile-info">
            <div className="sidebar__profile-name">{manager?.name ?? "Manager"}</div>
            <div className="sidebar__profile-role">{manager?.role ?? "Admin"}</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
