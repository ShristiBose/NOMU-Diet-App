import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../index.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.type === "email" ? "email" : "password"]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("token", data.token);
        navigate("/user"); // go to users page directly
      } else {
        alert(data.msg || "Login failed");
      }
    } catch (err) {
      console.error(err);
      alert("Server error");
    }
  };

  return (
    <>
      <Navbar />
      <div className="auth-page">
        <div className="auth-card slide-in">
          <h2 className="auth-title">Welcome Back</h2>
          <p className="auth-subtitle">Log in to continue your healthy journey</p>
          <form className="auth-form" onSubmit={handleSubmit}>
            <input type="email" placeholder="Email" required onChange={handleChange} />
            <input type="password" placeholder="Password" required onChange={handleChange} />
            <button type="submit">Login</button>
          </form>
          <Link to="/forgot-password" className="auth-switch">Forgot Password</Link>
          <p className="auth-switch">
            Don’t have an account? <Link to="/register">Click here to register</Link>
          </p>
        </div>
      </div>
      <Footer />
    </>
  );
}
