import { useState } from "react";
import "./Topbar.css";

export default function Topbar({ title, subtitle, actions, onSearch, onNewProduct }) {
  const [query, setQuery] = useState("");

  const handleSearch = (e) => {
    setQuery(e.target.value);
    onSearch?.(e.target.value);
  };

  return (
    <div className="topbar">
      {/* Left — title block */}
      <div className="topbar__title-block">
        <h1 className="topbar__title">{title}</h1>
        {subtitle && <p className="topbar__sub">{subtitle}</p>}
      </div>

      {/* Right — actions */}
      <div className="topbar__actions">
        {/* Search */}
        {onSearch !== undefined && (
          <div className="topbar__search">
            <svg className="topbar__search-icon" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              type="text"
              className="topbar__search-input"
              placeholder="Search products, orders…"
              value={query}
              onChange={handleSearch}
            />
          </div>
        )}

        {/* Notification bell */}
        <button className="topbar__notif" aria-label="Notifications">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2" strokeLinecap="round" width="16" height="16">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
          <span className="topbar__notif-dot" aria-hidden="true" />
        </button>

        {/* Custom actions (passed as prop) */}
        {actions}

        {/* New product shortcut */}
        {onNewProduct && (
          <button className="btn btn--primary" onClick={onNewProduct}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2.5" strokeLinecap="round" width="13" height="13">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            New product
          </button>
        )}
      </div>
    </div>
  );
}
