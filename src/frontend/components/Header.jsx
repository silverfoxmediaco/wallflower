import React, { useState, useEffect } from 'react';
import './Header.css';

const Header = ({ onSignupClick, onLoginClick }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // This would come from auth context

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (e, targetId) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);
    
    if (targetId === 'login') {
      onLoginClick();
      return;
    }
    
    if (targetId === 'signup') {
      onSignupClick();
      return;
    }
    
    // Smooth scroll to section
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className={`header ${isScrolled ? 'scrolled' : ''}`}>
      <nav className="nav-container">
        <div className="nav-content">
          {/* Logo */}
          <a href="/" className="logo-link">
            <img 
              src="/assets/images/wallflowerlogotrans.png" 
              alt="Wallflower" 
              className="logo-image"
            />
            
          </a>

          {/* Desktop Navigation */}
          <div className="nav-menu desktop">
            <a 
              href="#how-it-works" 
              className="nav-link"
              onClick={(e) => handleNavClick(e, 'how-it-works')}
            >
              How it Works
            </a>
            <a 
              href="#features" 
              className="nav-link"
              onClick={(e) => handleNavClick(e, 'features')}
            >
              Features
            </a>
            <a 
              href="#about" 
              className="nav-link"
              onClick={(e) => handleNavClick(e, 'about')}
            >
              About
            </a>
            
            {!isLoggedIn ? (
              <>
                <a 
                  href="#login" 
                  className="nav-link"
                  onClick={(e) => handleNavClick(e, 'login')}
                >
                  Login
                </a>
                <button 
                  className="nav-button"
                  onClick={(e) => handleNavClick(e, 'signup')}
                >
                  Start Blooming
                </button>
              </>
            ) : (
              <>
                <a href="/garden" className="nav-link">
                  My Garden
                </a>
                <a href="/profile" className="nav-link">
                  <div className="user-avatar">
                    <img src="/api/placeholder/32/32" alt="User" />
                  </div>
                </a>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            className={`mobile-menu-btn ${isMobileMenuOpen ? 'active' : ''}`}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>

        {/* Mobile Navigation */}
        <div className={`nav-menu mobile ${isMobileMenuOpen ? 'active' : ''}`}>
          <a 
            href="#how-it-works" 
            className="nav-link"
            onClick={(e) => handleNavClick(e, 'how-it-works')}
          >
            How it Works
          </a>
          <a 
            href="#features" 
            className="nav-link"
            onClick={(e) => handleNavClick(e, 'features')}
          >
            Features
          </a>
          <a 
            href="#about" 
            className="nav-link"
            onClick={(e) => handleNavClick(e, 'about')}
          >
            About
          </a>
          
          {!isLoggedIn ? (
            <>
              <a 
                href="#login" 
                className="nav-link"
                onClick={(e) => handleNavClick(e, 'login')}
              >
                Login
              </a>
              <button 
                className="nav-button mobile"
                onClick={(e) => handleNavClick(e, 'signup')}
              >
                Start Blooming
              </button>
            </>
          ) : (
            <>
              <a href="/garden" className="nav-link">
                My Garden
              </a>
              <a href="/messages" className="nav-link">
                Messages
              </a>
              <a href="/profile" className="nav-link">
                Profile
              </a>
              <a href="/settings" className="nav-link">
                Settings
              </a>
              <button className="nav-link logout">
                Logout
              </button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;