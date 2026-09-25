import React, { useState, useEffect } from "react";
import "./DeliveryAgentDashboard.css";

const ALLOWED_TRANSITIONS = {
  ORDER_PLACED: ["PACKED", "CANCELLED"],
  PACKED: ["PICKED_UP", "CANCELLED"],
  PICKED_UP: ["IN_TRANSIT", "CANCELLED"],
  IN_TRANSIT: ["ARRIVED_AT_HUB", "CANCELLED"],
  ARRIVED_AT_HUB: ["OUT_FOR_DELIVERY", "CANCELLED"],
  OUT_FOR_DELIVERY: ["DELIVERED", "CANCELLED"],
  DELIVERED: [],
  CANCELLED: [],
};

export default function DeliveryAgentDashboard({ user }) {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState({});
  const [locationInput, setLocationInput] = useState({});
  const [noteInput, setNoteInput] = useState({});
  const [message, setMessage] = useState("");

  const fetchAssigned = async () => {
    setLoading(true);
    try {
      const token = user?.token || localStorage.getItem("carryio_token");
      const res = await fetch("http://localhost:3000/api/v1/shipments/assigned", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setShipments(data.data.shipments || []);
      }
    } catch (err) {
      console.error("Failed to load assigned shipments:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssigned();
  }, []);

  const handleUpdate = async (shipmentId) => {
    const nextStatus = selectedStatus[shipmentId];
    if (!nextStatus) return alert("Please select a target status.");

    setUpdatingId(shipmentId);
    setMessage("");

    try {
      const token = user?.token || localStorage.getItem("carryio_token");
      const res = await fetch(`http://localhost:3000/api/v1/shipments/${shipmentId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: nextStatus,
          location: locationInput[shipmentId] || "Delivery Agent Hub",
          note: noteInput[shipmentId] || "Updated by Delivery Agent",
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to update status");
      }

      setMessage(`✅ Shipment status updated to ${nextStatus}!`);
      await fetchAssigned();
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="agent-dashboard">
      <div className="agent-header">
        <h2>🚚 Delivery Agent Dispatch Portal</h2>
        <p>Manage assigned orders, update real-time tracking checkpoints, and record delivery notes.</p>
      </div>

      {message && <div className="agent-success-msg">{message}</div>}

      {loading ? (
        <p>Loading assigned shipments...</p>
      ) : shipments.length === 0 ? (
        <div className="agent-empty-card">
          <p>No shipments currently assigned to you.</p>
        </div>
      ) : (
        <div className="agent-shipments-grid">
          {shipments.map((s) => {
            const nextStates = ALLOWED_TRANSITIONS[s.status] || [];
            return (
              <div key={s._id} className="agent-shipment-card">
                <div className="agent-card-top">
                  <span className="agent-tracking-no">{s.trackingNumber}</span>
                  <span className={`agent-status-badge ${s.status.toLowerCase()}`}>{s.status}</span>
                </div>

                <div className="agent-card-body">
                  <p><strong>Customer:</strong> {s.user?.firstName} {s.user?.lastName} ({s.user?.email})</p>
                  <p><strong>Carrier:</strong> {s.carrier}</p>
                  <p><strong>Current Location:</strong> {s.currentLocation || "En Route"}</p>
                </div>

                {nextStates.length > 0 ? (
                  <div className="agent-card-actions">
                    <label>Update Status:</label>
                    <select
                      className="agent-select"
                      value={selectedStatus[s._id] || ""}
                      onChange={(e) => setSelectedStatus({ ...selectedStatus, [s._id]: e.target.value })}
                    >
                      <option value="">-- Select Next Step --</option>
                      {nextStates.map((st) => (
                        <option key={st} value={st}>
                          {st.replace(/_/g, " ")}
                        </option>
                      ))}
                    </select>

                    <input
                      type="text"
                      placeholder="Current Location (e.g. Sector 18 Hub)"
                      className="agent-input"
                      value={locationInput[s._id] || ""}
                      onChange={(e) => setLocationInput({ ...locationInput, [s._id]: e.target.value })}
                    />

                    <input
                      type="text"
                      placeholder="Checkpoint Note (optional)"
                      className="agent-input"
                      value={noteInput[s._id] || ""}
                      onChange={(e) => setNoteInput({ ...noteInput, [s._id]: e.target.value })}
                    />

                    <button
                      className="agent-update-btn"
                      disabled={updatingId === s._id}
                      onClick={() => handleUpdate(s._id)}
                    >
                      {updatingId === s._id ? "Saving..." : "Update Checkpoint"}
                    </button>
                  </div>
                ) : (
                  <div className="agent-completed-tag">🎉 Final Status Reached ({s.status})</div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
