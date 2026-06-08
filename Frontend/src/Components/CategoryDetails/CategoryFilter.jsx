import "./CategoryFilter.css";

const DEFAULT_CATEGORIES = [
  { value: "all", label: "All" },
  { value: "bags", label: "Bags" },
  { value: "wallets", label: "Wallets" },
  { value: "accessories", label: "Accessories" },
];

export default function CategoryFilter({
  categories = DEFAULT_CATEGORIES,
  active = "all",
  onChange = () => {},
}) {
  return (
    <div className="cat-filter">
      <div className="cat-filter__header">
        <h2 className="cat-filter__title">Categories</h2>
      </div>
      <div className="cat-filter__pills">
        {categories.map((cat) => (
          <button
            key={cat.value}
            className={`cat-filter__pill ${active === cat.value ? "cat-filter__pill--active" : ""}`}
            onClick={() => onChange(cat.value)}
          >
            {cat.label}
          </button>
        ))}
      </div>
    </div>
  );
}
