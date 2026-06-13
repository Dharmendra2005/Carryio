import React from "react";
import { useLocation } from "react-router-dom";
import UserLoginComponent from "../Components/Auth/Login";

export default function UserLogin() {
  const location = useLocation();
  const initialTab = location.pathname === "/register" ? "register" : "login";

  return (
    <div style={{ padding: 24 }}>
      <UserLoginComponent key={location.pathname} initialTab={initialTab} />
    </div>
  );
}
