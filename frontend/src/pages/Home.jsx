import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import '../index.css'; // single CSS for the whole app

export default function Home() {
  return (
    <div className="app-container">
      <Navbar />

      <main className="main-content">
        {/* Hero Section */}
        <section className="hero-section">
          <h1 className="hero-title">NOMU: Your Diet, Personalized.</h1>
          <p className="hero-subtitle">
            Seamlessly integrate health into your Indian lifestyle with intelligent,
            culturally relevant meal recommendations.
          </p>
          <button className="hero-button">Start Your Free Plan Today</button>
        </section>

        {/* Why Nomu Section - Now a Feature Overview */}
        <section className="section feature-overview">
          <h2>Why Choose NOMU?</h2>
          <p className="section-description">
            We go beyond generic meal plans. NOMU uses AI to understand your unique
            needs, giving you a diet plan that is effective, enjoyable, and distinctly Indian.
          </p>
          <div className="feature-cards-grid">
            <div className="feature-card">
              <img src="/path/to/icon-or-image-1.svg" alt="Personalization Icon" className="feature-icon" />
              <h4>Health-First Personalization</h4>
              <p>
                Get meal plans expertly tailored to your specific health conditions, such as 
                diabetes, hypertension, or weight management goals.
              </p>
            </div>
            <div className="feature-card">
              <img src="/path/to/icon-or-image-2.svg" alt="Meal Plan Icon" className="feature-icon" />
              <h4>Customized Daily Plans</h4>
              <p>
                Receive structured, easy-to-follow meal plans for every day of the week,
                designed for balance and variety using local, accessible ingredients.
              </p>
            </div>
            <div className="feature-card">
              <img src="/path/to/icon-or-image-3.svg" alt="Swap Icon" className="feature-icon" />
              <h4>Local Meal Swap & Customization</h4>
              <p>
                Don't like what's on the menu? Swap out any dish for a healthy, culturally-appropriate 
                alternative based on your local cuisine and preferences.
              </p>
            </div>
          </div>
        </section>

        {/* "Can I Eat This?" Feature Section with Image */}
        <section className="section image-feature-section feature-query">
            <div className="feature-text-content">
                <h2>Quick Queries: "Can I Eat This?"</h2>
                <p>
                    Instant peace of mind. Use our quick query tool to check if a specific food
                    aligns with your current health plan, restrictions, or calorie goals.
                </p>
                <button className="secondary-button">Try the Query Tool</button>
            </div>
            <div className="feature-image-wrapper">
                <img src="/path/to/chatbot-screenshot.jpg" alt="Screenshot of the 'Can I Eat This' feature on a phone" className="feature-image" />
            </div>
        </section>

        {/* Reminders & Alerts Feature Section (Reversed Layout) */}
        <section className="section image-feature-section feature-reminders reverse-layout">
            <div className="feature-image-wrapper">
                <img src="/path/to/alert-system-screen.jpg" alt="Screen showing health reminders and alerts" className="feature-image" />
            </div>
            <div className="feature-text-content">
                <h2>Intelligent Reminders & Alerts</h2>
                <p>
                    Stay on track effortlessly. NOMU sends you timely reminders for meals and hydration. 
                    Plus, receive smart alerts based on past meals, suggesting adjustments to maintain 
                    optimal nutrient intake.
                </p>
                <button className="secondary-button">View Alerts Settings</button>
            </div>
        </section>

        {/* Mission Statement */}
        <section className="section mission-section">
          <h2>Our Mission</h2>
          <p>
            Our core mission is to empower a healthier India by making informed, responsible food 
            choices simple, accessible, and deeply respectful of cultural and dietary needs. 
            We strive to be the bridge between traditional Indian cuisine and modern nutritional science.
          </p>
        </section>
      </main>

      <Footer />
    </div>
  );
}