import { Link, useNavigate } from "react-router-dom";
import "./Navbar.css";

export default function Navbar({ user, onLogout }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    if (window.confirm("Are you sure you want to log out?")) {
        await fetch("http://localhost:3000/logout", {
            method: "POST",
            credentials: "include",
        });

        onLogout();   // update parent state
        navigate("/");
    }
   };
  return (
    <header className="navbar">
      {/* ── Logo ── */}
      <Link to="/" className="navbar__logo">
        <span className="navbar__logo-mark">C</span>
        <span className="navbar__logo-text">
          <span className="navbar__logo-name">Carryio</span>
          <span className="navbar__logo-tag">Premium Collection</span>
        </span>
      </Link>

      {/* ── Search ── */}
      <div className="navbar__search">
        <svg className="navbar__search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
        </svg>
        <input
          type="text"
          placeholder="Search bags, wallets, accessories…"
          className="navbar__search-input"
        />
      </div>

      {/* ── Actions ── */}
      <nav className="navbar__actions">
        <button className="navbar__cart" onClick={handleLogout}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 0 1-8 0" />
          </svg>
          Cart (0)
        </button>

        {user ? (
          <>
            <span className="navbar__username">Hi, {user.name}</span>
            <button className="navbar__btn navbar__btn--ghost" onClick={onLogout}>
              Log out
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="navbar__btn navbar__btn--ghost">
              Log in
            </Link>
            <Link to="/register" className="navbar__btn navbar__btn--primary">
              Sign up
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}
