import "./COD.css";
import { Link } from "react-router-dom";

export default function CODConfirmation({
  product,
  address,
  amountPayable,
}) {

  return (
    <div className="cod-page">

      <div className="cod-left">

        <h1>Order confirmed</h1>

        <p>
          Your order is placed. Pay cash when it arrives at your door.
        </p>

        <div className="order-card">

          <div className="order-header">
            <span>COD - Pending</span>
          </div>

          <div className="product-info">
            <p>{product?.title}</p>
            <p>Cash on delivery</p>
          </div>
        </div>

        <div className="cash-box">
          <h3>Keep ₹{amountPayable.toLocaleString()} ready in cash</h3>

          <p>
            Delivery partner may not carry change.
          </p>
        </div>

        <div className="timeline">

          <div className="step active">
            <span>1</span>
            <div>
              <strong>Order confirmed</strong>
              <p>Preparing your order</p>
            </div>
          </div>

          <div className="step">
            <span>2</span>
            <div>
              <strong>Out for delivery</strong>
            </div>
          </div>

          <div className="step">
            <span>3</span>
            <div>
              <strong>Pay & receive</strong>
            </div>
          </div>

        </div>

      </div>

      <div className="cod-right">

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
          <h4>Amount payable</h4>
          <h2>₹{amountPayable.toLocaleString()}</h2>
        </div>
         <div className="section">
        <Link to="/" className="section-view">
          Back to home
        </Link>
      </div>

      </div>

    </div>
  );
}