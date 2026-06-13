import { Outlet } from "react-router-dom";
import Navbar from "../Components/NavbarItems/Navbar";
import Footer from "./Footer";

export default function Layout() {
  return (
    <div className="wrap" id="wrap">
      <Navbar />
      <div style={{ flex: 1 }}>
        <Outlet />
      </div>
      <Footer />
    </div>
  );
}
