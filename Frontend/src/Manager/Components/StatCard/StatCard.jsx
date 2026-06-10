import "./StatCard.css";

export default function StatCard({ label, value, change, changeType = "up", icon }) {
  return (
    <div className="stat-card">
      {icon && (
        <div className="stat-card__icon" aria-hidden="true">
          {icon}
        </div>
      )}
      <div className="stat-card__label">{label}</div>
      <div className="stat-card__value">{value}</div>
      {change && (
        <div className={`stat-card__change stat-card__change--${changeType}`}>
          {changeType === "up" ? "↑" : changeType === "down" ? "↓" : ""} {change}
        </div>
      )}
    </div>
  );
}
