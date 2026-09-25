import React from "react";
import "./TrackingTimeline.css";

const TIMELINE_STEPS = [
  { key: "ORDER_PLACED", label: "Order Placed", icon: "✓" },
  { key: "PACKED", label: "Packed", icon: "✓" },
  { key: "PICKED_UP", label: "Picked Up", icon: "✓" },
  { key: "IN_TRANSIT", label: "In Transit", icon: "●" },
  { key: "ARRIVED_AT_HUB", label: "Arrived at Hub", icon: "○" },
  { key: "OUT_FOR_DELIVERY", label: "Out for Delivery", icon: "○" },
  { key: "DELIVERED", label: "Delivered", icon: "○" },
];

export default function TrackingTimeline({ currentStatus = "ORDER_PLACED", statusHistory = [], trackingEvents = [] }) {
  const isCancelled = currentStatus === "CANCELLED";

  // Determine index of current status
  const currentStepIndex = TIMELINE_STEPS.findIndex((step) => step.key === currentStatus);

  // Merge history/events for details view
  const eventsList = trackingEvents.length > 0 ? trackingEvents : statusHistory;

  return (
    <div className="tracking-timeline-card">
      <div className="tracking-timeline-header">
        <h3 className="tracking-title">Shipment Progress Timeline</h3>
        <div className={`status-pill ${isCancelled ? "cancelled" : "active"}`}>
          {isCancelled ? "CANCELLED" : currentStatus.replace(/_/g, " ")}
        </div>
      </div>

      {isCancelled ? (
        <div className="tracking-cancelled-banner">
          ⚠️ This shipment has been cancelled. Please contact customer support for further assistance.
        </div>
      ) : (
        <div className="timeline-wrapper">
          <div className="timeline-track">
            {TIMELINE_STEPS.map((step, idx) => {
              const isCompleted = currentStepIndex > idx;
              const isCurrent = currentStepIndex === idx;
              const isUpcoming = currentStepIndex < idx;

              let stateClass = "upcoming";
              let displaySymbol = "○";

              if (isCompleted) {
                stateClass = "completed";
                displaySymbol = "✓";
              } else if (isCurrent) {
                stateClass = "current";
                displaySymbol = "●";
              }

              return (
                <div key={step.key} className={`timeline-node ${stateClass}`}>
                  <div className="node-icon-wrapper">
                    <span className="node-icon">{displaySymbol}</span>
                  </div>
                  <div className="node-label">{step.label}</div>
                  {idx < TIMELINE_STEPS.length - 1 && (
                    <div className={`timeline-line ${isCompleted ? "completed-line" : ""}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* History Log Section */}
      <div className="tracking-events-section">
        <h4 className="events-title">Detailed Tracking Activity Log</h4>
        {eventsList && eventsList.length > 0 ? (
          <div className="events-list">
            {eventsList.map((event, index) => (
              <div key={event._id || event.id || index} className="event-item">
                <div className="event-bullet" />
                <div className="event-details">
                  <div className="event-top">
                    <span className="event-status">{event.status?.replace(/_/g, " ")}</span>
                    <span className="event-time">
                      {new Date(event.createdAt || event.timestamp).toLocaleString()}
                    </span>
                  </div>
                  {event.location && (
                    <div className="event-location">
                      📍 <strong>Location:</strong> {event.location}
                    </div>
                  )}
                  {event.note && <div className="event-note">{event.note}</div>}
                  <div className="event-updated-by">Updated by: {event.updatedBy || "System"}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-events-text">No activity history recorded yet.</p>
        )}
      </div>
    </div>
  );
}
