import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Link } from "react-router-dom";
import Register from "./Register";
import "./Login.css";

function UserLogin({ initialTab = "login", onAuthSuccess }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(
    initialTab === "register" ? "register" : "login",
  );
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const returnTo = location.state?.returnTo || "/";
  const nextState = location.state?.product
    ? { product: location.state.product }
    : undefined;

  const handleLoginSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") || "").trim();
    const password = String(formData.get("password") || "").trim();

    const response = await fetch("http://localhost:3000/users/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        email,
        password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.message || "Login failed");
      return;
    }

    onAuthSuccess?.({
      name: `${data.user.firstName} ${data.user.lastName}`,
      email: data.user.email,
      rememberMe,
    });

    navigate(returnTo, {
      replace: true,
      state: nextState,
    });
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <div className="auth-brand-mark">C</div>
          <div className="auth-brand-name">Carryio</div>
          <div className="auth-brand-sub">Handcrafted Everyday Essentials</div>
        </div>

        <div className="auth-divider" />

        <div className="auth-tabs" role="tablist" aria-label="Authentication">
          <button
            type="button"
            className={`auth-tab ${activeTab === "login" ? "active" : ""}`}
            onClick={() => setActiveTab("login")}
          >
            Log in
          </button>
          <button
            type="button"
            className={`auth-tab ${activeTab === "register" ? "active" : ""}`}
            onClick={() => setActiveTab("register")}
          >
            Create account
          </button>
        </div>

        {activeTab === "login" ? (
          <div className="auth-panel">
            <h1 className="auth-title">Welcome back</h1>
            <p className="auth-subtitle">
              New here?{" "}
              <button
                type="button"
                className="auth-link-btn"
                onClick={() => setActiveTab("register")}
              >
                Create a free account
              </button>
            </p>

            <form onSubmit={handleLoginSubmit}>
              <div className="auth-field">
                <label>Email address</label>
                <div className="auth-input-wrap">
                  <input
                    name="email"
                    type="email"
                    placeholder="you@email.com"
                    required
                  />
                  <i className="ti ti-mail" aria-hidden="true" />
                </div>
              </div>

              <div className="auth-field">
                <label>Password</label>
                <div className="auth-input-wrap">
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    required
                  />
                  <i
                    className={`ti ${showPassword ? "ti-eye-off" : "ti-eye"}`}
                    aria-hidden="true"
                    onClick={() => setShowPassword((prev) => !prev)}
                  />
                </div>
              </div>

              <div className="auth-options">
                <label className="auth-check">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(event) => setRememberMe(event.target.checked)}
                  />
                  Remember me
                </label>
                <button type="button" className="auth-link-btn">
                  Forgot password?
                </button>
              </div>

              <button type="submit" className="auth-main-btn">
                Log in to Carryio
              </button>
            </form>

            <div className="auth-separator">
              <span />
              <small>OR</small>
              <span />
            </div>

            <button type="button" className="auth-google-btn">
              Continue with Google
            </button>

            <div className="auth-footnote">
              By logging in, you agree to our Terms and Privacy Policy.
              <Link to="/" className="auth-home-link">
                Back to home
              </Link>
              <Link to="/admin/login" className="auth-admin-link">
                Login as admin
              </Link>
            </div>
          </div>
        ) : (
          <Register
            onSwitchToLogin={() => setActiveTab("login")}
            onAuthSuccess={onAuthSuccess}
          />
        )}
      </div>
    </div>
  );
}

export default UserLogin;
