import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "../Components/Checkout/Checkout.css";

const DEFAULT_ADDRESS = {
  fullName: "Aarav Mehta",
  mobile: "9876543210",
  addressLine: "24, Green Park Road",
  city: "New Delhi",
  state: "Delhi",
  pincode: "110016",
  landmark: "Near Metro Gate 2",
};

const EMPTY_ADDRESS = {
  fullName: "",
  mobile: "",
  addressLine: "",
  city: "",
  state: "",
  pincode: "",
  landmark: "",
};

export default function CheckoutAddress() {
  const [address, setAddress] = useState(EMPTY_ADDRESS);
  const [defaultCreated, setDefaultCreated] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Support both cart checkout data and single-product data
  const checkoutData = location.state?.items
    ? location.state
    : {
        items: [
          {
            name: location.state?.product?.title || "Selected product",
            price: Number(String(location.state?.product?.price || "1999").replace(/[^0-9]/g, "")),
            quantity: 1,
            category: location.state?.product?.category || "",
          },
        ],
        total: Number(String(location.state?.product?.price || "1999").replace(/[^0-9]/g, "")),
        title: location.state?.product?.title || "Selected product",
      };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setAddress((current) => ({ ...current, [name]: value }));
  };

  const createDefaultAddress = () => {
    setAddress({ ...DEFAULT_ADDRESS, isDefault: true });
    setDefaultCreated(true);
  };

  const handleNext = async (event) => {
    event.preventDefault();
    setIsSaving(true);

    try {
      const response = await fetch("http://localhost:3000/addresses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          ...address,
          isDefault: Boolean(address.isDefault || defaultCreated),
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Address save failed");
        return;
      }

      navigate("/checkout/payment", {
        state: { checkoutData, address: data.address },
      });
    } catch (err) {
      alert("Unable to save address. Please check backend server.");
      console.error("Error saving address:", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="main checkout-page">
      <div className="section-top">
        <span className="section-title">Delivery address</span>
        <Link to="/" className="section-view-all">
          Back to home
        </Link>
      </div>

      <div className="checkout-shell">
        <form className="checkout-form" onSubmit={handleNext}>
          <div>
            <h1>Enter address</h1>
            <p>
              Add the delivery details for this order. Mobile number is required
              so the courier can contact you during delivery.
            </p>
          </div>

          <div className="checkout-fields">
            <label>
              Full name
              <input
                name="fullName"
                value={address.fullName}
                onChange={handleChange}
                placeholder="Enter full name"
                required
              />
            </label>
            <label>
              Mobile number
              <input
                name="mobile"
                value={address.mobile}
                onChange={handleChange}
                placeholder="10-digit mobile number"
                inputMode="numeric"
                pattern="[0-9]{10}"
                required
              />
            </label>
            <label className="checkout-field-wide">
              Address
              <textarea
                name="addressLine"
                value={address.addressLine}
                onChange={handleChange}
                placeholder="House number, street, area"
                rows="3"
                required
              />
            </label>
            <label>
              City
              <input
                name="city"
                value={address.city}
                onChange={handleChange}
                placeholder="City"
                required
              />
            </label>
            <label>
              State
              <input
                name="state"
                value={address.state}
                onChange={handleChange}
                placeholder="State"
                required
              />
            </label>
            <label>
              Pincode
              <input
                name="pincode"
                value={address.pincode}
                onChange={handleChange}
                placeholder="6-digit pincode"
                inputMode="numeric"
                pattern="[0-9]{6}"
                required
              />
            </label>
            <label>
              Landmark
              <input
                name="landmark"
                value={address.landmark}
                onChange={handleChange}
                placeholder="Nearby landmark"
              />
            </label>
          </div>

          {defaultCreated ? (
            <div className="checkout-note">Default address created.</div>
          ) : null}

          <div className="checkout-actions">
            <button
              type="button"
              className="btn-ghost"
              onClick={createDefaultAddress}
            >
              Create default address
            </button>
            <button type="submit" className="btn-primary" disabled={isSaving}>
              {isSaving ? "Saving..." : "Next to payment"}
            </button>
          </div>
        </form>

        <aside className="checkout-summary">
          <span>Order item</span>
          <strong>{checkoutData.title}</strong>
          <div>
            <span>Total</span>
            <strong>Rs. {checkoutData.total.toLocaleString("en-IN")}</strong>
          </div>
          <p>Free shipping applies on this order.</p>
        </aside>
      </div>
    </div>
  );
}
