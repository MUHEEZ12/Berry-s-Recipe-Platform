import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FiMail, FiPhone, FiMapPin, FiFacebook, FiTwitter, FiInstagram, FiLinkedin } from "react-icons/fi";
import "./Footer.css";

function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleNewsletterSignup = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Please enter a valid email");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/newsletter/subscribe`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to subscribe");
        return;
      }

      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 4000);
    } catch (err) {
      setError("Failed to subscribe. Please try again.");
      console.error("Newsletter error:", err);
    } finally {
      setLoading(false);
    }
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        {/* About Section */}
        <div className="footer-section">
          <h3 className="footer-title">🍓 BerryRecipes</h3>
          <p className="footer-description">
            Discover, create, and share your favorite recipes with a vibrant community of food lovers.
          </p>
          <div className="footer-contact">
            <p>
              <FiPhone size={16} />
              <span>+234 (903) 279-2049</span>
            </p>
            <p>
              <FiMail size={16} />
              <span>berrytech12@gmail.com</span>
            </p>
            <p>
              <FiMapPin size={16} />
              <span>San Francisco, CA</span>
            </p>
          </div>
        </div>

        {/* Quick Links */}
        <div className="footer-section">
          <h4 className="footer-heading">Quick Links</h4>
          <ul className="footer-links">
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/recipes">Recipes</Link>
            </li>
            <li>
              <Link to="/about">About Us</Link>
            </li>
            <li>
              <Link to="/contact">Contact</Link>
            </li>
            <li>
              <Link to="/profile">My Profile</Link>
            </li>
          </ul>
        </div>

        {/* Categories */}
        <div className="footer-section">
          <h4 className="footer-heading">Categories</h4>
          <ul className="footer-links">
            <li><a href="#pasta">🍝 Pasta</a></li>
            <li><a href="#dessert">🍰 Dessert</a></li>
            <li><a href="#fastfood">🍔 Fast Food</a></li>
            <li><a href="#salad">🥗 Salad</a></li>
            <li><a href="#breakfast">🥞 Breakfast</a></li>
          </ul>
        </div>

        {/* Newsletter */}
        <div className="footer-section">
          <h4 className="footer-heading">Newsletter</h4>
          <p className="footer-text">Get weekly recipe ideas and cooking tips delivered to your inbox!</p>
          <form className="newsletter-form" onSubmit={handleNewsletterSignup}>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
              disabled={loading}
              required
            />
            <button type="submit" className="subscribe-btn" disabled={loading}>
              {loading ? "Subscribing..." : "Subscribe"}
            </button>
          </form>
          {error && (
            <p className="subscribe-error">✗ {error}</p>
          )}
          {subscribed && (
            <p className="subscribe-success">✓ Thanks for subscribing!</p>
          )}
        </div>
      </div>

      {/* Social Links & Copyright */}
      <div className="footer-bottom">
        <div className="social-links">
          <a href="#facebook" className="social-icon" title="Facebook">
            <FiFacebook size={20} />
          </a>
          <a href="#twitter" className="social-icon" title="Twitter">
            <FiTwitter size={20} />
          </a>
          <a href="#instagram" className="social-icon" title="Instagram">
            <FiInstagram size={20} />
          </a>
          <a href="#linkedin" className="social-icon" title="LinkedIn">
            <FiLinkedin size={20} />
          </a>
        </div>

        <div className="footer-divider"></div>

        <div className="footer-legal">
          <p className="copyright">&copy; {currentYear} BerryRecipes. All rights reserved.</p>
          <div className="legal-links">
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
