// Footer.jsx
import React from 'react';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        
        {/* Brand Section */}
        <div className="footer-brand">
          <h3>NOMU</h3>
          <p>Eat healthy, live better.</p>
        </div>

        {/* Quick Links */}
        <div className="footer-links">
          <h4>Quick Links</h4>
          <ul>
            <li><a href="/home">Home</a></li>
            <li><a href="/recipes">Recipes</a></li>
            <li><a href="/chatbot">Diet Chatbot</a></li>
            <li><a href="/mission">Our Mission</a></li>
            <li><a href="/contact">Contact</a></li>
          </ul>
        </div>

        {/* Resources */}
        <div className="footer-links">
          <h4>Resources</h4>
          <ul>
            <li><a href="/bmi">BMI Calculator</a></li>
            <li><a href="/tdee">TDEE Guide</a></li>
            <li><a href="/nutrition">Nutrition Basics</a></li>
            <li><a href="/faq">FAQ</a></li>
          </ul>
        </div>

        {/* Social / Newsletter */}
        <div className="footer-social">
          <h4>Stay Connected</h4>
          <div className="social-icons">
            <a href="#"><i className="fab fa-facebook"></i></a>
            <a href="#"><i className="fab fa-instagram"></i></a>
            <a href="#"><i className="fab fa-twitter"></i></a>
          </div>
          <form className="newsletter">
            <input type="email" placeholder="Your email" />
            <button type="submit">Subscribe</button>
          </form>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} NOMU. All rights reserved.</p>
      </div>
    </footer>
  );
}