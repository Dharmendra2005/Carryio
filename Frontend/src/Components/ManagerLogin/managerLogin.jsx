import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../Auth/Login.css";
import "./managerLogin.css";

export default function ManagerLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("http://localhost:3000/manager/login", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Manager login failed");
        return;
      }

      if (data.manager) {
        localStorage.setItem(
          "carryio_manager",
          JSON.stringify({
            name: data.manager.Username || data.manager.email,
            email: data.manager.email,
          }),
        );
      }

      navigate("/manager", { replace: true });
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page manager-login-page">
      <div className="auth-card">
        <div className="auth-brand">
          <div className="auth-brand-mark">C</div>
          <div className="auth-brand-name">Carryio</div>
          <div className="auth-brand-sub">Manager Panel</div>
        </div>

        <div className="auth-divider" />

        <div className="auth-panel">
          <h1 className="auth-title">Manager sign in</h1>
          <p className="auth-subtitle">
            Access the store dashboard to manage products, orders, and your
            team.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="auth-field">
              <label>Manager email</label>
              <div className="auth-input-wrap">
                <input
                  type="email"
                  name="email"
                  placeholder="manager@carryio.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
                <i className="ti ti-mail" aria-hidden="true" />
              </div>
            </div>

            <div className="auth-field">
              <label>Password</label>
              <div className="auth-input-wrap">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
                <i
                  className={`ti ${showPassword ? "ti-eye-off" : "ti-eye"}`}
                  aria-hidden="true"
                  onClick={() => setShowPassword((prev) => !prev)}
                />
              </div>
            </div>

            <button
              type="submit"
              className="auth-main-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Signing in…" : "Log in to Manager Panel"}
            </button>
          </form>

          <div className="auth-footnote">
            <Link to="/login" className="auth-home-link">
              ← Back to customer login
            </Link>
            <Link to="/" className="auth-home-link">
              Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
