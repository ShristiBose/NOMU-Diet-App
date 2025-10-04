import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../index.css";

// Define the full list of medical conditions once
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

export default function Profile() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    dob: "",
    age: "",
    gender: "Male",
    weight: "",
    height: "",
    // Changed to an array to store multiple conditions
    conditions: ["None"],
    dietPreference: "Vegetarian",
    allergies: "",
    activityLevel: "Moderate",
    goals: "",
  });

  // Calculate age automatically based on DOB
  useEffect(() => {
    if (formData.dob) {
      const today = new Date();
      const birthDate = new Date(formData.dob);
      let calculatedAge = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        calculatedAge--;
      }
      setFormData((prev) => ({ ...prev, age: calculatedAge }));
    }
  }, [formData.dob]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleConditionChange = (e) => {
    const { value, checked } = e.target;
    let newConditions = [...formData.conditions];

    if (value === "None") {
      // Logic for "None" checkbox:
      // If "None" is checked, deselect all others.
      // If "None" is unchecked, it will be removed unless the list is empty at the end.
      newConditions = checked ? ["None"] : newConditions.filter(c => c !== "None");
    } else {
      // Logic for any other checkbox:
      if (checked) {
        // If checked, remove "None" from the array and add the new condition
        newConditions = newConditions.filter(c => c !== "None");
        if (!newConditions.includes(value)) {
          newConditions.push(value);
        }
      } else {
        // If unchecked, remove the condition
        newConditions = newConditions.filter((condition) => condition !== value);
      }
    }

    // Fallback: If the user unchecks everything, default back to "None"
    if (newConditions.length === 0) {
      newConditions = ["None"];
    }
    
    setFormData({ ...formData, conditions: newConditions });
  };


const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const token = localStorage.getItem("token");
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
      alert("Profile saved successfully!");
      navigate("/user"); // go to users page
    } else {
      alert(data.msg || "Profile save failed");
    }
  } catch (err) {
    console.error(err);
    alert("Server error");
  }
};

  return (
    <div className="profile-app">
      <Navbar />
      <main className="profile-main">
        <section className="profile-section">
          <h2 className="title text-center">Create Your Profile</h2>
          <form className="profile-form" onSubmit={handleSubmit}>
            {/* Personal Info fields (rest of the form remains the same) */}
            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your name"
                required
              />
            </div>

            <div className="form-group">
              <label>Date of Birth</label>
              <input
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Age</label>
              <input
                type="number"
                name="age"
                value={formData.age}
                readOnly
                placeholder="Auto-calculated"
              />
            </div>

            <div className="form-group">
              <label>Gender</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
              >
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>

            <div className="form-group">
              <label>Weight (kg)</label>
              <input
                type="number"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                placeholder="Enter weight in kg"
                required
              />
            </div>

            <div className="form-group">
              <label>Height (cm)</label>
              <input
                type="number"
                name="height"
                value={formData.height}
                onChange={handleChange}
                placeholder="Enter height in cm"
                required
              />
            </div>

            {/* Health Info */}
            <div className="form-group">
              <label>Medical Condition(s) (Select all that apply)</label>
              <div className="checkbox-group">
                {/* Dynamically generate checkboxes for all conditions */}
                {MEDICAL_CONDITIONS.map((condition) => (
                  <label key={condition} className="checkbox-label">
                    <input
                      type="checkbox"
                      name="conditions"
                      value={condition}
                      checked={formData.conditions.includes(condition)}
                      onChange={handleConditionChange}
                      // *** FIX: REMOVED THE 'disabled' PROP entirely ***
                      // This allows the user to click any option,
                      // and the state logic will handle the mutual exclusion.
                    />
                    {condition}
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Diet Preference</label>
              <select
                name="dietPreference"
                value={formData.dietPreference}
                onChange={handleChange}
              >
                <option>Vegetarian</option>
                <option>Non-Vegetarian</option>
                <option>Vegan</option>
              </select>
            </div>

            <div className="form-group">
              <label>Allergies / Restrictions</label>
              <input
                type="text"
                name="allergies"
                value={formData.allergies}
                onChange={handleChange}
                placeholder="E.g. nuts, gluten"
              />
            </div>

            <div className="form-group">
              <label>Activity Level</label>
              <select
                name="activityLevel"
                value={formData.activityLevel}
                onChange={handleChange}
              >
                <option>Sedentary</option>
                <option>Light</option>
                <option>Moderate</option>
                <option>Active</option>
                <option>Very Active</option>
              </select>
            </div>

            <div className="form-group">
              <label>Goals</label>
              <textarea
                name="goals"
                value={formData.goals}
                onChange={handleChange}
                placeholder="E.g. Lose weight, Gain muscle"
              />
            </div>

            <button type="submit" className="save-btn">
              Save Profile
            </button>
          </form>
        </section>
      </main>
      <Footer />
    </div>
  );
}