import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// Correcting path assumption: Assuming components are in the same directory level as pages
// and index.css is in the root 'src' directory.
import Navbar from "../components/Navbar"; 
import Footer from "../components/Footer"; 
import "../index.css"; 

export default function User() {
  const [profile, setProfile] = useState(null);
  const [condition, setCondition] = useState("Diabetes");
  const [water, setWater] = useState(3); // glasses drunk
  const navigate = useNavigate();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [images, setImages] = useState([]);

    const handleReviewSubmit = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login to submit review");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token,
        },
        body: JSON.stringify({
          rating,
          reviewText,
          images: [], // For now, we just send an empty array or base64 later
        }),
      });

      const data = await res.json();
      if (res.ok) {
        alert("Review submitted successfully!");
        setRating(0);
        setReviewText("");
        setImages([]);
      } else {
        alert(data.msg || "Failed to submit review");
      }
    } catch (err) {
      console.error(err);
      alert("Server error, try again later");
    }
  };
  
  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const res = await fetch("http://localhost:5000/api/profile", {
          headers: { "x-auth-token": token },
        });

        const data = await res.json();
        if (res.ok) {
          setProfile(data);
          if (data.conditions && data.conditions.length > 0 && data.conditions[0] !== "None") {
            setCondition(data.conditions[0]); // set first condition by default
          }
        } else {
          console.error(data.msg || "Failed to fetch profile");
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchProfile();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  if (!profile) return <p>Loading profile...</p>;

  // dummy meal recommendations
  const meals = {
    breakfast: "Vegetable Upma + 1 boiled egg",
    lunch: "Dal + Brown Rice + Salad",
    snacks: "Sprouts Chaat",
    dinner: "Roti + Paneer Bhurji + Stir-fry veggies",
  };

  return (
    <div className="user-app">
      {/* Custom Header: Acts as the top nav for the dashboard */}
      <header className="user-header">
        {/* Left Side: Welcome Message */}
        <div className="user-header-left">
          <h2>Welcome, {profile.name} 👋</h2>
          <p>
            Condition: <b>{condition}</b> | Goal: <b>{profile.goals || "Not set"}</b> | Age: <b>{profile.age}</b>
          </p>
        </div>

        {/* Right Side: Buttons */}
        <div className="nav-buttons">
          <button onClick={() => navigate("/user-profile")} className="profile-btn">
            Profile
          </button>
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </header>

      {/* Main User Content */}
      <main className="user-main">
        {/* Meal Recommendations */}
        <section className="user-section">
          <h3 className="section-title">Today's Meals</h3>
          <div className="meal-grid">
            {Object.entries(meals).map(([mealType, mealValue]) => (
              <div key={mealType} className="meal-card">
                <h4 className="meal-type">{mealType}</h4>
                <p>{mealValue}</p>
                <button className="chatbot-btn">Don’t like this? Ask chatbot →</button>
              </div>
            ))}
          </div>
        </section>

        {/* Reminders & Hydration */}
        <section className="user-section">
          <h3 className="section-title">Reminders</h3>
          <div className="hydration">
            <p className="label">Hydration</p>
            <p>
              {water}/8 glasses drunk 💧
              <button onClick={() => setWater(water + 1)} className="add-btn">
                +1
              </button>
            </p>
          </div>
          <div className="meal-reminders">
            <p className="label">Meals</p>
            <ul>
              <li>Breakfast – 9:00 AM</li>
              <li>Lunch – 1:30 PM</li>
              <li>Snacks – 5:00 PM</li>
              <li>Dinner – 8:30 PM</li>
            </ul>
          </div>
        </section>

{/* Review & Feedback Section */}
<section className="user-section">
  <h3 className="section-title">Share Your Feedback</h3>

  {/* Star Ratings */}
  <div className="rating-stars">
    {[1, 2, 3, 4, 5].map((star) => (
      <span
        key={star}
        className={star <= (hover || rating) ? "star filled" : "star"}
        onClick={() => setRating(star)}
        onMouseEnter={() => setHover(star)}
        onMouseLeave={() => setHover(0)}
      >
        ★
      </span>
    ))}
  </div>

  {/* Review Text */}
  <textarea
    className="review-input"
    placeholder="Write your review..."
    rows="4"
    value={reviewText}
    onChange={(e) => setReviewText(e.target.value)}
  ></textarea>

  {/* Upload Images (not wired yet) */}
  <input
    type="file"
    className="review-upload"
    multiple
    accept="image/*"
    onChange={(e) => setImages([...e.target.files])}
  />

  {/* Submit Button */}
  <button className="submit-review-btn" onClick={handleReviewSubmit}>
    Submit Review
  </button>
</section>
      </main>
      <Footer />
    </div>
  );
}
