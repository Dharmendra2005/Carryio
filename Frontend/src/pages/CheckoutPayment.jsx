import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import "../Components/Checkout/Checkout.css";
import CODPayment from "../Components/PaymentMethod/COD";
import UPIPayment from "../Components/PaymentMethod/UPI";

const PAYMENT_METHODS = [
  {
    id: "card",
    label: "Card",
    detail: "UPI, cards, Net Banking & Wallets",
  },
  {
    id: "upi",
    label: "UPI",
    detail: "GPay, PhonePe, Paytm, BHIM & more",
  },
  {
    id: "cod",
    label: "COD",
    detail: "Pay cash when your order arrives",
  },
];

const PLATFORM_FEE = 35;
const COD_FEE = 9;

function formatPrice(amount) {
  return `Rs. ${amount.toLocaleString("en-IN")}`;
}

export default function CheckoutPayment() {
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [showCOD, setShowCOD] = useState(false);
  const [showUPI, setShowUPI] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const { clearCart } = useApp();

  const checkoutData = location.state?.checkoutData || {
    items: [{ name: "Selected product", price: 1999, quantity: 1, category: "" }],
    total: 1999,
    title: "Selected product",
  };
  const address = location.state?.address;

  const itemTotal = checkoutData.total;
  const codFee = paymentMethod === "cod" ? COD_FEE : 0;
  const amountPayable = itemTotal + PLATFORM_FEE + codFee;
  const selectedMethod = PAYMENT_METHODS.find((method) => method.id === paymentMethod);

  // Place UPI or COD Order
  const placeOrderDirect = async (method) => {
    if (!address?._id) {
      alert("Please save delivery address before placing order.");
      return;
    }

    setIsPlacingOrder(true);

    try {
      const response = await fetch("http://localhost:3000/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          addressId: address._id,
          items: checkoutData.items,
          paymentMethod: method,
          platformFee: PLATFORM_FEE,
          codFee: method === "cod" ? COD_FEE : 0,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Order failed");
        return;
      }

      // Order placed successfully, clear cart
      clearCart();

      if (method === "cod") {
        setShowCOD(true);
      } else {
        alert("Order placed successfully via UPI!");
        navigate("/", { replace: true });
      }
    } catch (err) {
      console.error(err);
      alert("Unable to place order.");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!address?._id) {
      alert("Please save delivery address before placing order.");
      return;
    }

    if (paymentMethod === "card") {
      try {
        const response = await fetch("http://localhost:3000/payment/create-order", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount: amountPayable,
          }),
        });

        const order = await response.json();

        const options = {
          key: "rzp_test_T0H6qpVYSGjvTz",
          amount: order.amount,
          currency: order.currency,
          order_id: order.id,
          name: "Carryio",
          description: checkoutData.title,
          handler: async function (payment) {
            try {
              const verify = await fetch("http://localhost:3000/payment/verify", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                  razorpay_order_id: payment.razorpay_order_id,
                  razorpay_payment_id: payment.razorpay_payment_id,
                  razorpay_signature: payment.razorpay_signature,
                  addressId: address._id,
                  items: checkoutData.items,
                  paymentMethod: "card",
                  platformFee: PLATFORM_FEE,
                }),
              });

              const data = await verify.json();

              if (verify.ok) {
                alert("Payment Successful!");
                clearCart();
                navigate("/", { replace: true });
              } else {
                alert(data.message || "Payment verification failed.");
              }
            } catch (err) {
              console.error(err);
              alert("Error verifying payment.");
            }
          },
          prefill: {
            name: address.fullName,
            contact: address.mobile,
          },
          theme: {
            color: "#D85A30",
          },
        };

        const razorpay = new window.Razorpay(options);
        razorpay.open();
      } catch (err) {
        console.error(err);
        alert("Unable to start payment.");
      }
      return;
    }

    if (paymentMethod === "upi") {
      setShowUPI(true);
      return;
    }

    // Cash on Delivery
    await placeOrderDirect("cod");
  };

  if (showCOD) {
    return (
      <CODPayment
        checkoutData={checkoutData}
        address={address}
        amountPayable={amountPayable}
      />
    );
  }

  if (showUPI) {
    return (
      <UPIPayment
        checkoutData={checkoutData}
        address={address}
        amountPayable={amountPayable}
        onPay={() => placeOrderDirect("upi")}
      />
    );
  }

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
              <span>Products</span>
              <strong>{checkoutData.title}</strong>
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
                className={`payment-method ${paymentMethod === method.id ? "active" : ""}`}
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

          <button
            type="button"
            className="btn-primary payment-final-btn"
            onClick={handlePlaceOrder}
            disabled={isPlacingOrder}
            style={{ border: "none", cursor: "pointer" }}
          >
            {isPlacingOrder ? "Placing order..." : "Continue"}
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
