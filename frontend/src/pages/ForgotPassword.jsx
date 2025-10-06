import React, { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage(
          <>
            ✅ Reset link sent! <br />
            <a href={data.previewURL} target="_blank" rel="noopener noreferrer">
              Click here to open email
            </a>
          </>
        );
      } else {
        setMessage(data.msg || "Error sending email");
      }
    } catch (err) {
      console.error(err);
      setMessage("Server error");
    }
  };

  return (
    <>
      <Navbar />
      <div className="auth-page">
        <div className="auth-card slide-in">
          <h2 className="auth-title">Forgot Password?</h2>
          <p className="auth-subtitle">Enter your registered email to receive a reset link</p>
          <form className="auth-form" onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="Email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button type="submit">Send Reset Link</button>
          </form>
          {message && <p style={{ marginTop: "10px", textAlign: "center" }}>{message}</p>}
          <p className="auth-switch">
            Remembered your password? <Link to="/login">Login here</Link>
          </p>
        </div>
      </div>
      <Footer />
    </>
  );
}
