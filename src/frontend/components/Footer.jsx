// Footer Component
// Path: src/frontend/components/Footer.jsx
// Purpose: Site footer with links and information

import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';
import wallflowerLogo from '../assets/images/wfviolatelogo.png';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <div className="footer-logo">
          <img 
              src={wallflowerLogo} 
              alt="Wallflower" 
              className="footer-logo-image"
            />
            <p className="footer-tagline">
              A gentle space for meaningful connections
            </p>
          </div>
        </div>

        <div className="footer-section">
          <h4 className="footer-heading">Company</h4>
          <ul className="footer-links">
            <li><Link to="/about">About Us</Link></li>
            <li><Link to="/how-it-works">How It Works</Link></li>
            <li><Link to="/success-stories">Success Stories</Link></li>
            <li><Link to="/blog">Blog</Link></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4 className="footer-heading">Support</h4>
          <ul className="footer-links">
            <li><Link to="/help">Help Center</Link></li>
            <li><Link to="/safety">Safety Tips</Link></li>
            <li><Link to="/community-guidelines">Community Guidelines</Link></li>
            <li><Link to="/contact">Contact Us</Link></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4 className="footer-heading">Legal</h4>
          <ul className="footer-links">
            <li><Link to="/privacy">Privacy Policy</Link></li>
            <li><Link to="/terms">Terms of Service</Link></li>
            <li><Link to="/cookie-policy">Cookie Policy</Link></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4 className="footer-heading">Connect</h4>
          <div className="social-links">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <span className="social-icon">📷</span>
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
              <span className="social-icon">🐦</span>
            </a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <span className="social-icon">📘</span>
            </a>
          </div>
          <div className="newsletter">
            <p className="newsletter-text">Get dating tips for introverts</p>
            <form className="newsletter-form">
              <input 
                type="email" 
                placeholder="Your email" 
                className="newsletter-input"
                aria-label="Email for newsletter"
              />
              <button type="submit" className="newsletter-btn">
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p className="copyright">
          © {currentYear} Wallflower. All rights reserved. Made with 🌸 for introverts everywhere.
        </p>
      </div>
    </footer>
  );
};

export default Footer;