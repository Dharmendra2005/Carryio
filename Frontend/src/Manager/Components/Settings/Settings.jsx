import { useState } from "react";
import Toggle from "../Toggle/Toggle";
import "./Settings.css";

export default function Settings({ manager, onSave }) {
  const [store, setStore] = useState({
    name: "Carryio", tagline: "Premium Bags & Accessories",
    email: "support@carryio.com", phone: "", address: "",
  });

  const [payment, setPayment] = useState({
    razorpayKey: "", razorpaySecret: "", cod: true, upi: true,
  });

  const [profile, setProfile] = useState({
    displayName: manager?.name ?? "Dharm",
    email: manager?.email ?? "dharm@carryio.com",
    password: "", confirmPassword: "",
  });

  const [notifs, setNotifs] = useState({
    orders: true, lowStock: true, managerActivity: false,
  });

  const setS = (key, val) => setStore((s) => ({ ...s, [key]: val }));
  const setP = (key, val) => setPayment((s) => ({ ...s, [key]: val }));
  const setPr = (key, val) => setProfile((s) => ({ ...s, [key]: val }));
  const setN = (key, val) => setNotifs((s) => ({ ...s, [key]: val }));

  return (
    <div className="settings-two-col">

      {/* ── Left ── */}
      <div>

        {/* Store info */}
        <div className="section-card">
          <div className="section-card__head">
            <div className="section-card__title">Store information</div>
          </div>
          <div className="section-card__body">
            <div className="st-grid">
              <div className="fg st-full">
                <label className="pf-label">Store name</label>
                <input className="pf-input" value={store.name}
                  onChange={(e) => setS("name", e.target.value)} />
              </div>
              <div className="fg st-full">
                <label className="pf-label">Store tagline</label>
                <input className="pf-input" value={store.tagline}
                  onChange={(e) => setS("tagline", e.target.value)} />
              </div>
              <div className="fg">
                <label className="pf-label">Support email</label>
                <input className="pf-input" type="email" value={store.email}
                  onChange={(e) => setS("email", e.target.value)} />
              </div>
              <div className="fg">
                <label className="pf-label">Support phone</label>
                <input className="pf-input" placeholder="+91 00000 00000" value={store.phone}
                  onChange={(e) => setS("phone", e.target.value)} />
              </div>
              <div className="fg st-full">
                <label className="pf-label">Store address</label>
                <textarea className="pf-input" style={{ minHeight: 60, resize: "vertical" }}
                  placeholder="Full address for invoices" value={store.address}
                  onChange={(e) => setS("address", e.target.value)} />
              </div>
            </div>
          </div>
        </div>

        {/* Payment */}
        <div className="section-card">
          <div className="section-card__head">
            <div className="section-card__title">Payment settings</div>
          </div>
          <div className="section-card__body">
            <div className="st-grid" style={{ marginBottom: 14 }}>
              <div className="fg">
                <label className="pf-label">Razorpay Key ID</label>
                <input className="pf-input" placeholder="rzp_live_…"
                  value={payment.razorpayKey}
                  onChange={(e) => setP("razorpayKey", e.target.value)} />
              </div>
              <div className="fg">
                <label className="pf-label">Razorpay Secret</label>
                <input className="pf-input" type="password" placeholder="••••••••••••"
                  value={payment.razorpaySecret}
                  onChange={(e) => setP("razorpaySecret", e.target.value)} />
              </div>
            </div>
            <div className="toggle-row">
              <div>
                <div className="toggle-name">Cash on delivery</div>
                <div className="toggle-desc">Allow COD storewide</div>
              </div>
              <Toggle on={payment.cod} onChange={(v) => setP("cod", v)} />
            </div>
            <div className="toggle-row">
              <div>
                <div className="toggle-name">UPI payments</div>
                <div className="toggle-desc">Enable UPI checkout</div>
              </div>
              <Toggle on={payment.upi} onChange={(v) => setP("upi", v)} />
            </div>
          </div>
        </div>

      </div>

      {/* ── Right ── */}
      <div>

        {/* Profile */}
        <div className="section-card">
          <div className="section-card__head">
            <div className="section-card__title">Your profile</div>
          </div>
          <div className="section-card__body">
            <div className="st-profile-header">
              <div className="st-avatar">{manager?.name?.[0] ?? "D"}</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{manager?.name}</div>
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
                  {manager?.role} · Since 2026
                </div>
              </div>
            </div>
            {[
              { key: "displayName", label: "Display name",    type: "text" },
              { key: "email",       label: "Email",           type: "email" },
              { key: "password",    label: "New password",    type: "password", placeholder: "Leave blank to keep current" },
              { key: "confirmPassword", label: "Confirm password", type: "password", placeholder: "Repeat new password" },
            ].map(({ key, label, type, placeholder }) => (
              <div key={key} className="fg" style={{ marginBottom: 12 }}>
                <label className="pf-label">{label}</label>
                <input className="pf-input" type={type}
                  placeholder={placeholder}
                  value={profile[key]}
                  onChange={(e) => setPr(key, e.target.value)} />
              </div>
            ))}
          </div>
        </div>

        {/* Notifications */}
        <div className="section-card">
          <div className="section-card__head">
            <div className="section-card__title">Notifications</div>
          </div>
          <div className="section-card__body">
            {[
              { key: "orders",          label: "New order alerts",    desc: "Email on every order" },
              { key: "lowStock",        label: "Low stock alerts",    desc: "When stock drops below 5" },
              { key: "managerActivity", label: "Manager activity",    desc: "When team makes changes" },
            ].map(({ key, label, desc }) => (
              <div key={key} className="toggle-row">
                <div>
                  <div className="toggle-name">{label}</div>
                  <div className="toggle-desc">{desc}</div>
                </div>
                <Toggle on={notifs[key]} onChange={(v) => setN(key, v)} />
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button className="btn btn--primary" onClick={() => onSave?.({ store, payment, profile, notifs })}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2.5" strokeLinecap="round" width="13" height="13">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            Save all changes
          </button>
        </div>

      </div>
    </div>
  );
}
