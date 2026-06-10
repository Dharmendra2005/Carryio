import "./Toggle.css";

export default function Toggle({ on, onChange }) {
  return (
    <button
      role="switch"
      aria-checked={on}
      className={`toggle ${on ? "toggle--on" : ""}`}
      onClick={() => onChange?.(!on)}
    />
  );
}
