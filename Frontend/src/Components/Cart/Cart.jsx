import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import "./Cart.css";
import LoginGateModal from "../LoginGateModal/LoginGateModal";

function getItemTotal(item) {
  const amount = String(item.price || "").replace(/[^0-9]/g, "");
  return Number(amount || 0) * item.quantity;
}

function formatPrice(amount) {
  return `Rs. ${amount.toLocaleString("en-IN")}`;
}

export default function Cart({ items, onIncrease, onDecrease, onRemove }) {
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = items.reduce((sum, item) => sum + getItemTotal(item), 0);
  const [showLogin, setShowLogin] = useState(false);

  const navigate = useNavigate();

  const handleCheckout = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:3000/addresses", {
        credentials: "include",
      });
      console.log("Auth check response:", response);

      if (!response.ok) {
        alert("Please login first");
        setShowLogin(true);
        return;
      }

      navigate("/checkout/address");
    } catch (err) {
      alert("Unable to verify login");
      console.error("Error checking auth:", err);
    }
  };

  return (
    <div className="main cart-page">
      <div className="section-top">
        <span className="section-title">Your cart</span>
        <Link to="/" className="section-view-all">
          Continue shopping
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="cart-empty">
          <i className="ti ti-shopping-bag" aria-hidden="true" />
          <h1>Your cart is empty</h1>
          <p>Add a product to your cart and it will appear here.</p>
          <Link to="/" className="btn-primary cart-link-btn">
            Browse products
          </Link>
        </div>
      ) : (
        <div className="cart-shell">
          <div className="cart-list">
            {items.map((item) => (
              <div className="cart-item" key={item.name}>
                <div
                  className="cart-item-img"
                  style={{ background: item.bg || "#F7F1ED" }}
                >
                  <i
                    className={`ti ${item.icon || "ti-briefcase"}`}
                    style={{ color: item.color || "#D85A30" }}
                    aria-hidden="true"
                  />
                </div>
                <div className="cart-item-info">
                  <span>{item.cat}</span>
                  <strong>{item.name}</strong>
                  <p>{item.price}</p>
                </div>
                <div className="cart-qty">
                  <button type="button" onClick={() => onDecrease(item.name)}>
                    -
                  </button>
                  <span>{item.quantity}</span>
                  <button type="button" onClick={() => onIncrease(item.name)}>
                    +
                  </button>
                </div>
                <div className="cart-item-total">
                  <strong>{formatPrice(getItemTotal(item))}</strong>
                  <button type="button" onClick={() => onRemove(item.name)}>
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          <aside className="cart-summary">
            <span>Cart summary</span>
            <div>
              <p>Items</p>
              <strong>{totalItems}</strong>
            </div>
            <div>
              <p>Subtotal</p>
              <strong>{formatPrice(cartTotal)}</strong>
            </div>
              <LoginGateModal
                isOpen={showLogin}
                onClose={() => setShowLogin(false)}
              />
            <Link
              to="/checkout/address"
              className="btn-primary cart-link-btn"
              onClick={handleCheckout}
            >
              Proceed to checkout
            </Link>
          </aside>
        </div>
      )}
    </div>
  );
}
