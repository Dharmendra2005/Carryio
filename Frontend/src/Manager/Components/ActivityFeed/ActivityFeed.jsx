import "./ActivityFeed.css";

const TYPE_CLASS = {
  success: "activity__dot--success",
  default: "activity__dot--default",
  muted:   "activity__dot--muted",
};

export default function ActivityFeed({ items = [] }) {
  return (
    <div className="activity-feed">
      {items.map((item, i) => (
        <div key={i} className="activity-item">
          <div className={`activity__dot ${TYPE_CLASS[item.type ?? "default"]}`} />
          <div>
            <div className="activity__title">{item.title}</div>
            <div className="activity__time">{item.time}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
