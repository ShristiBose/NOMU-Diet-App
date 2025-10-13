import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../index.css"; // single CSS for the whole app

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

        {/* Image Carousel Section */}
        <section className="section image-carousel">
          <div className="carousel-track">
            <div className="carousel-slide">
              <img src="img1.jpeg" alt="Healthy Indian meal 1" />
            </div>
            <div className="carousel-slide">
              <img src="img2.jpeg" alt="Healthy Indian meal 2" />
            </div>
            <div className="carousel-slide">
              <img src="img3.jpeg" alt="Healthy Indian meal 3" />
            </div>
            <div className="carousel-slide">
              <img src="img4.jpeg" alt="Healthy Indian meal 4" />
            </div>
            <div className="carousel-slide">
              <img src="img5.jpeg" alt="Healthy Indian meal 5" />
            </div>

            {/* Duplicate for seamless infinite scroll */}
            <div className="carousel-slide">
              <img src="img1.jpeg" alt="Healthy Indian meal 1" />
            </div>
            <div className="carousel-slide">
              <img src="img2.jpeg" alt="Healthy Indian meal 2" />
            </div>
            <div className="carousel-slide">
              <img src="img3.jpeg" alt="Healthy Indian meal 3" />
            </div>
            <div className="carousel-slide">
              <img src="img4.jpeg" alt="Healthy Indian meal 4" />
            </div>
            <div className="carousel-slide">
              <img src="img5.jpeg" alt="Healthy Indian meal 5" />
            </div>
          </div>
        </section>

        {/* Updated Why Choose NOMU Section */}
        <section className="section feature-overview">
          <h2>Why Choose NOMU?</h2>
          <p className="section-description">
            At NOMU, we blend science with tradition — merging advanced AI nutrition insights 
            with the vibrant flavors and cultural richness of Indian cuisine. Our platform doesn’t 
            just tell you what to eat; it helps you understand <strong>why</strong> each choice matters for your 
            unique body, health goals, and lifestyle.
          </p>
          <p className="section-highlight">
            Whether you're managing diabetes, aiming for balanced weight, or just eating cleaner — 
            NOMU ensures every meal feels familiar, wholesome, and made for <em>you</em>.
          </p>

          <div className="feature-cards-grid">
            <div className="feature-card">
              <img src="img.png" alt="Personalization Icon" className="feature-icon" />
              <h4>Health-First Personalization</h4>
              <p>
                Get meal plans expertly tailored to your specific health conditions, such as 
                diabetes, hypertension, or weight management goals.
              </p>
            </div>

            <div className="feature-card">
              <img src="img.png" alt="Meal Plan Icon" className="feature-icon" />
              <h4>Customized Daily Plans</h4>
              <p>
                Structured, easy-to-follow daily meal plans designed for balance, taste, and variety — 
                using accessible Indian ingredients.
              </p>
            </div>

            <div className="feature-card">
              <img src="img.png" alt="Swap Icon" className="feature-icon" />
              <h4>Local Meal Swap & Customization</h4>
              <p>
                Swap any dish for a healthy, culturally-appropriate alternative from your region, 
                without breaking your nutrition goals.
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
            <img
              src="img.png"
              alt="Screenshot of the 'Can I Eat This' feature on a phone"
              className="feature-image"
            />
          </div>
        </section>

        {/* Reminders & Alerts Feature Section (Image Left, Text Right) */}
        <section className="section image-feature-section feature-reminders">
          <div className="feature-image-wrapper">
            <img
              src="img.png"
              alt="Screen showing health reminders and alerts"
              className="feature-image"
            />
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
