import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useApp } from "../context/AppContext";
import LoginGateModal from "../Components/LoginGateModal/LoginGateModal";
import "../Components/Cart/Cart.css";

function getItemTotal(item) {
  const amount = String(item.price || "").replace(/[^0-9]/g, "");
  return Number(amount || 0) * item.quantity;
}

function formatPrice(amount) {
  return `Rs. ${amount.toLocaleString("en-IN")}`;
}

export default function Cart() {
  const {
    cartItems,
    cartCount,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
  } = useApp();

  const cartTotal = cartItems.reduce((sum, item) => sum + getItemTotal(item), 0);
  const [showLogin, setShowLogin] = useState(false);
  const navigate = useNavigate();

  const handleCheckout = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:3000/addresses", {
        credentials: "include",
      });

      if (!response.ok) {
        alert("Please login first");
        setShowLogin(true);
        return;
      }

      const checkoutData = {
        items: cartItems.map((item) => ({
          name: item.name,
          price: Number(String(item.price).replace(/[^0-9]/g, "")),
          quantity: item.quantity,
          category: item.cat || "",
        })),
        total: cartTotal,
        title: `${cartCount} items from Cart`,
      };

      navigate("/checkout/address", { state: checkoutData });
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

      {cartItems.length === 0 ? (
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
            {cartItems.map((item) => (
              <div className="cart-item" key={item.name}>
                <div
                  className="cart-item-img"
                  style={{ background: item.bg || "#F7F1ED" }}
                >
                  {item.images?.[0] ? (
                    <img
                      src={item.images[0]}
                      alt={item.name}
                      style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "inherit" }}
                    />
                  ) : (
                    <i
                      className={`ti ${item.icon || "ti-briefcase"}`}
                      style={{ color: item.color || "#D85A30" }}
                      aria-hidden="true"
                    />
                  )}
                </div>
                <div className="cart-item-info">
                  <span>{item.cat}</span>
                  <strong>{item.name}</strong>
                  <p>{item.price}</p>
                </div>
                <div className="cart-qty">
                  <button type="button" onClick={() => decreaseQuantity(item.name)}>
                    -
                  </button>
                  <span>{item.quantity}</span>
                  <button type="button" onClick={() => increaseQuantity(item.name)}>
                    +
                  </button>
                </div>
                <div className="cart-item-total">
                  <strong>{formatPrice(getItemTotal(item))}</strong>
                  <button type="button" onClick={() => removeFromCart(item.name)}>
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
              <strong>{cartCount}</strong>
            </div>
            <div>
              <p>Subtotal</p>
              <strong>{formatPrice(cartTotal)}</strong>
            </div>
            <LoginGateModal
              isOpen={showLogin}
              onClose={() => setShowLogin(false)}
            />
            <button
              onClick={handleCheckout}
              className="btn-primary cart-link-btn"
              style={{ width: "100%", border: "none", cursor: "pointer" }}
            >
              Proceed to checkout
            </button>
          </aside>
        </div>
      )}
    </div>
  );
}
