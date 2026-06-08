import "./HeroSection.css";

const STATS = [
  { value: "200+", label: "Products" },
  { value: "12k+", label: "Customers" },
  { value: "4.9★", label: "Rating" },
];

export default function HeroSection() {
  return (
    <section className="hero">
      <div className="hero__content">
        <div className="hero__eyebrow">
          <span className="hero__eyebrow-line" />
          <span className="hero__eyebrow-text">New Collection 2025</span>
        </div>

        <h1 className="hero__heading">
          Carry more than<br />
          just <em>essentials</em>
        </h1>

        <p className="hero__sub">
          Premium handcrafted bags and accessories built for the modern
          individual. Timeless quality, contemporary design.
        </p>

        <div className="hero__actions">
          <button className="hero__btn hero__btn--primary">
            Shop collection
          </button>
          <button className="hero__btn hero__btn--ghost">
            Explore categories
          </button>
        </div>

        <div className="hero__stats">
          {STATS.map((s) => (
            <div key={s.label} className="hero__stat">
              <span className="hero__stat-num">{s.value}</span>
              <span className="hero__stat-label">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* decorative visual */}
      <div className="hero__visual" aria-hidden="true">
        <svg viewBox="0 0 100 80" width="72" height="72" fill="none" stroke="#C9A84C" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="10" y="20" width="80" height="55" rx="6" />
          <path d="M35 20 C35 8 65 8 65 20" />
          <line x1="10" y1="38" x2="90" y2="38" />
          <rect x="42" y="30" width="16" height="16" rx="3" />
        </svg>
        <span className="hero__visual-label">Carryio Originals</span>
      </div>
    </section>
  );
}
