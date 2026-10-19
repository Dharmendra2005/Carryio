import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../api/config";
import "./Orders.css";

function formatDate(value) {
  if (!value) return "Date unavailable";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatPrice(value) {
  return `Rs. ${Number(value || 0).toLocaleString("en-IN")}`;
}

function getStatus(order) {
  return order.shipment?.status || order.status || "New";
}

function getStatusLabel(status) {
  return String(status)
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export default function Orders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    apiFetch("/orders")
      .then((data) => {
        if (active) setOrders(data.orders || []);
      })
      .catch((err) => {
        if (active) setError(err.message || "Unable to load your orders.");
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const trackOrder = (order) => {
    const identifier = order.shipment?.trackingNumber || order.id || order._id;
    if (identifier) {
      navigate("/track", { state: { trackingQuery: identifier } });
    }
  };

  return (
    <main className="main orders-page">
      <div className="orders-heading">
        <div>
          <span className="section-title">My orders</span>
          <h1>Order history</h1>
          <p>View your purchases and track every delivery.</p>
        </div>
        <button type="button" className="btn-ghost" onClick={() => navigate("/")}>
          Continue shopping
        </button>
      </div>

      {isLoading ? <p className="orders-message">Loading your orders...</p> : null}
      {!isLoading && error ? <p className="orders-message orders-error">{error}</p> : null}
      {!isLoading && !error && orders.length === 0 ? (
        <div className="orders-empty">
          <i className="ti ti-package" aria-hidden="true" />
          <h2>No orders yet</h2>
          <p>Your completed purchases will appear here.</p>
          <button type="button" className="btn-primary" onClick={() => navigate("/products")}>
            Browse products
          </button>
        </div>
      ) : null}

      <div className="orders-list">
        {orders.map((order) => {
          const status = getStatus(order);
          const orderNumber = order.id || order._id;

          return (
            <article className="order-card" key={orderNumber}>
              <div className="order-card-top">
                <div>
                  <span className="order-label">Order ID</span>
                  <strong className="order-id">{orderNumber}</strong>
                </div>
                <span className={`order-status status-${String(status).toLowerCase()}`}>
                  {getStatusLabel(status)}
                </span>
              </div>

              <div className="order-card-meta">
                <span>Placed {formatDate(order.createdAt)}</span>
                <span>{formatPrice(order.totalAmount)}</span>
                <span>{order.items?.length || 0} item(s)</span>
              </div>

              <div className="order-items">
                {(order.items || []).map((item) => (
                  <div className="order-item" key={item.id || `${item.name}-${item.quantity}`}>
                    <span>{item.name}</span>
                    <span>× {item.quantity}</span>
                  </div>
                ))}
              </div>

              <div className="order-card-actions">
                <span className="order-delivery-status">
                  {order.shipment?.trackingNumber
                    ? `Tracking: ${order.shipment.trackingNumber}`
                    : "Tracking will be available after dispatch"}
                </span>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => trackOrder(order)}
                  disabled={!order.shipment || !orderNumber}
                >
                  {order.shipment ? "Track order" : "Tracking unavailable"}
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </main>
  );
}
