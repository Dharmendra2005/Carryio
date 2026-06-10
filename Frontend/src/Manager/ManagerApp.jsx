import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Components/Sidebar/Sidebar";
import Topbar from "./Components/Topbar/Topbar";
import Dashboard from "./Components/Dashboard/Dashboard";
import ProductForm from "./Components/ProductForm/ProductForm";
import ProductTable from "./Components/ProductTable/ProductTable";
import ManagerPanel from "./Components/ManagerPanel/ManagerPanel";
import Settings from "./Components/Settings/Settings";
import Orders from "./Components/Orders/Orders";
import {
  createProduct,
  deleteProduct,
  fetchManagerProducts,
  updateProduct,
} from "../api/products";
import { fetchManagerOrders, updateOrderStatus } from "../api/orders";
import {
  fetchAllManagers,
  fetchDashboardStats,
  fetchManagerProfile,
  inviteManager,
} from "../api/managers";
import { buildProductPayload } from "../utils/productMappers";
import "./ManagerApp.css";

const DEFAULT_MANAGER = {
  name: "Manager",
  role: "Manager",
  email: "",
};

export default function ManagerApp() {
  const navigate = useNavigate();
  const [manager, setManager] = useState(DEFAULT_MANAGER);
  const [page, setPage] = useState("dashboard");
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [managers, setManagers] = useState([]);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [activity, setActivity] = useState([]);
  const [editTarget, setEditTarget] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadDashboardData = useCallback(async () => {
    const [productsResult, ordersResult, managersResult, statsResult] =
      await Promise.allSettled([
        fetchManagerProducts(),
        fetchManagerOrders(),
        fetchAllManagers(),
        fetchDashboardStats(),
      ]);

    if (productsResult.status === "fulfilled") {
      setProducts(productsResult.value);
    } else {
      console.error("Failed to load products:", productsResult.reason);
    }

    if (ordersResult.status === "fulfilled") {
      setOrders(ordersResult.value);
    } else {
      console.error("Failed to load orders:", ordersResult.reason);
      setOrders([]);
    }

    if (managersResult.status === "fulfilled") {
      setManagers(managersResult.value);
    } else {
      console.error("Failed to load managers:", managersResult.reason);
      setManagers([]);
    }

    if (statsResult.status === "fulfilled") {
      setDashboardStats(statsResult.value.stats);
      setActivity(statsResult.value.activity || []);
    } else {
      console.error("Failed to load dashboard stats:", statsResult.reason);
      setDashboardStats(null);
      setActivity([]);
    }
  }, []);

  const loadManagerSession = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const profile = await fetchManagerProfile();
      setManager({
        name: profile.Username || profile.email,
        role: "Manager",
        email: profile.email,
      });

      localStorage.setItem(
        "carryio_manager",
        JSON.stringify({
          name: profile.Username || profile.email,
          email: profile.email,
        }),
      );

      await loadDashboardData();
    } catch (err) {
      console.error(err);
      setError("Please log in as a manager to continue.");
      navigate("/manager/login", { replace: true });
    } finally {
      setLoading(false);
    }
  }, [loadDashboardData, navigate]);

  useEffect(() => {
    loadManagerSession();
  }, [loadManagerSession]);

  const navigatePage = (nextPage) => setPage(nextPage);

  const newOrderCount = orders.filter((order) => order.status === "New").length;

  const PAGE_META = {
    dashboard: { title: "Dashboard", subtitle: `Welcome back, ${manager.name} 👋` },
    products: { title: "All Products", subtitle: `${products.length} products total` },
    "add-product": {
      title: editTarget ? "Edit Product" : "Add Product",
      subtitle: "Fill in all details to list a product",
    },
    orders: {
      title: "Orders",
      subtitle: `${newOrderCount} orders need attention`,
    },
    managers: { title: "Manage Team", subtitle: "Add, update or remove manager access" },
    settings: { title: "Store Settings", subtitle: "Update your store and account details" },
  };

  const handleSaveProduct = async (form, statusOverride) => {
    setSaving(true);
    setError("");

    try {
      const payload = buildProductPayload(form, statusOverride);

      if (editTarget?.id) {
        await updateProduct(editTarget.id, payload);
      } else {
        await createProduct(payload);
      }

      setEditTarget(null);
      await loadDashboardData();
      navigatePage("products");
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to save product");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (product) => {
    setEditTarget(product);
    navigatePage("add-product");
  };

  const handleDelete = async (product) => {
    if (!window.confirm(`Delete "${product.name}"?`)) return;

    try {
      await deleteProduct(product.id);
      await loadDashboardData();
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to delete product");
    }
  };

  const handleProcessOrder = async (order) => {
    try {
      const updated = await updateOrderStatus(order.id, "Shipped");
      setOrders((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      );
      await loadDashboardData();
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to update order");
    }
  };

  const handleInviteManager = async (inviteData) => {
    try {
      const tempPassword = `Carryio@${Date.now().toString().slice(-6)}`;
      await inviteManager({
        name: inviteData.name,
        email: inviteData.email,
        password: tempPassword,
      });
      alert(`Manager invited. Temporary password: ${tempPassword}`);
      await loadDashboardData();
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to invite manager");
    }
  };

  const meta = PAGE_META[page] ?? { title: page, subtitle: "" };
  const showSearch = ["dashboard", "products", "orders"].includes(page);
  const showNewProduct = page === "dashboard" || page === "products";

  if (loading) {
    return (
      <div className="dashboard dashboard--loading">
        <div className="dashboard__loading">Loading manager dashboard…</div>
      </div>
    );
  }

  if (error) {
    return null;
  }

  return (
    <div className="dashboard">
      <Sidebar
        active={page}
        onNavigate={navigatePage}
        manager={manager}
        productCount={products.length}
        orderCount={newOrderCount}
      />

      <div className="dashboard__main">
        <Topbar
          title={meta.title}
          subtitle={meta.subtitle}
          onSearch={showSearch ? () => {} : undefined}
          onNewProduct={showNewProduct ? () => navigatePage("add-product") : undefined}
          actions={
            page === "add-product" ? (
              <>
                <button
                  className="btn btn--ghost"
                  onClick={() => {
                    setEditTarget(null);
                    navigatePage("products");
                  }}
                >
                  ← Back
                </button>
                <button
                  className="btn btn--primary"
                  disabled={saving}
                  onClick={() =>
                    document.querySelector(".pf-actions .btn--primary")?.click()
                  }
                >
                  {saving ? "Saving…" : "Publish product"}
                </button>
              </>
            ) : page === "settings" ? (
              <button className="btn btn--primary">Save changes</button>
            ) : page === "managers" ? null : null
          }
        />

        <div className="page-content">
          {page === "dashboard" && (
            <Dashboard
              products={products}
              stats={dashboardStats}
              activity={activity}
              manager={manager}
              onNavigate={navigatePage}
              onEdit={handleEdit}
            />
          )}
          {page === "add-product" && (
            <ProductForm
              key={editTarget?.id || "new-product"}
              initial={editTarget ?? {}}
              saving={saving}
              onSave={(form) => handleSaveProduct(form, "Active")}
              onDraft={(form) => handleSaveProduct(form, "Draft")}
            />
          )}
          {page === "products" && (
            <ProductTable
              products={products}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}
          {page === "orders" && (
            <Orders orders={orders} onProcess={handleProcessOrder} />
          )}
          {page === "managers" && (
            <ManagerPanel
              managers={managers}
              onInvite={handleInviteManager}
              onRemove={() => alert("Remove manager is not enabled yet.")}
            />
          )}
          {page === "settings" && <Settings manager={manager} />}
        </div>
      </div>
    </div>
  );
}
