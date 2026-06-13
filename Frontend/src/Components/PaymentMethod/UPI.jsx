import "./UPI.css";

export default function UPIPayment({ product, address, amountPayable }) {

  const quantity = product?.quantity || 1;
  // const basePrice = product?.price || amountPayable;

  return (
    <div className="upi-page">

      <div className="upi-left">

        <h1>Pay via UPI</h1>

        <div className="amount-box">
          <div>
            <span>AMOUNT TO PAY</span>
            <h2>₹{amountPayable.toLocaleString()}</h2>
          </div>
          <div>
            <strong>{product?.title}</strong>
          </div>
        </div>

        <h4>Select UPI App</h4>

        <div className="upi-apps">
          <button>GPay</button>
          <button>PhonePe</button>
          <button>Paytm</button>
          <button>BHIM</button>
        </div>

        <div className="upi-input">
          <input placeholder="Enter UPI ID" />
        </div>

        <div className="qr-box">
          <img
            src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=payment"
            alt=""
          />
        </div>

        <button className="pay-btn">
          Pay ₹{amountPayable.toLocaleString()}
        </button>

      </div>

      <div className="upi-right">

        <div className="card">
          <h4>Deliver to</h4>
          <strong>{address?.fullName}</strong>
          <p>
            {address?.addressLine}
            <br />
            {address?.city}, {address?.state}
          </p>
          <p>{address?.mobile}</p>
        </div>

        <div className="card">
          <h4>Payment</h4>
          <strong>UPI - Instant</strong>
          <p>No extra charges</p>
        </div>

        {/* ── Order Summary ── */}
        <div className="card order-summary">

          <h4>Order Summary</h4>

          <div className="order-product">

            {product?.image && (
              <img
                src={product.image}
                alt={product.title}
                className="order-product-img"
              />
            )}

            <div className="order-product-info">
              <strong>{product?.title}</strong>
              {product?.brand && <span className="order-brand">{product.brand}</span>}
              {product?.size && <span className="order-meta">Size: {product.size}</span>}
              {product?.color && <span className="order-meta">Color: {product.color}</span>}
              <span className="order-meta">Qty: {quantity}</span>
            </div>

          </div>

          <div className="order-price-breakdown">

            <div className="order-row">
              <span>Item price</span>
              <span>{product?.price}</span>
            </div>

            {quantity > 1 && (
              <div className="order-row">
                <span>Quantity</span>
                <span>× {quantity}</span>
              </div>
            )}

            {product?.discount && (
              <div className="order-row discount">
                <span>Discount</span>
                <span>− ₹{product.discount.toLocaleString()}</span>
              </div>
            )}

            <div className="order-row">
              <span>Platform fee</span>
              <span>₹35</span>
            </div>

            <div className="order-row order-row-total">
              <strong>Total payable</strong>
              <strong>₹{amountPayable.toLocaleString()}</strong>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}