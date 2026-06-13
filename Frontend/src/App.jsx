import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./App.css";
import logo from "./assets/carryio_logo.svg";
import ManagerApp from "./Manager/ManagerApp";
import ManagerLogin from "./Components/ManagerLogin/managerLogin";

import UserLogin from "./Components/Auth/Login";
import Cart from "./Components/Cart/Cart";
import CheckoutAddress from "./Components/Checkout/CheckoutAddress";
import CheckoutPayment from "./Components/Checkout/CheckoutPayment";
import ProductDetail from "./Components/ProductDetail/ProductDetail";
import { fetchStoreProducts } from "./api/products";

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
const CART_STORAGE_KEY = "carryio_cart";

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
  const [cartItems, setCartItems] = useState(() => {
    const storedCart = localStorage.getItem(CART_STORAGE_KEY);
    return storedCart ? JSON.parse(storedCart) : [];
  });
  const [menuOpen, setMenuOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let active = true;

    fetchStoreProducts()
      .then((items) => {
        if (active) setProducts(items);
      })
      .catch((err) => {
        console.error("Failed to load products:", err);
      })
      .finally(() => {
        if (active) setProductsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
  }, [cartItems]);

  const filteredProducts =
    active === "all"
      ? products
      : products.filter((product) => product.cat === active);

  const openAuthPage = (path) => {
    navigate(path, {
      state: { returnTo: location.pathname, product: location.state?.product },
    });
  };

  const isAuthPage =
    location.pathname === "/login" || location.pathname === "/register";

  const isManagerRoute = location.pathname.startsWith("/manager");

  const activeProduct = useMemo(() => {
    if (!location.pathname.startsWith("/product/")) {
      return null;
    }

    const productSlug = location.pathname.replace("/product/", "");
    return (
      products.find((product) => slugify(product.name) === productSlug) || null
    );
  }, [location.pathname, products]);

  const handleAuthSuccess = (nextUser) => {
    setUser(nextUser);
  };

  const handleLogout = async () => {
    const confirmLogout = window.confirm("Are you sure you want to log out?");

    if (!confirmLogout) return;

    try {
      await fetch("http://localhost:3000/logout", {
        method: "POST",
        credentials: "include",
      });

      setUser(null);
      setCartItems([]);

      localStorage.removeItem(AUTH_STORAGE_KEY);
      localStorage.removeItem(CART_STORAGE_KEY);

      navigate("/");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const handleProductClick = (product) => {
    navigate(`/product/${slugify(product.name)}`, {
      state: { product },
    });
  };

  const handleAddToCart = (product) => {
    setCartItems((currentItems) => {
      const existingItem = currentItems.find(
        (item) => item.name === product.name,
      );

      if (existingItem) {
        return currentItems.map((item) =>
          item.name === product.name
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }

      return [...currentItems, { ...product, quantity: 1 }];
    });

    navigate("/cart");
  };

  const increaseCartItem = (name) => {
    setCartItems((currentItems) =>
      currentItems.map((item) =>
        item.name === name ? { ...item, quantity: item.quantity + 1 } : item,
      ),
    );
  };

  const decreaseCartItem = (name) => {
    setCartItems((currentItems) =>
      currentItems
        .map((item) =>
          item.name === name
            ? { ...item, quantity: Math.max(item.quantity - 1, 0) }
            : item
        )
        .filter((item) => item.quantity > 0),
    );
  };

  const removeCartItem = (name) => {
    setCartItems((currentItems) =>
      currentItems.filter((item) => item.name !== name),
    );
  };

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

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
        <button
          type="button"
          className="nav-cart"
          onClick={() => navigate("/cart")}
        >
          <i
            className="ti ti-shopping-bag"
            aria-hidden="true"
            style={{ fontSize: 16 }}
          />
          Cart ({cartCount})
        </button>

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

  if (location.pathname === "/manager/login") {
    return <ManagerLogin />;
  }

  if (location.pathname === "/manager") {
    return <ManagerApp />;
  }

  return (
    <div className="wrap" id="wrap">
      {!isManagerRoute && renderHeader()}

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
      ) : location.pathname === "/cart" ? (
        <Cart
          items={cartItems}
          onIncrease={increaseCartItem}
          onDecrease={decreaseCartItem}
          onRemove={removeCartItem}
        />
      ) : location.pathname.startsWith("/product/") ? (
        <ProductDetail
          product={activeProduct || location.state?.product || null}
          isAuthenticated={Boolean(user)}
          onLogin={() => openAuthPage("/login")}
          onSignup={() => openAuthPage("/register")}
          onAddToCart={handleAddToCart}
        />
      ) : (
        <>
          <div className="hero">
            <div className="hero-img">
              <img src={logo} alt="Carryio Logo" />
            </div>
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
              {productsLoading ? (
                <p style={{ gridColumn: "1 / -1", color: "#70665e" }}>
                  Loading products…
                </p>
              ) : filteredProducts.length === 0 ? (
                <p style={{ gridColumn: "1 / -1", color: "#70665e" }}>
                  No products available yet. Managers can add products from the manager panel.
                </p>
              ) : null}
              {filteredProducts.map((product) => (
                <div
                  key={product._id || `${product.cat}-${product.name}`}
                  className="card"
                  onClick={() => handleProductClick(product)}
                >
                  <div className="card-img" style={{ background: product.bg }}>
                    {product.images?.[0] ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          borderRadius: "inherit",
                        }}
                      />
                    ) : (
                      <i
                        className={`ti ${product.icon}`}
                        style={{ color: product.color, fontSize: 48 }}
                        aria-hidden="true"
                      />
                    )}
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
                    <i className="ti ti-brand-instagram" aria-label="Instagram" />
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
                  <li><a>Tote bags</a></li>
                  <li><a>Backpacks</a></li>
                  <li><a>Wallets</a></li>
                  <li><a>Clutches</a></li>
                  <li><a>Sling bags</a></li>
                  <li><a>Travel bags</a></li>
                </ul>
              </div>

              <div className="footer-col">
                <h4>Company</h4>
                <ul>
                  <li><a>About us</a></li>
                  <li><a>Careers</a></li>
                  <li><a>Press</a></li>
                  <li><a>Blog</a></li>
                  <li><a>Contact</a></li>
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
                  <li><a>Help center</a></li>
                  <li><a>Track order</a></li>
                  <li><a>Shipping info</a></li>
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