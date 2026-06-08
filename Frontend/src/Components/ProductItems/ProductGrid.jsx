import ProductCard from "./ProductCard.jsx";
import "./ProductGrid.css";

const DEFAULT_PRODUCTS = [
  {
    id: 1,
    name: "Heritage Tote",
    category: "Bags",
    price: "$124",
    badge: "New",
  },
  {
    id: 2,
    name: "Urban Wallet",
    category: "Wallets",
    price: "$48",
    badge: "Hot",
  },
  { id: 3, name: "Travel Sling", category: "Bags", price: "$89" },
  { id: 4, name: "Leather Card Case", category: "Accessories", price: "$36" },
];

export default function ProductGrid({
  products = DEFAULT_PRODUCTS,
  onCardClick = () => {},
}) {
  if (products.length === 0) {
    return (
      <div className="product-grid__empty">
        <p>No products found in this category.</p>
      </div>
    );
  }

  return (
    <div className="product-grid__wrapper">
      <div className="product-grid__header">
        <h2 className="product-grid__title">Featured Products</h2>
        <span className="product-grid__view-all">View all →</span>
      </div>

      <div className="product-grid">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onClick={() => onCardClick(product)}
          />
        ))}
      </div>
    </div>
  );
}
