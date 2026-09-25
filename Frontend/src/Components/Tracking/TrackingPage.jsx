import React, { useState, useEffect } from "react";
import TrackingTimeline from "./TrackingTimeline";
import "./TrackingPage.css";

export default function TrackingPage({ initialQuery = "" }) {
  const [query, setQuery] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const [shipment, setShipment] = useState(null);
  const [error, setError] = useState("");

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError("");
    setShipment(null);

    try {
      const response = await fetch(`http://localhost:3000/api/v1/shipments/track/${encodeURIComponent(query.trim())}`);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Shipment not found");
      }

      setShipment(data.data.shipment);
    } catch (err) {
      setError(err.message || "Unable to locate shipment. Please check your tracking number or order ID.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialQuery) {
      handleSearch();
    }
  }, [initialQuery]);

  return (
    <div className="tracking-page-container">
      <div className="tracking-hero">
        <h1 className="tracking-page-title">Real-Time Shipment Tracking</h1>
        <p className="tracking-page-subtitle">
          Enter your Carryio Tracking Number (e.g. <code>CRY-1718293-4921</code>) or Order ID to view live progress.
        </p>

        <form onSubmit={handleSearch} className="tracking-search-form">
          <input
            type="text"
            className="tracking-search-input"
            placeholder="Enter Tracking # or Order ID..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="submit" className="tracking-search-button" disabled={loading}>
            {loading ? "Locating..." : "Track Package"}
          </button>
        </form>
      </div>

      {error && <div className="tracking-error-alert">❌ {error}</div>}

      {shipment && (
        <div className="shipment-result-wrapper">
          <div className="shipment-meta-card">
            <div className="meta-group">
              <span className="meta-label">Tracking Number</span>
              <span className="meta-val font-mono">{shipment.trackingNumber}</span>
            </div>
            <div className="meta-group">
              <span className="meta-label">Carrier</span>
              <span className="meta-val">{shipment.carrier}</span>
            </div>
            <div className="meta-group">
              <span className="meta-label">Current Location</span>
              <span className="meta-val">{shipment.currentLocation || "In Transit"}</span>
            </div>
            <div className="meta-group">
              <span className="meta-label">Est. Delivery</span>
              <span className="meta-val">
                {shipment.estimatedDelivery
                  ? new Date(shipment.estimatedDelivery).toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })
                  : "3-5 Business Days"}
              </span>
            </div>
          </div>

          <TrackingTimeline
            currentStatus={shipment.status}
            statusHistory={shipment.statusHistory}
            trackingEvents={shipment.trackingEvents}
          />
        </div>
      )}
    </div>
  );
}
