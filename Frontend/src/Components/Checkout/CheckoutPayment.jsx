import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "./Checkout.css";

const PAYMENT_METHODS = [
  {
    id: "upi",
    label: "UPI",
    detail: "Pay instantly with any UPI app",
  },
  {
    id: "cod",
    label: "COD",
    detail: "Pay cash when your order arrives",
  },
  {
    id: "card",
    label: "Card",
    detail: "Use debit or credit card",
  },
];

const PLATFORM_FEE = 35;
const COD_FEE = 9;

function getPriceValue(price) {
  const amount = String(price).replace(/[^0-9]/g, "");
  return Number(amount || 0);
}

function formatPrice(amount) {
  return `Rs. ${amount.toLocaleString("en-IN")}`;
}

export default function CheckoutPayment() {
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const location = useLocation();
  const product = location.state?.product || {
    title: "Selected product",
    price: "Rs. 1,999",
  };
  const address = location.state?.address;
  const itemTotal = getPriceValue(product.price);
  const codFee = paymentMethod === "cod" ? COD_FEE : 0;
  const amountPayable = itemTotal + PLATFORM_FEE + codFee;
  const selectedMethod = PAYMENT_METHODS.find(
    (method) => method.id === paymentMethod,
  );

  return (
    <div className="main checkout-page">
      <div className="section-top">
        <span className="section-title">Payment</span>
        <Link to="/" className="section-view-all">
          Back to home
        </Link>
      </div>

      <div className="checkout-shell checkout-shell-final">
        <section className="checkout-form">
          <div>
            <h1>Final payment</h1>
            <p>
              Confirm the order amount and delivery address before completing
              payment.
            </p>
          </div>

          <div className="payment-card">
            <div>
              <span>Product</span>
              <strong>{product.title}</strong>
            </div>
            <div>
              <span>Payment method</span>
              <strong>{selectedMethod?.label}</strong>
            </div>
          </div>

          <div className="payment-methods">
            {PAYMENT_METHODS.map((method) => (
              <button
                type="button"
                key={method.id}
                className={`payment-method ${
                  paymentMethod === method.id ? "active" : ""
                }`}
                onClick={() => setPaymentMethod(method.id)}
              >
                <span>{method.label}</span>
                <strong>{method.detail}</strong>
                {method.id === "cod" ? <em>+ Rs. 9 fee</em> : null}
              </button>
            ))}
          </div>

          <div className="payment-breakdown">
            <div>
              <span>Item total</span>
              <strong>{formatPrice(itemTotal)}</strong>
            </div>
            <div>
              <span>Platform fee</span>
              <strong>{formatPrice(PLATFORM_FEE)}</strong>
            </div>
            {paymentMethod === "cod" ? (
              <div>
                <span>COD fee</span>
                <strong>{formatPrice(COD_FEE)}</strong>
              </div>
            ) : null}
            <div className="payment-breakdown-total">
              <span>Amount payable</span>
              <strong>{formatPrice(amountPayable)}</strong>
            </div>
          </div>

          <button type="button" className="btn-primary payment-final-btn">
            Continue
          </button>
        </section>

        <aside className="checkout-summary">
          <span>Deliver to</span>
          <strong>{address?.fullName || "Saved customer"}</strong>
          <p>
            {address
              ? `${address.addressLine}, ${address.city}, ${address.state} - ${address.pincode}`
              : "Address details will appear here after the address step."}
          </p>
          <p>Mobile: {address?.mobile || "Not added"}</p>
        </aside>
      </div>
    </div>
  );
}
