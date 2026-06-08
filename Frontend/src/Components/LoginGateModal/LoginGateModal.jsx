import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./LoginGateModal.css";

export default function LoginGateModal({ isOpen, product, onClose }) {
  const navigate = useNavigate();

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  // Prevent background scroll when open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="lgm-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="lgm-title"
    >
      <div className="lgm-modal">
        {/* Close button */}
        <button className="lgm-close" onClick={onClose} aria-label="Close">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Icon */}
        <div className="lgm-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
            stroke="#C9A84C" strokeWidth="2" strokeLinecap="round">
            <rect x="3" y="11" width="18" height="11" rx="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>

        {/* Copy */}
        <h2 className="lgm-title" id="lgm-title">Members only</h2>
        <p className="lgm-body">
          {product
            ? <>Log in to view <strong>{product.name}</strong> — pricing, details, and add to cart.</>
            : "Log in or create a free Carryio account to view product details and add items to your cart."
          }
        </p>

        {/* Actions */}
        <div className="lgm-actions">
          <button
            className="lgm-btn lgm-btn--primary"
            onClick={() => { onClose(); navigate("/login"); }}
          >
            Log in to Carryio
          </button>
          <button
            className="lgm-btn lgm-btn--ghost"
            onClick={() => { onClose(); navigate("/register"); }}
          >
            Create free account
          </button>
          <button className="lgm-btn lgm-btn--text" onClick={onClose}>
            Continue browsing
          </button>
        </div>
      </div>
    </div>
  );
}
