import React from "react";
import { NavLink } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo / Brand */}
        <NavLink to="/home" className="navbar-logo">
          <img src="Logo.png" alt="logo" />
        </NavLink>

        {/* Menu Links */}
        <div className="navbar-menu">
          <NavLink 
            to="/" 
            className={({ isActive }) => 
              `navbar-link ${isActive ? "active" : ""}`
            }
            end
          >
            Home
          </NavLink>
          <NavLink 
            to="/dashboard" 
            className={({ isActive }) => 
              `navbar-link ${isActive ? "active" : ""}`
            }
          >
            Dashboard
          </NavLink>
          <NavLink 
            to="/login" 
            className={({ isActive }) => 
              `navbar-link ${isActive ? "active" : ""}`
            }
          >
            Login
          </NavLink>
        </div>

        {/* Mobile Menu (Hamburger) */}
        <div className="navbar-mobile">
          <button className="navbar-hamburger">☰</button>
        </div>
      </div>
    </nav>
  );
}