import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./App.css";
import logo from "./assets/carryio_logo.svg";

import UserLogin from "./Components/Auth/Login";
import CheckoutAddress from "./Components/Checkout/CheckoutAddress";
import CheckoutPayment from "./Components/Checkout/CheckoutPayment";
import ProductDetail from "./Components/ProductDetail/ProductDetail";

const PRODUCTS = [
  {
    name: "Classic leather tote",
    cat: "tote",
    price: "₹2,499",
    bg: "#FAECE7",
    icon: "ti-briefcase",
    badge: "hot",
    color: "#D85A30",
  },
  {
    name: "Canvas backpack",
    cat: "backpack",
    price: "₹1,899",
    bg: "#E1F5EE",
    icon: "ti-backpack",
    badge: "new",
    color: "#0F6E56",
  },
  {
    name: "Slim bifold wallet",
    cat: "wallet",
    price: "₹699",
    bg: "#E6F1FB",
    icon: "ti-wallet",
    badge: "",
    color: "#185FA5",
  },
  {
    name: "Velvet clutch bag",
    cat: "clutch",
    price: "₹1,199",
    bg: "#FBEAF0",
    icon: "ti-heart",
    badge: "new",
    color: "#993556",
  },
  {
    name: "Urban sling bag",
    cat: "sling",
    price: "₹1,499",
    bg: "#FAEEDA",
    icon: "ti-bag",
    badge: "hot",
    color: "#854F0B",
  },
  {
    name: "Weekend travel bag",
    cat: "travel",
    price: "₹3,299",
    bg: "#EAF3DE",
    icon: "ti-luggage",
    badge: "",
    color: "#3B6D11",
  },
  {
    name: "Suede tote large",
    cat: "tote",
    price: "₹2,899",
    bg: "#FCEBEB",
    icon: "ti-briefcase",
    badge: "",
    color: "#A32D2D",
  },
  {
    name: "Cord wallet zip",
    cat: "wallet",
    price: "₹849",
    bg: "#EEEDFE",
    icon: "ti-wallet",
    badge: "new",
    color: "#534AB7",
  },
];

const CATEGORIES = [
  { label: "All products", value: "all" },
  { label: "Tote bags", value: "tote" },
  { label: "Backpacks", value: "backpack" },
  { label: "Wallets", value: "wallet" },
  { label: "Clutches", value: "clutch" },
  { label: "Sling bags", value: "sling" },
  { label: "Travel bags", value: "travel" },
];

