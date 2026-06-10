import { useState } from "react";
import './managerLogin.css';
import { useNavigate } from "react-router-dom";



export default function ManagerLoginModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  if (!isOpen) return null;

    
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:3000/manager/login", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message);
        return;
      }

      alert("Manager Login Successful");

      navigate("/manager");
    
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    }
  };

  return (
    <div className="manager-modal-overlay" onClick={onClose}>
      <div
        className="manager-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="manager-close"
          onClick={onClose}
        >
          ✕
        </button>

        <h2>Manager Login</h2>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Manager Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button type="submit">
            Login
          </button>
        </form>
      </div>
    </div>
  );
}