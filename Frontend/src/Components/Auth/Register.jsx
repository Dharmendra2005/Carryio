import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./Register.css";

function getPasswordStrength(value) {
  let score = 0;
  if (value.length >= 8) score += 1;
  if (/[A-Z]/.test(value)) score += 1;
  if (/[0-9]/.test(value)) score += 1;
  if (/[^A-Za-z0-9]/.test(value)) score += 1;
  return score;
}

export default function Register({ onSwitchToLogin, onAuthSuccess }) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(true);

  const strength = useMemo(() => getPasswordStrength(password), [password]);

  const strengthMeta = useMemo(() => {
    if (!password) return { label: "Enter a password", tone: "empty" };
    if (strength <= 1)
      return { label: "Weak - add more characters", tone: "weak" };
    if (strength === 2)
      return { label: "Fair - include uppercase or symbol", tone: "fair" };
    if (strength === 3) return { label: "Good - almost there", tone: "good" };
    return { label: "Strong password", tone: "strong" };
  }, [password, strength]);

  const navigate = useNavigate();
  const location = useLocation();
  const returnTo = location.state?.returnTo || "/";
  const nextState = location.state?.product
    ? { product: location.state.product }
    : undefined;

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const firstName = String(formData.get("firstName") || "").trim();
    const lastName = String(formData.get("lastName") || "").trim();
    const email = String(formData.get("email") || "").trim();

    const response = await fetch("http://localhost:3000/users/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        firstName,
        lastName,
        email,
        password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.message || "Registration failed");
      return;
    }

    alert("Account created successfully");
    onSwitchToLogin();

    onAuthSuccess?.({
      name: `${firstName} ${lastName}`.trim() || email.split("@")[0] || "Guest",
      email,
      rememberMe: true,
    });

    navigate(returnTo, {
      replace: true,
      state: nextState,
    });
  };

  const passwordMismatch =
    confirmPassword.length > 0 && password !== confirmPassword;

  return (
    <div className="auth-panel">
      <h1 className="auth-title">Create your account</h1>
      <p className="auth-subtitle">
        Already a member?{" "}
        <button
          type="button"
          className="auth-link-btn"
          onClick={onSwitchToLogin}
        >
          Log in
        </button>
      </p>

      <form onSubmit={handleSubmit}>
        <div className="auth-register-grid">
          <div className="auth-field">
            <label>First name</label>
            <input
              name="firstName"
              type="text"
              placeholder="First name"
              required
            />
          </div>
          <div className="auth-field">
            <label>Last name</label>
            <input
              name="lastName"
              type="text"
              placeholder="Last name"
              required
            />
          </div>
        </div>

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
              placeholder="Create a strong password"
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
          <div className="auth-strength-bars">
            {[0, 1, 2, 3].map((index) => (
              <span
                key={index}
                className={`auth-strength-bar ${
                  strength > index ? `is-${strengthMeta.tone}` : ""
                }`}
              />
            ))}
          </div>
          <div className={`auth-strength-label is-${strengthMeta.tone}`}>
            {strengthMeta.label}
          </div>
        </div>

        <div className="auth-field">
          <label>Confirm password</label>
          <div className="auth-input-wrap">
            <input
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Repeat your password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              required
            />
            <i
              className={`ti ${showConfirmPassword ? "ti-eye-off" : "ti-eye"}`}
              aria-hidden="true"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
            />
          </div>
          {passwordMismatch ? (
            <div className="auth-error">Passwords do not match.</div>
          ) : null}
        </div>

        <label className="auth-check auth-terms">
          <input
            type="checkbox"
            checked={acceptedTerms}
            onChange={(event) => setAcceptedTerms(event.target.checked)}
          />
          I agree to Carryio terms and privacy policy, and I want member
          updates.
        </label>

        <button
          type="submit"
          className="auth-main-btn"
          disabled={passwordMismatch || !acceptedTerms}
        >
          Create my account
        </button>
      </form>
    </div>
  );
}
