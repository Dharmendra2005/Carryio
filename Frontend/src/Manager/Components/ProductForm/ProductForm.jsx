import { useState } from "react";
import Toggle from "../Toggle/Toggle";
import "./ProductForm.css";

const CATEGORIES = ["Tote bags","Backpacks","Wallets","Clutches","Sling bags","Travel bags"];
const BADGES     = ["None","New","Hot","Sale"];
const COLORS     = ["#1a1a1a","#8B6914","#D85A30","#185FA5","#6b2d55","#3B6D11","#c0392b","#7f8c8d"];

export default function ProductForm({ initial = {}, onSave, onDraft }) {
  const [form, setForm] = useState({
    name:        initial.name        ?? "",
    category:    initial.category    ?? "",
    brand:       initial.brand       ?? "Carryio Originals",
    description: initial.description ?? "",
    price:       initial.price       ?? "",
    mrp:         initial.mrp         ?? "",
    stock:       initial.stock       ?? "",
    sku:         initial.sku         ?? "",
    weight:      initial.weight      ?? "",
    badge:       initial.badge       ?? "None",
    sizes:       initial.sizes       ?? "",
    material:    initial.material    ?? "",
    metaTitle:   initial.metaTitle   ?? "",
    metaDesc:    initial.metaDesc    ?? "",
    published:   initial.published   ?? true,
    featured:    initial.featured    ?? false,
    freeShipping:initial.freeShipping?? true,
    cod:         initial.cod         ?? true,
    colors:      initial.colors      ?? ["#1a1a1a"],
  });

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const toggleColor = (hex) => {
    set("colors", form.colors.includes(hex)
      ? form.colors.filter((c) => c !== hex)
      : [...form.colors, hex]
    );
  };

  return (
    <div className="product-form">
      <div className="pf-two-col">

        {/* ── LEFT COLUMN ── */}
        <div className="pf-left">

          {/* Basic info */}
          <div className="section-card">
            <div className="section-card__head">
              <div>
                <div className="section-card__title">Basic information</div>
                <div className="section-card__sub">Name, description, category</div>
              </div>
            </div>
            <div className="section-card__body">
              <div className="pf-grid pf-grid--full">
                <div className="fg">
                  <label className="pf-label">Product name</label>
                  <input className="pf-input" type="text"
                    placeholder="e.g. Classic Leather Tote"
                    value={form.name} onChange={(e) => set("name", e.target.value)} />
                </div>
              </div>
              <div className="pf-grid">
                <div className="fg">
                  <label className="pf-label">Category</label>
                  <select className="pf-input" value={form.category}
                    onChange={(e) => set("category", e.target.value)}>
                    <option value="">Select category</option>
                    {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="fg">
                  <label className="pf-label">Brand / Collection</label>
                  <input className="pf-input" type="text"
                    placeholder="e.g. Carryio Originals"
                    value={form.brand} onChange={(e) => set("brand", e.target.value)} />
                </div>
              </div>
              <div className="fg">
                <label className="pf-label">Description</label>
                <textarea className="pf-input pf-textarea"
                  placeholder="Describe the product — material, use case, unique features…"
                  value={form.description}
                  onChange={(e) => set("description", e.target.value)} />
              </div>
            </div>
          </div>

          {/* Pricing & inventory */}
          <div className="section-card">
            <div className="section-card__head">
              <div className="section-card__title">Pricing & inventory</div>
            </div>
            <div className="section-card__body">
              <div className="pf-grid pf-grid--3">
                <div className="fg">
                  <label className="pf-label">Sale price</label>
                  <div className="pf-prefix">
                    <span className="pf-prefix__sym">₹</span>
                    <input type="number" placeholder="0"
                      value={form.price} onChange={(e) => set("price", e.target.value)} />
                  </div>
                </div>
                <div className="fg">
                  <label className="pf-label">MRP / Original</label>
                  <div className="pf-prefix">
                    <span className="pf-prefix__sym">₹</span>
                    <input type="number" placeholder="0"
                      value={form.mrp} onChange={(e) => set("mrp", e.target.value)} />
                  </div>
                </div>
                <div className="fg">
                  <label className="pf-label">Stock qty</label>
                  <input className="pf-input" type="number" placeholder="0"
                    value={form.stock} onChange={(e) => set("stock", e.target.value)} />
                </div>
                <div className="fg">
                  <label className="pf-label">SKU</label>
                  <input className="pf-input" type="text" placeholder="e.g. TOT-001"
                    value={form.sku} onChange={(e) => set("sku", e.target.value)} />
                </div>
                <div className="fg">
                  <label className="pf-label">Weight (grams)</label>
                  <input className="pf-input" type="number" placeholder="0"
                    value={form.weight} onChange={(e) => set("weight", e.target.value)} />
                </div>
                <div className="fg">
                  <label className="pf-label">Badge</label>
                  <select className="pf-input" value={form.badge}
                    onChange={(e) => set("badge", e.target.value)}>
                    {BADGES.map((b) => <option key={b}>{b}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Colors & variants */}
          <div className="section-card">
            <div className="section-card__head">
              <div className="section-card__title">Colors & variants</div>
            </div>
            <div className="section-card__body">
              <div className="fg" style={{ marginBottom: 14 }}>
                <label className="pf-label">Available colors</label>
                <div className="pf-colors">
                  {COLORS.map((hex) => (
                    <button
                      key={hex}
                      type="button"
                      className={`pf-color-dot ${form.colors.includes(hex) ? "pf-color-dot--selected" : ""}`}
                      style={{ background: hex }}
                      onClick={() => toggleColor(hex)}
                      aria-label={`Color ${hex}`}
                    />
                  ))}
                </div>
              </div>
              <div className="pf-grid">
                <div className="fg">
                  <label className="pf-label">Sizes available</label>
                  <input className="pf-input" type="text" placeholder="e.g. S, M, L or One Size"
                    value={form.sizes} onChange={(e) => set("sizes", e.target.value)} />
                </div>
                <div className="fg">
                  <label className="pf-label">Material</label>
                  <input className="pf-input" type="text" placeholder="e.g. Full-grain leather"
                    value={form.material} onChange={(e) => set("material", e.target.value)} />
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* ── RIGHT COLUMN ── */}
        <div className="pf-right">

          {/* Images */}
          <div className="section-card">
            <div className="section-card__head">
              <div className="section-card__title">Product images</div>
            </div>
            <div className="section-card__body">
              <div className="pf-upload-zone">
                <div className="pf-upload-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    strokeWidth="1.5" strokeLinecap="round" width="32" height="32">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                </div>
                <div className="pf-upload-title">Click to upload or drag & drop</div>
                <div className="pf-upload-sub">PNG, JPG up to 5MB · First image = cover</div>
              </div>
              <div className="pf-img-grid">
                <div className="pf-img-slot pf-img-slot--filled">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#f5c4b3"
                    strokeWidth="1.5" width="24" height="24">
                    <rect x="3" y="3" width="18" height="18" rx="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21 15 16 10 5 21"/>
                  </svg>
                </div>
                <div className="pf-img-slot">
                  <span style={{ color: "#ddd", fontSize: 20 }}>+</span>
                </div>
                <div className="pf-img-slot">
                  <span style={{ color: "#ddd", fontSize: 20 }}>+</span>
                </div>
              </div>
            </div>
          </div>

          {/* Visibility */}
          <div className="section-card">
            <div className="section-card__head">
              <div className="section-card__title">Visibility & status</div>
            </div>
            <div className="section-card__body">
              {[
                { key: "published",    label: "Published",      desc: "Visible to all customers" },
                { key: "featured",     label: "Featured",       desc: "Show in hero / homepage" },
                { key: "freeShipping", label: "Free shipping",  desc: "Override store default" },
                { key: "cod",          label: "Cash on delivery",desc: "Allow COD for this item" },
              ].map(({ key, label, desc }) => (
                <div key={key} className="toggle-row">
                  <div>
                    <div className="toggle-name">{label}</div>
                    <div className="toggle-desc">{desc}</div>
                  </div>
                  <Toggle
                    on={form[key]}
                    onChange={(val) => set(key, val)}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* SEO */}
          <div className="section-card">
            <div className="section-card__head">
              <div className="section-card__title">SEO</div>
            </div>
            <div className="section-card__body">
              <div className="fg" style={{ marginBottom: 12 }}>
                <label className="pf-label">Meta title</label>
                <input className="pf-input" placeholder="Page title for search engines"
                  value={form.metaTitle}
                  onChange={(e) => set("metaTitle", e.target.value)} />
              </div>
              <div className="fg">
                <label className="pf-label">Meta description</label>
                <textarea className="pf-input pf-textarea pf-textarea--short"
                  placeholder="Short description for Google…"
                  value={form.metaDesc}
                  onChange={(e) => set("metaDesc", e.target.value)} />
              </div>
            </div>
          </div>

          {/* Form actions */}
          <div className="pf-actions">
            <button className="btn btn--ghost" type="button" onClick={() => onDraft?.(form)}>
              Save as draft
            </button>
            <button className="btn btn--primary" type="button" onClick={() => onSave?.(form)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="2.5" strokeLinecap="round" width="13" height="13">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              Publish product
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