const AUTH_STORAGE_KEY = "carryio_user";

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function App() {
  const [active, setActive] = useState("all");
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem(AUTH_STORAGE_KEY);
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (user) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, [user]);

  const filteredProducts =
    active === "all"
      ? PRODUCTS
      : PRODUCTS.filter((product) => product.cat === active);

  const openAuthPage = (path) => {
    navigate(path, {
      state: { returnTo: location.pathname, product: location.state?.product },
    });
  };

  const isAuthPage =
    location.pathname === "/login" || location.pathname === "/register";

  const activeProduct = useMemo(() => {
    if (!location.pathname.startsWith("/product/")) {
      return null;
    }

    const productSlug = location.pathname.replace("/product/", "");
    return (
      PRODUCTS.find((product) => slugify(product.name) === productSlug) || null
    );
  }, [location.pathname]);

  const handleAuthSuccess = (nextUser) => {
    setUser(nextUser);
  };

  const handleLogout = () => {
    setUser(null);
    setMenuOpen(false);
    navigate("/");
  };

  const handleProductClick = (product) => {
    navigate(`/product/${slugify(product.name)}`, {
      state: { product },
    });
  };

  const renderHeader = () => (
    <nav className="nav">
      <div className="nav-logo">
        <img src="/src/assets/carryio_logo.svg" alt="Carryio Logo" />
      </div>
      <div className="nav-search">
        <i className="ti ti-search" aria-hidden="true" />
        <input type="text" placeholder="Search bags, wallets, accessories…" />
      </div>
      <div className="nav-actions">
        <div className="nav-cart">
          <i
            className="ti ti-shopping-bag"
            aria-hidden="true"
            style={{ fontSize: 16 }}
          />
          Cart (0)
        </div>

        {user ? (
          <>
            <div className="nav-user">
              <button
                type="button"
                className="nav-user-button"
                onClick={() => setMenuOpen((prev) => !prev)}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
              >
                <span className="nav-user-avatar">
                  {user.name?.slice(0, 1) || "U"}
                </span>
                <span className="nav-user-name">{user.name || "User"}</span>
                <i className="ti ti-dots-vertical" aria-hidden="true" />
              </button>
              {menuOpen ? (
                <div className="nav-user-menu" role="menu">
                  <div className="nav-user-card">
                    <strong>{user.name || "User"}</strong>
                    <span>{user.email || "member@carryio.com"}</span>
                  </div>
                  <button type="button" className="nav-user-item">
                    Profile
                  </button>
                  <button type="button" className="nav-user-item">
                    Orders
                  </button>
                  <button type="button" className="nav-user-item">
                    Saved items
                  </button>
                  <button
                    type="button"
                    className="nav-user-item danger"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </div>
              ) : null}
            </div>
            <button type="button" className="btn-ghost" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              className="btn-login"
              onClick={() => openAuthPage("/login")}
            >
              Log in
            </button>
            <button
              type="button"
              className="btn-signup"
              onClick={() => openAuthPage("/register")}
            >
              Sign up
            </button>
          </>
        )}
      </div>
    </nav>
  );

  return (
    <div className="wrap" id="wrap">
      {renderHeader()}

      {isAuthPage ? (
        <div style={{ padding: 24 }}>
          <UserLogin
            key={location.pathname}
            initialTab={
              location.pathname === "/register" ? "register" : "login"
            }
            onAuthSuccess={handleAuthSuccess}
          />
        </div>
      ) : location.pathname === "/checkout/address" ? (
        <CheckoutAddress />
      ) : location.pathname === "/checkout/payment" ? (
        <CheckoutPayment />
      ) : location.pathname.startsWith("/product/") ? (
        <ProductDetail
          product={activeProduct || location.state?.product || null}
          isAuthenticated={Boolean(user)}
          onLogin={() => openAuthPage("/login")}
          onSignup={() => openAuthPage("/register")}
        />
      ) : (
        <>
          <div className="hero">
            <div className="hero-text">
              <h1>
                Carry more than just <span>essentials</span>
              </h1>
              <p>
                Explore our curated collection of handcrafted bags, wallets, and
                accessories. Crafted to last.
              </p>
              <div className="hero-actions">
                <button type="button" className="btn-primary">
                  Shop now
                </button>
                <button type="button" className="btn-ghost">
                  Explore categories
                </button>
              </div>
              <div className="hero-stats">
                <div>
                  <div className="stat-num">200+</div>
                  <div className="stat-label">Products</div>
                </div>
                <div>
                  <div className="stat-num">12k+</div>
                  <div className="stat-label">Customers</div>
                </div>
                <div>
                  <div className="stat-num">4.9★</div>
                  <div className="stat-label">Rating</div>
                </div>
              </div>
            </div>
            <div className="hero-img">
              {/* <i
            className="ti ti-briefcase"
            aria-hidden="true"
            style={{ fontSize: 64, color: "#d44d1c" }}
          /> */}
              <img src={logo} alt="Carryio Logo" />
            </div>
          </div>

          <div className="main">
            <div className="section-top">
              <span className="section-title">Browse by category</span>
            </div>
            <div className="cats" id="cats">
              {CATEGORIES.map((category) => (
                <div
                  key={category.value}
                  className={`cat-pill ${active === category.value ? "active" : ""}`}
                  data-cat={category.value}
                  onClick={() => setActive(category.value)}
                >
                  {category.label}
                </div>
              ))}
            </div>
            <div className="section-top">
              <span className="section-title">Featured products</span>
              <span className="section-view-all">View all →</span>
            </div>
            <div className="grid" id="grid">
              {filteredProducts.map((product) => (
                <div
                  key={`${product.cat}-${product.name}`}
                  className="card"
                  onClick={() => handleProductClick(product)}
                >
                  <div className="card-img" style={{ background: product.bg }}>
                    <i
                      className={`ti ${product.icon}`}
                      style={{ color: product.color, fontSize: 48 }}
                      aria-hidden="true"
                    />
                  </div>
                  <div className="card-body">
                    <div className="card-cat">{product.cat}</div>
                    <div className="card-name">{product.name}</div>
                    <div className="card-bottom">
                      <span className="card-price">{product.price}</span>
                      {product.badge ? (
                        <span className={`card-badge badge-${product.badge}`}>
                          {product.badge === "new" ? "New" : "Hot"}
                        </span>
                      ) : (
                        <span className="card-lock">
                          <i
                            className="ti ti-lock"
                            style={{ fontSize: 11 }}
                            aria-hidden="true"
                          />{" "}
                          Login
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="trust-strip">
            <div className="trust-card">
              <div className="trust-icon">
                <i className="ti ti-truck" aria-hidden="true" />
              </div>
              <div>
                <div className="trust-title">Free shipping</div>
                <div className="trust-sub">On orders above ₹999</div>
              </div>
            </div>
            <div className="trust-card">
              <div className="trust-icon">
                <i className="ti ti-refresh" aria-hidden="true" />
              </div>
              <div>
                <div className="trust-title">Easy returns</div>
                <div className="trust-sub">30-day return policy</div>
              </div>
            </div>
            <div className="trust-card">
              <div className="trust-icon">
                <i className="ti ti-shield-check" aria-hidden="true" />
              </div>
              <div>
                <div className="trust-title">Secure payment</div>
                <div className="trust-sub">100% protected checkout</div>
              </div>
            </div>
            <div className="trust-card">
              <div className="trust-icon">
                <i className="ti ti-headset" aria-hidden="true" />
              </div>
              <div>
                <div className="trust-title">24/7 support</div>
                <div className="trust-sub">We're always here</div>
              </div>
            </div>
          </div>

          <footer className="footer">
            <div className="footer-top">
              <div className="footer-brand">
                <div className="footer-brand-logo">
                  Ca<span>rr</span>yio
                </div>
                <p>
                  Handcrafted bags and accessories built for everyday life.
                  Quality you can feel, style you can see.
                </p>
                <div className="social-row">
                  <div className="social-btn">
                    <i
                      className="ti ti-brand-instagram"
                      aria-label="Instagram"
                    />
                  </div>
                  <div className="social-btn">
                    <i className="ti ti-brand-twitter" aria-label="Twitter" />
                  </div>
                  <div className="social-btn">
                    <i className="ti ti-brand-facebook" aria-label="Facebook" />
                  </div>
                  <div className="social-btn">
                    <i className="ti ti-brand-youtube" aria-label="YouTube" />
                  </div>
                </div>
              </div>

              <div className="footer-col">
                <h4>Shop</h4>
                <ul>
                  <li>
                    <a>Tote bags</a>
                  </li>
                  <li>
                    <a>Backpacks</a>
                  </li>
                  <li>
                    <a>Wallets</a>
                  </li>
                  <li>
                    <a>Clutches</a>
                  </li>
                  <li>
                    <a>Sling bags</a>
                  </li>
                  <li>
                    <a>Travel bags</a>
                  </li>
                </ul>
              </div>

              <div className="footer-col">
                <h4>Company</h4>
                <ul>
                  <li>
                    <a>About us</a>
                  </li>
                  <li>
                    <a>Careers</a>
                  </li>
                  <li>
                    <a>Press</a>
                  </li>
                  <li>
                    <a>Blog</a>
                  </li>
                  <li>
                    <a>Contact</a>
                  </li>
                </ul>
              </div>

              <div className="footer-col">
                <h4>Stay updated</h4>
                <div className="newsletter">
                  <h4>Get 10% off your first order</h4>
                  <p>Subscribe for new arrivals, deals, and style tips.</p>
                  <div className="newsletter-row">
                    <input type="email" placeholder="your@email.com" />
                    <button type="button">Subscribe</button>
                  </div>
                </div>
                <ul>
                  <li>
                    <a>Help center</a>
                  </li>
                  <li>
                    <a>Track order</a>
                  </li>
                  <li>
                    <a>Shipping info</a>
                  </li>
                </ul>
              </div>
            </div>

            <div className="footer-bottom">
              <span className="footer-copy">
                © 2026 Carryio. All rights reserved.
              </span>
              <div className="footer-pay">
                <span className="footer-pay-label">We accept</span>
                <span className="pay-badge">UPI</span>
                <span className="pay-badge">Razorpay</span>
                <span className="pay-badge">Visa</span>
                <span className="pay-badge">Mastercard</span>
                <span className="pay-badge">COD</span>
              </div>
              <div className="footer-links">
                <a>Privacy policy</a>
                <a>Terms of use</a>
                <a>Sitemap</a>
              </div>
            </div>
          </footer>
        </>
      )}
    </div>
  );
}

export default App;
