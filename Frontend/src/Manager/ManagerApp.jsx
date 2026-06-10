import { useState } from "react";
import Sidebar       from "./components/Sidebar/Sidebar";
import Topbar        from "./components/Topbar/Topbar";
import Dashboard     from "./components/Dashboard/Dashboard";
import ProductForm   from "./components/ProductForm/ProductForm";
import ProductTable  from "./components/ProductTable/ProductTable";
import ManagerPanel  from "./components/ManagerPanel/ManagerPanel";
import Settings      from "./components/Settings/Settings";
import Orders        from "./Components/Orders/Orders";
// import "./dashboard.css";

// ─── Mock data (replace with API calls) ──────────────────────────────────────
const MANAGER = { name: "Dharm", role: "Super Admin", email: "dharm@carryio.com" };

const PRODUCTS = [
  { id:1, name:"Classic Leather Tote", category:"Tote bags",  price:2499, mrp:3200, stock:18, sku:"TOT-001", badge:"Hot",  status:"Active", thumbBg:"#FAECE7", icon:"👜" },
  { id:2, name:"Canvas Backpack",      category:"Backpacks",  price:1899, mrp:2400, stock:32, sku:"BAK-002", badge:"New",  status:"Active", thumbBg:"#E1F5EE", icon:"🎒" },
  { id:3, name:"Slim Bifold Wallet",   category:"Wallets",    price:699,  mrp:null, stock:45, sku:"WAL-003", badge:null,   status:"Active", thumbBg:"#EEF2F8", icon:"👛" },
  { id:4, name:"Velvet Clutch Bag",    category:"Clutches",   price:1199, mrp:1500, stock:12, sku:"CLT-004", badge:"New",  status:"Draft",  thumbBg:"#FBEAF0", icon:"👝" },
  { id:5, name:"Urban Sling Bag",      category:"Sling bags", price:1499, mrp:null, stock:9,  sku:"SLG-005", badge:"Hot",  status:"Active", thumbBg:"#FAEEDA", icon:"👜" },
  { id:6, name:"Weekend Travel Bag",   category:"Travel bags",price:3299, mrp:4000, stock:6,  sku:"TRV-006", badge:null,   status:"Active", thumbBg:"#EAF3DE", icon:"🧳" },
];

const MANAGERS_LIST = [
  { id:1, name:"Dharm",    email:"dharm@carryio.com",  isAdmin:true,  status:"active",  since:"Since 2026", isSelf:true,  avatarBg:"#fdf3ef", avatarColor:"#D85A30", avatarBorder:"#f5c4b3" },
  { id:2, name:"Priya S.", email:"priya@carryio.com",  isAdmin:false, status:"active",  since:"Jun 2026",   isSelf:false, avatarBg:"#e1f5ee", avatarColor:"#0F6E56", avatarBorder:"#a3dac3" },
  { id:3, name:"Rahul K.", email:"rahul@carryio.com",  isAdmin:false, status:"invited", since:"May 2026",   isSelf:false, avatarBg:"#eeedfe", avatarColor:"#534AB7", avatarBorder:"#c5c3f5" },
];

const ORDERS = [
  { id:1048, customer:"Arjun M.",  items:"Classic Leather Tote × 1", total:2499, date:"Today",    status:"New"       },
  { id:1047, customer:"Sneha R.",  items:"Canvas Backpack × 2",       total:3798, date:"Today",    status:"New"       },
  { id:1046, customer:"Vikram P.", items:"Slim Bifold Wallet × 1",    total:699,  date:"Yesterday",status:"Shipped"   },
  { id:1045, customer:"Meera T.",  items:"Urban Sling Bag × 1",       total:1499, date:"Jun 07",   status:"Shipped"   },
  { id:1044, customer:"Rohan S.",  items:"Weekend Travel Bag × 1",    total:3299, date:"Jun 06",   status:"Delivered" },
];

// ─── Page config ──────────────────────────────────────────────────────────────
const PAGE_META = {
  dashboard:   { title: "Dashboard",    subtitle: "Welcome back, Dharm 👋" },
  products:    { title: "All Products", subtitle: "24 products total"       },
  "add-product":{ title: "Add Product", subtitle: "Fill in all details to list a product" },
  orders:      { title: "Orders",       subtitle: "7 orders need attention"  },
  managers:    { title: "Manage Team",  subtitle: "Add, update or remove manager access" },
  settings:    { title: "Store Settings", subtitle: "Update your store and account details" },
};

export default function ManagerApp() {
  const [page, setPage]         = useState("dashboard");
  const [products, setProducts] = useState(PRODUCTS);
  const [managers, setManagers] = useState(MANAGERS_LIST);
  const [editTarget, setEditTarget] = useState(null);

  const navigate = (p) => setPage(p);

  const handleSaveProduct = (form) => {
    if (editTarget) {
      setProducts((prev) => prev.map((p) => p.id === editTarget.id ? { ...p, ...form } : p));
    } else {
      setProducts((prev) => [...prev, { ...form, id: Date.now(), status: "Active" }]);
    }
    setEditTarget(null);
    navigate("products");
  };

  const handleEdit = (product) => {
    setEditTarget(product);
    navigate("add-product");
  };

  const handleDelete = (product) => {
    if (window.confirm(`Delete "${product.name}"?`)) {
      setProducts((prev) => prev.filter((p) => p.id !== product.id));
    }
  };

  const meta = PAGE_META[page] ?? { title: page, subtitle: "" };

  return (
    <div className="dashboard">
      <Sidebar active={page} onNavigate={navigate} manager={MANAGER} />

      <div className="dashboard__main">
        <Topbar
          title={meta.title}
          subtitle={meta.subtitle}
          onSearch={["dashboard","products","orders"].includes(page) ? () => {} : undefined}
          onNewProduct={page === "dashboard" ? () => navigate("add-product") : undefined}
          actions={
            page === "add-product" ? (
              <>
                <button className="btn btn--ghost" onClick={() => navigate("products")}>
                  ← Back
                </button>
                <button className="btn btn--primary" onClick={() => handleSaveProduct({})}>
                  Publish product
                </button>
              </>
            ) : page === "settings" ? (
              <button className="btn btn--primary">Save changes</button>
            ) : page === "managers" ? (
              <button className="btn btn--primary" onClick={() => {}}>
                + Invite manager
              </button>
            ) : null
          }
        />

        <div className="page-content">
          {page === "dashboard"    && <Dashboard onNavigate={navigate} />}
          {page === "add-product"  && (
            <ProductForm
              initial={editTarget ?? {}}
              onSave={handleSaveProduct}
              onDraft={(form) => handleSaveProduct({ ...form, status: "Draft" })}
            />
          )}
          {page === "products"     && (
            <ProductTable
              products={products}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}
          {page === "orders"       && <Orders orders={ORDERS} />}
          {page === "managers"     && (
            <ManagerPanel
              managers={managers}
              onInvite={(m) => setManagers((prev) => [...prev, { ...m, id: Date.now(), status: "invited", isSelf: false }])}
              onRemove={(m) => setManagers((prev) => prev.filter((p) => p.id !== m.id))}
            />
          )}
          {page === "settings"     && <Settings manager={MANAGER} />}
        </div>
      </div>
    </div>
  );
}
