import React from "react";
import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo / Brand */}
        <Link to="/home" className="navbar-logo">
          NOMU
        </Link>

        {/* Menu Links */}
        <div className="navbar-menu">
          <Link to="/dashboard" className="navbar-link">Dashboard</Link>
          <Link to="/login" className="navbar-link">Login</Link>
        </div>

        {/* Mobile Menu (Hamburger) */}
        <div className="navbar-mobile">
          <button className="navbar-hamburger">☰</button>
        </div>
      </div>
    </nav>
  );
}
