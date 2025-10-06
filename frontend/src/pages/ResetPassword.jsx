import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirm) {
      setMessage("❌ Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`http://localhost:5000/api/auth/reset-password/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();
      setLoading(false);

      if (res.ok) {
        alert("✅ Password reset successful! Please log in with your new password.");
        navigate("/login");
      } else {
        setMessage(`❌ ${data.msg || "Something went wrong."}`);
      }
    } catch (error) {
      setLoading(false);
      console.error("Error:", error);
      setMessage("❌ Server error. Please try again later.");
    }
  };

  return (
    <div className="reset-password-page">
      <Navbar />

<main>
  <div className="auth-page">
    <div className="auth-card slide-in">
      <h2 className="auth-title">Reset Password</h2>
      <form className="auth-form" onSubmit={handleSubmit}>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter new password"
          required
        />
        <input
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="Confirm new password"
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? "Resetting..." : "Reset Password"}
        </button>
      </form>
      {message && (
        <p style={{ color: message.startsWith("✅") ? "green" : "red", textAlign: "center" }}>
          {message}
        </p>
      )}
    </div>
  </div>
</main>

      <Footer />
    </div>
  );
}
