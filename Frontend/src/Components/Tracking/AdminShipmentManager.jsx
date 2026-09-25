import React, { useState, useEffect } from "react";
import "./AdminShipmentManager.css";

export default function AdminShipmentManager({ user }) {
  const [shipments, setShipments] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [agentInput, setAgentInput] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("shipments");

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = user?.token || localStorage.getItem("carryio_token");

      // Fetch All Shipments
      const resShipments = await fetch("http://localhost:3000/api/v1/shipments/all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const dataShipments = await resShipments.json();
      if (dataShipments.success) {
        setShipments(dataShipments.data.shipments || []);
      }

      // Fetch Telemetry Health Metrics
      const resHealth = await fetch("http://localhost:3000/health");
      const dataHealth = await resHealth.json();
      if (dataHealth.metrics) {
        setMetrics(dataHealth.metrics);
      }
    } catch (err) {
      console.error("Admin fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAssignAgent = async (shipmentId) => {
    const agentId = agentInput[shipmentId];
    if (!agentId) return alert("Please enter a valid Delivery Agent User ID.");

    try {
      const token = user?.token || localStorage.getItem("carryio_token");
      const res = await fetch(`http://localhost:3000/api/v1/shipments/${shipmentId}/assign`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ agentId }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to assign agent");
      }

      alert("Delivery agent assigned successfully!");
      fetchData();
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  return (
    <div className="admin-shipment-container">
      <div className="admin-header-row">
        <div>
          <h2 className="admin-title">👑 Admin Operations & Telemetry Console</h2>
          <p className="admin-sub">Manage global logistics, assign dispatch agents, and monitor backend telemetry.</p>
        </div>

        <div className="admin-tab-row">
          <button
            className={`admin-tab-btn ${activeTab === "shipments" ? "active" : ""}`}
            onClick={() => setActiveTab("shipments")}
          >
            📦 Shipments ({shipments.length})
          </button>
          <button
            className={`admin-tab-btn ${activeTab === "observability" ? "active" : ""}`}
            onClick={() => setActiveTab("observability")}
          >
            📊 Telemetry Metrics
          </button>
        </div>
      </div>

      {activeTab === "observability" && metrics && (
        <div className="admin-telemetry-grid">
          <div className="metric-card">
            <span className="metric-label">Requests / Sec</span>
            <span className="metric-val">{metrics.requestsPerSecond || 0}</span>
          </div>
          <div className="metric-card">
            <span className="metric-label">Avg API Latency</span>
            <span className="metric-val">{metrics.avgLatencyMs || 0} ms</span>
          </div>
          <div className="metric-card">
            <span className="metric-label">Error Rate</span>
            <span className="metric-val text-red">{metrics.errorRate || "0.00%"}</span>
          </div>
          <div className="metric-card">
            <span className="metric-label">Cache Hit Rate</span>
            <span className="metric-val text-green">{metrics.cacheHitRate || "100.00%"}</span>
          </div>
          <div className="metric-card">
            <span className="metric-label">DB Latency</span>
            <span className="metric-val">{metrics.avgDbLatencyMs || 0} ms</span>
          </div>
          <div className="metric-card">
            <span className="metric-label">Payment Failures</span>
            <span className="metric-val">{metrics.paymentFailuresTotal || 0}</span>
          </div>
        </div>
      )}

      {activeTab === "shipments" && (
        <div className="admin-table-card">
          {loading ? (
            <p>Loading all shipments...</p>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Tracking #</th>
                  <th>Customer</th>
                  <th>Status</th>
                  <th>Location</th>
                  <th>Assigned Agent</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {shipments.map((s) => (
                  <tr key={s._id}>
                    <td className="font-mono">{s.trackingNumber}</td>
                    <td>{s.user?.firstName} {s.user?.lastName}</td>
                    <td>
                      <span className="status-tag">{s.status}</span>
                    </td>
                    <td>{s.currentLocation || "Fulfillment Hub"}</td>
                    <td>
                      {s.assignedAgent
                        ? `${s.assignedAgent.firstName} (${s.assignedAgent.email})`
                        : "Unassigned"}
                    </td>
                    <td>
                      <div className="assign-cell">
                        <input
                          type="text"
                          placeholder="Agent User ID..."
                          className="admin-agent-input"
                          value={agentInput[s._id] || ""}
                          onChange={(e) => setAgentInput({ ...agentInput, [s._id]: e.target.value })}
                        />
                        <button
                          className="admin-assign-btn"
                          onClick={() => handleAssignAgent(s._id)}
                        >
                          Assign Agent
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
