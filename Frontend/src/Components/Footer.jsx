export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="footer-brand">
          <div className="footer-brand-logo">
            Ca<span>rr</span>yio
          </div>
          <p>
            Handcrafted bags and accessories built for everyday life.
            Quality you can feel, style you can see.
          </p>
          <div className="social-row">
            <div className="social-btn">
              <i className="ti ti-brand-instagram" aria-label="Instagram" />
            </div>
            <div className="social-btn">
              <i className="ti ti-brand-twitter" aria-label="Twitter" />
            </div>
            <div className="social-btn">
              <i className="ti ti-brand-facebook" aria-label="Facebook" />
            </div>
            <div className="social-btn">
              <i className="ti ti-brand-youtube" aria-label="YouTube" />
            </div>
          </div>
        </div>

        <div className="footer-col">
          <h4>Shop</h4>
          <ul>
            <li><a>Tote bags</a></li>
            <li><a>Backpacks</a></li>
            <li><a>Wallets</a></li>
            <li><a>Clutches</a></li>
            <li><a>Sling bags</a></li>
            <li><a>Travel bags</a></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Company</h4>
          <ul>
            <li><a>About us</a></li>
            <li><a>Careers</a></li>
            <li><a>Press</a></li>
            <li><a>Blog</a></li>
            <li><a>Contact</a></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Stay updated</h4>
          <div className="newsletter">
            <h4>Get 10% off your first order</h4>
            <p>Subscribe for new arrivals, deals, and style tips.</p>
            <div className="newsletter-row">
              <input type="email" placeholder="your@email.com" />
              <button type="button">Subscribe</button>
            </div>
          </div>
          <ul>
            <li><a>Help center</a></li>
            <li><a>Track order</a></li>
            <li><a>Shipping info</a></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <span className="footer-copy">
          © 2026 Carryio. All rights reserved.
        </span>
        <div className="footer-pay">
          <span className="footer-pay-label">We accept</span>
          <span className="pay-badge">UPI</span>
          <span className="pay-badge">Razorpay</span>
          <span className="pay-badge">Visa</span>
          <span className="pay-badge">Mastercard</span>
          <span className="pay-badge">COD</span>
        </div>
        <div className="footer-links">
          <a>Privacy policy</a>
          <a>Terms of use</a>
          <a>Sitemap</a>
        </div>
      </div>
    </footer>
  );
}
