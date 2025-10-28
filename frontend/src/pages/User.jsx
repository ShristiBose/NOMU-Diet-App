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
  const [meals, setMeals] = useState(null);
  const [loading, setLoading] = useState(false);

  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState([
    { sender: "bot", text: "Hello! I’m here to help you with your meals and diet 🥗" },
  ]);

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
          images: [], // You can extend this to upload images later
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
          setMeals(data.predictions?.slice(-1)[0]?.meals || null);
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

  const handlePredict = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch("http://localhost:5000/api/profile/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({}),
      });

      const data = await res.json();
      if (res.ok) {
        setMeals(data.meals);
      } else {
        console.error(data.msg);
        alert("Prediction failed");
      }
    } catch (err) {
      console.error(err);
      alert("Server error");
    } finally {
      setLoading(false);
    }
  };

const handleSendMessage = async () => {
  if (!chatInput.trim()) return;

  // Add user's message to chat
  const newMessage = { sender: "user", text: chatInput };
  setChatMessages((prev) => [...prev, newMessage]);

  const currentInput = chatInput;
  setChatInput("");

  try {
    const res = await fetch("http://localhost:5000/api/chatbot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userMessage: currentInput,
        predictedFood: meals ? Object.values(meals).flat()[0] : "food item",
      }),
    });

    const data = await res.json();

    // Add bot's reply
    setChatMessages((prev) => [
      ...prev,
      { sender: "bot", text: data.suggestion || "Sorry, I couldn’t generate a reply." },
    ]);
  } catch (err) {
    console.error("Chatbot error:", err);
    setChatMessages((prev) => [
      ...prev,
      { sender: "bot", text: "There was a problem reaching the local AI." },
    ]);
  }
};


  if (!profile) return <p>Loading profile...</p>;

  return (
    <div className="user-app" style={{ position: "relative", minHeight: "100vh" }}>
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

      {/* Nutrition Section */}
      <section className="user-section">
        <h3 className="section-title">Your Nutrition Requirements 🥗</h3>
        <div className="nutrition-grid">
          {profile.nutrition ? Object.entries(profile.nutrition).map(([key, value]) => (
            <div key={key} className="nutrition-card">
              <strong>{key}</strong> {value}
            </div>
          )) : <p>Calculating...</p>}
        </div>
      </section>

      {/* Meals Section with Prediction */}
      <section className="user-section">
        <div className="section-header-with-button">
          <h3 className="section-title">Today's Meals 🍽️</h3>
          <button className="logout-btn" onClick={handlePredict} disabled={loading}>
            {loading ? "Predicting..." : "Predict Meals"}
          </button>
        </div>
        <div className="meal-grid">
          {meals
            ? Object.entries(meals).map(([mealType, mealItems]) => (
                <div key={mealType} className="meal-card">
                  <h4 className="meal-type">{mealType}</h4>
                  <p>{mealItems.join(", ") || "No recommendation"}</p>
                  <button className="chatbot-btn">Ask Chatbot if you want the recipe or if you don't like the sugesstion →</button>
                </div>
              ))
            : <p>Click “Predict Meals” to see recommendations</p>}
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

      {/* Chatbot */}
      <div className={`chatbot-container ${chatOpen ? "open" : ""}`}>
        <div className="chatbot-header">
          <h4>💬 Chatbot</h4>
          <button onClick={toggleChat}>✖</button>
        </div>
        <div className="chatbot-body">
          <div className="chatbot-messages">
            {chatMessages.map((msg, idx) => (
              <p key={idx} className={msg.sender === "bot" ? "bot-msg" : "user-msg"}>
                {msg.text}
              </p>
            ))}
          </div>
          <div className="chatbot-input-container">
            <input
              type="text"
              placeholder="Type your message..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSendMessage();
              }}
            />
            <button onClick={handleSendMessage}>Send</button>
          </div>
        </div>
      </div>
      {!chatOpen && (
        <button className="chatbot-toggle-btn" onClick={toggleChat}>
          💬 Chat
        </button>
      )}

      <Footer />
    </div>
  );
}