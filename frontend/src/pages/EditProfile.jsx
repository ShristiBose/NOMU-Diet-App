import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../index.css";
import Footer from "../components/Footer";

const MEDICAL_CONDITIONS = [
  "None",
  "Diabetes",
  "Hypertension",
  "Hyperlipidemia",
  "PCOS",
  "Thyroid Disorders",
  "Obesity",
  "Underweight",
  "Heart Disease",
  "Kidney Disease",
  "Liver Disease",
  "Celiac Disease",
  "Lactose Intolerance",
  "Anemia",
  "Gastrointestinal Disorders",
  "Pregnancy",
  "Other",
];

export default function EditProfile() {
  const [formData, setFormData] = useState(null);
  const navigate = useNavigate();

  const calculateAge = (dob) => {
    if (!dob) return "";
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
  };

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }
      try {
        const res = await fetch("http://localhost:5000/api/profile", {
          headers: { "x-auth-token": token },
        });
        const data = await res.json();
        if (res.ok) {
          const formattedDob = data.dob ? data.dob.split("T")[0] : "";
          const age = calculateAge(formattedDob);
          setFormData({ ...data, dob: formattedDob, age: age });
        } else {
          alert("Failed to load profile");
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchProfile();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "dob") {
      const newAge = calculateAge(value);
      setFormData({ ...formData, [name]: value, age: newAge });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleConditionChange = (e) => {
    const { value, checked } = e.target;
    let newConditions = [...formData.conditions];

    if (value === "None") {
      newConditions = checked ? ["None"] : newConditions.filter((c) => c !== "None");
    } else {
      if (checked) {
        newConditions = newConditions.filter((c) => c !== "None");
        if (!newConditions.includes(value)) newConditions.push(value);
      } else {
        newConditions = newConditions.filter((c) => c !== value);
      }
    }
    if (newConditions.length === 0) newConditions = ["None"];
    setFormData({ ...formData, conditions: newConditions });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("http://localhost:5000/api/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token,
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        alert("Profile updated successfully!");
        navigate("/user-profile");
      } else {
        alert(data.msg || "Update failed");
      }
    } catch (err) {
      console.error(err);
      alert("Server error");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  if (!formData) return <p>Loading profile...</p>;

  return (
    <div className="profile-app">
      {/* Header copied from UserProfile */}
      <header className="user-header">
        <div className="user-header-left">
          <h2>Edit {formData.name}'s Profile</h2>
          <p>Update your details below.</p>
        </div>
        <div className="nav-buttons">
          <button className="profile-btn" onClick={() => navigate("/user-profile")}>
            ⬅️ Back to Profile
          </button>
          <button className="profile-btn" onClick={() => navigate("/user")}>
            ⬅️ Back to My Dashboard
          </button>
          <button className="logout-btn" onClick={handleLogout}>
            🚪 Logout
          </button>
        </div>
      </header>

      {/* Main Form */}
      <main className="profile-main">
        <section className="profile-section">
          <h2 className="title text-center">Edit Profile</h2>
          <form className="profile-form" onSubmit={handleSubmit}>
            {/* Form fields (name, dob, age, gender, weight, height, conditions, diet, allergies, activity, goals) */}
            {/* Same as before */}
            <div className="form-group">
              <label>Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Date of Birth</label>
              <input type="date" name="dob" value={formData.dob} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Age</label>
              <input type="number" name="age" value={formData.age} readOnly />
            </div>
            <div className="form-group">
              <label>Gender</label>
              <select name="gender" value={formData.gender} onChange={handleChange}>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>
            <div className="form-group">
              <label>Weight (kg)</label>
              <input type="number" name="weight" value={formData.weight} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Height (cm)</label>
              <input type="number" name="height" value={formData.height} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Medical Condition(s)</label>
              <div className="checkbox-group">
                {MEDICAL_CONDITIONS.map((condition) => (
                  <label key={condition}>
                    <input
                      type="checkbox"
                      value={condition}
                      checked={formData.conditions.includes(condition)}
                      onChange={handleConditionChange}
                    />
                    {condition}
                  </label>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label>Diet Preference</label>
              <select name="dietPreference" value={formData.dietPreference} onChange={handleChange}>
                <option>Vegetarian</option>
                <option>Non-Vegetarian</option>
                <option>Vegan</option>
              </select>
            </div>
            <div className="form-group">
              <label>Allergies</label>
              <input type="text" name="allergies" value={formData.allergies} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Activity Level</label>
              <select name="activityLevel" value={formData.activityLevel} onChange={handleChange}>
                <option>Sedentary</option>
                <option>Light</option>
                <option>Moderate</option>
                <option>Active</option>
                <option>Very Active</option>
              </select>
            </div>
            <div className="form-group">
              <label>Goals</label>
              <textarea name="goals" value={formData.goals} onChange={handleChange} />
            </div>

            <button type="submit" className="save-btn">Update Profile</button>
          </form>
        </section>
      </main>
      <Footer />
    </div>
  );
}
