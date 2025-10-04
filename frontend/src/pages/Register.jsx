// Register.jsx
import React, { useState} from "react";
import { Link, useNavigate } from "react-router-dom";
import "../index.css";

export default function Register() {
    const [formData, setFormData] = useState({ email: "", phone: "", password: "" });
    const navigate = useNavigate();
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.type === "email" ? "email": e.target.type === "password" ? "password": "phone"]: e.target.value });
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch("http://localhost:5000/api/auth/register", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(formData),
            });

            const data = await res.json();
            if (res.ok) {
                localStorage.setItem("token", data.token);
                navigate("/profile");
            }
            else{
                alert(data.msg || "Reigisttration failed");
            }
        } catch (error) {
            console.error(error);
            alert("Server error.");
        }
};
  return (
    <div className="auth-page">
      <div className="auth-card slide-in">
        <h2 className="auth-title">Create Account</h2>
        <p className="auth-subtitle">Join NOMU and start eating better today</p>

        <form className="auth-form" onSubmit = {handleSubmit}>
          <input type="email" placeholder="Email" required onChange = {handleChange}/>
          <input type="phone number" placeholder="Phone Number" required onChange = {handleChange} />
          <input type="password" placeholder="Password" required onChange = {handleChange} />
          <button type="submit">Register</button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Click here to login</Link>
        </p>
      </div>
    </div>
  );
}