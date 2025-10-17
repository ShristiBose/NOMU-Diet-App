import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../index.css";

export default function User() {
  const [profile, setProfile] = useState(null);
  const [condition, setCondition] = useState("Diabetes");
  const [water, setWater] = useState(3);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [images, setImages] = useState([]);
  const [chatOpen, setChatOpen] = useState(false);

  const navigate = useNavigate();

  const toggleChat = () => setChatOpen(!chatOpen);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

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
          images: [],
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
            setCondition(data.conditions[0]);
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

  if (!profile) return <p>Loading profile...</p>;

  const meals = {
    breakfast: "Vegetable Upma + 1 boiled egg",
    lunch: "Dal + Brown Rice + Salad",
    snacks: "Sprouts Chaat",
    dinner: "Roti + Paneer Bhurji + Stir-fry veggies",
  };

  return (
    <div className="user-app" style={{ position: "relative", minHeight: "100vh" }}>
      {/* Header */}
      <header className="user-header">
        <div className="user-header-left">
          <h2>Welcome, {profile.name} 👋</h2>
          <p>
            Condition: <b>{condition}</b> | Goal: <b>{profile.goals || "Not set"}</b> | Age: <b>{profile.age}</b>
          </p>
        </div>

        <div className="nav-buttons">
          <button onClick={() => navigate("/user-profile")} className="profile-btn">
            👤 View Profile
          </button>
          <button onClick={handleLogout} className="logout-btn">
            🚪 Logout
          </button>
        </div>
      </header>

<section className="user-section">
  <h3 className="section-title">Your Nutrition Requirements 🥗</h3>
  <div className="nutrition-grid">
    {profile.nutrition ? Object.entries(profile.nutrition).map(([key, value]) => (
      <div key={key} className="nutrition-card">
        <strong>{key}</strong>: {value}
      </div>
    )) : <p>Calculating...</p>}
  </div>
</section>

      {/* Main + Chat Container */}
      <div className="main-chat-wrapper" style={{ display: "flex" }}>
        <main className={`user-main ${chatOpen ? "chat-open" : ""}`}>
          {/* Meals Section */}
          <section className="user-section">
            <h3 className="section-title">Today's Meals 🍽️</h3>
            <div className="meal-grid">
              {Object.entries(meals).map(([mealType, mealValue]) => (
                <div key={mealType} className="meal-card">
                  <h4 className="meal-type">{mealType}</h4>
                  <p>{mealValue}</p>
                  <button className="chatbot-btn">View Recipe →</button>
                </div>
              ))}
            </div>
          </section>

          {/* Hydration & Reminders */}
          <section className="user-section">
            <h3 className="section-title">Reminders ⏰</h3>
            <div className="hydration">
              <p className="label">💧 Hydration</p>
              <p>
                {water}/8 glasses drunk{" "}
                <button onClick={() => setWater(water + 1)} className="add-btn">
                  ➕ +1
                </button>
              </p>
            </div>
            <div className="meal-reminders">
              <p className="label">🍱 Meal Times</p>
              <ul>
                <li>Breakfast – 9:00 AM</li>
                <li>Lunch – 1:30 PM</li>
                <li>Snacks – 5:00 PM</li>
                <li>Dinner – 8:30 PM</li>
              </ul>
            </div>
          </section>

          {/* Feedback Section */}
          <section className="user-section">
            <h3 className="section-title">Share Your Feedback 💭</h3>

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

            <textarea
              className="review-input"
              placeholder="Write your review..."
              rows="4"
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
            ></textarea>

            <input
              type="file"
              className="review-upload"
              multiple
              accept="image/*"
              onChange={(e) => setImages([...e.target.files])}
            />

            <button className="submit-review-btn" onClick={handleReviewSubmit}>
              📨 Submit Review
            </button>
          </section>
        </main>

        {/* Chatbot Panel */}
        <div className={`chatbot-container ${chatOpen ? "open" : ""}`}>
          <div className="chatbot-header">
            <h4>💬 Chatbot</h4>
            <button onClick={toggleChat}>✖</button>
          </div>
          <div className="chatbot-body">
            <p>Hello! I’m here to help you with your meals and diet 🥗</p>
            {/* Add chat messages or chatbot UI here */}
          </div>
        </div>
      </div>

      {/* Floating Chatbot Button */}
      {!chatOpen && (
        <button className="chatbot-toggle-btn" onClick={toggleChat}>
          💬 Chat
        </button>
      )}

      <Footer />
    </div>
  );
}
