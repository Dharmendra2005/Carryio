import { useState } from "react";
import Toggle from "../Toggle/Toggle";
import "./ManagerPanel.css";

const ROLES = [
  "Manager — can add & edit products",
  "Super Admin — full access",
  "Viewer — read only",
];

const PERMISSIONS = [
  { key: "addProducts",    label: "Add products",    desc: "Managers & admins",   default: true  },
  { key: "deleteProducts", label: "Delete products", desc: "Super admins only",   default: false },
  { key: "manageOrders",   label: "Manage orders",   desc: "Managers & admins",   default: true  },
  { key: "inviteManagers", label: "Invite managers", desc: "Super admins only",   default: false },
];

export default function ManagerPanel({ managers = [], onInvite, onRemove, onEditRole }) {
  const [form, setForm] = useState({ name: "", email: "", role: ROLES[0] });
  const [perms, setPerms] = useState(
    Object.fromEntries(PERMISSIONS.map((p) => [p.key, p.default]))
  );

  const handleInvite = () => {
    if (!form.name || !form.email) return;
    onInvite?.({ ...form });
    setForm({ name: "", email: "", role: ROLES[0] });
  };

  return (
    <div className="mgr-two-col">

      {/* ── Left — manager table ── */}
      <div>
        <div className="section-card">
          <div className="section-card__head">
            <div>
              <div className="section-card__title">Active managers</div>
              <div className="section-card__sub">{managers.length} members</div>
            </div>
          </div>
          <div className="section-card__body--flush">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Manager</th>
                  <th>Role</th>
                  <th>Added</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {managers.map((m) => (
                  <tr key={m.id}>
                    <td>
                      <div className="td-product">
                        <div className="mgr-avatar" style={{ background: m.avatarBg, color: m.avatarColor, borderColor: m.avatarBorder }}>
                          {m.name[0]}
                        </div>
                        <div>
                          <div className="td-name">{m.name}</div>
                          <div className="td-meta">{m.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`pill ${m.isAdmin ? "pill--admin" : "pill--new"}`}>
                        {m.isAdmin ? "Super Admin" : "Manager"}
                      </span>
                    </td>
                    <td>{m.since}</td>
                    <td>
                      <span className={`pill ${m.status === "active" ? "pill--active" : m.status === "invited" ? "pill--invited" : "pill--draft"}`}>
                        {m.status === "active" ? "Active" : m.status === "invited" ? "Invited" : m.status}
                      </span>
                    </td>
                    <td>
                      {m.isSelf ? (
                        <span style={{ fontSize: 11, color: "var(--text-muted)" }}>You</span>
                      ) : (
                        <div className="td-actions">
                          {m.status === "invited" ? (
                            <>
                              <button className="act-btn" onClick={() => onInvite?.({ resend: true, ...m })}>Resend</button>
                              <button className="act-btn act-btn--danger" onClick={() => onRemove?.(m)}>Revoke</button>
                            </>
                          ) : (
                            <>
                              <button className="act-btn" onClick={() => onEditRole?.(m)}>Edit role</button>
                              <button className="act-btn act-btn--danger" onClick={() => onRemove?.(m)}>Remove</button>
                            </>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── Right — invite + permissions ── */}
      <div>
        <div className="section-card">
          <div className="section-card__head">
            <div className="section-card__title">Invite new manager</div>
          </div>
          <div className="section-card__body">
            <div className="fg" style={{ marginBottom: 12 }}>
              <label className="pf-label">Full name</label>
              <input className="pf-input" placeholder="Manager's full name"
                value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="fg" style={{ marginBottom: 12 }}>
              <label className="pf-label">Email address</label>
              <input className="pf-input" type="email" placeholder="manager@carryio.com"
                value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
            </div>
            <div className="fg" style={{ marginBottom: 16 }}>
              <label className="pf-label">Role</label>
              <select className="pf-input" value={form.role}
                onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}>
                {ROLES.map((r) => <option key={r}>{r}</option>)}
              </select>
            </div>
            <button className="btn btn--primary btn--full" onClick={handleInvite}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                strokeLinecap="round" width="13" height="13">
                <line x1="22" y1="2" x2="11" y2="13"/>
                <polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
              Send invite
            </button>
          </div>
        </div>

        <div className="section-card">
          <div className="section-card__head">
            <div className="section-card__title">Role permissions</div>
          </div>
          <div className="section-card__body">
            {PERMISSIONS.map((p) => (
              <div key={p.key} className="toggle-row">
                <div>
                  <div className="toggle-name">{p.label}</div>
                  <div className="toggle-desc">{p.desc}</div>
                </div>
                <Toggle
                  on={perms[p.key]}
                  onChange={(val) => setPerms((prev) => ({ ...prev, [p.key]: val }))}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
