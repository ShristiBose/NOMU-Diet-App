import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../index.css";
import Footer from "../components/Footer";

export default function UserProfile() {
  const [profile, setProfile] = useState(null);
  const navigate = useNavigate();

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
          setProfile(data);
        } else {
          console.error(data.msg || "Failed to fetch profile");
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  if (!profile) return <p className="loading">Loading profile...</p>;

  return (
    <div className="profile-page slide-in">
      <header className="user-header">
        <div className="user-header-left">
          <h2>{profile.name}'s Profile</h2>
          <p>Welcome back, {profile.name}! Manage your details below.</p>
        </div>
        <div className="nav-buttons">
          <button
            className="profile-btn"
            onClick={() => navigate("/edit-profile")}
          >
            ✏️ Edit Profile
          </button>
          <button className="profile-btn" onClick={() => navigate("/user")}>
            ⬅️ Back to My Dashboard
          </button>
          <button className="logout-btn" onClick={handleLogout}>
            🚪 Logout
          </button>
        </div>
      </header>

      <main className="profile-main">
        {/* Basic Info */}
        <section className="profile-section fade-up">
          <h3 className="section-title">Basic Information</h3>
          <div className="profile-info">
            <p><strong>Name:</strong> {profile.name}</p>
            <p><strong>Email:</strong> {profile.email}</p>
            <p><strong>Date of Birth:</strong> {profile.dob || "Not set"}</p>
            <p><strong>Age:</strong> {profile.age || "Not set"}</p>
            <p><strong>Gender:</strong> {profile.gender || "Not set"}</p>
          </div>
        </section>

        {/* Physical Info */}
        <section className="profile-section fade-up">
          <h3 className="section-title">Physical Information</h3>
          <div className="profile-info">
            <p><strong>Weight:</strong> {profile.weight ? `${profile.weight} kg` : "Not set"}</p>
            <p><strong>Height:</strong> {profile.height ? `${profile.height} cm` : "Not set"}</p>
          </div>
        </section>

        {/* Health Conditions */}
        <section className="profile-section fade-up">
          <h3 className="section-title">Health Conditions</h3>
          {profile.conditions && profile.conditions.length > 0 ? (
            <ul className="condition-list">
              {profile.conditions.map((cond, idx) => (
                <li key={idx}>{cond}</li>
              ))}
            </ul>
          ) : (
            <p>No conditions added.</p>
          )}
        </section>

        {/* Diet & Lifestyle */}
        <section className="profile-section fade-up">
          <h3 className="section-title">Diet & Lifestyle</h3>
          <div className="profile-info">
            <p><strong>Diet Preference:</strong> {profile.dietPreference || "Not set"}</p>
            <p><strong>Allergies:</strong> {profile.allergies || "None"}</p>
            <p><strong>Activity Level:</strong> {profile.activityLevel || "Not set"}</p>
            <p><strong>Goals:</strong> {profile.goals || "Not set"}</p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
