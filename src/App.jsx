// App Component
// Path: src/App.jsx
// Purpose: Main application component with routing

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Header from './frontend/components/Header';
import HowItWorks from './frontend/components/HowItWorks';
import CurrentMembers from './frontend/components/CurrentMembers';
import SignupModal from './frontend/components/SignupModal';
import LoginModal from './frontend/components/LoginModal';
import Profile from './frontend/components/profile/profile';
import ProfileView from './frontend/components/profile/ProfileView';
import GardeningInterface from './frontend/components/browse/GardeningInterface';
import Garden from './frontend/components/garden/Garden';
import MockProfilesManager from './frontend/components/admin/MockProfilesManager';

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/" />;
};

// Landing Page component
const LandingPage = ({ onSignupClick }) => (
  <>
    <section className="hero" id="hero">
      <div className="container">
        <h2 className="hero-title">
          Dating at your own pace,<br />
          blooming in your own time
        </h2>
        <p className="hero-subtitle text-muted">
          A gentle space for introverts to make meaningful connections
        </p>
        <button 
          className="btn btn-primary" 
          onClick={onSignupClick}
        >
          Start Your Garden
        </button>
      </div>
    </section>
    
    <div id="how-it-works">
      <HowItWorks onStartPlanting={onSignupClick} />
    </div>
    
    <div id="current-members">
      <CurrentMembers onSignupClick={onSignupClick} />
    </div>
  </>
);

function App() {
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    window.location.href = '/';
  };

  return (
    <Router>
      <div className="App">
        <Header 
          onSignupClick={() => setShowSignupModal(true)}
          onLoginClick={() => setShowLoginModal(true)}
          isLoggedIn={isLoggedIn}
          onLogout={handleLogout}
        />
        
        <main className="main-content">
          <Routes>
            <Route path="/" element={
              <LandingPage onSignupClick={() => setShowSignupModal(true)} />
            } />
            
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            
            <Route path="/profile/:userId" element={
              <ProtectedRoute>
                <ProfileView />
              </ProtectedRoute>
            } />
            
            <Route path="/browse" element={
              <ProtectedRoute>
                <GardeningInterface />
              </ProtectedRoute>
            } />
            
            <Route path="/garden" element={
              <ProtectedRoute>
                <Garden />
              </ProtectedRoute>
            } />
            
            <Route path="/admin/mock-profiles" element={
              <ProtectedRoute>
                <MockProfilesManager />
              </ProtectedRoute>
            } />
          </Routes>
        </main>
        
        <SignupModal 
          isOpen={showSignupModal} 
          onClose={() => setShowSignupModal(false)} 
        />
        
        <LoginModal 
          isOpen={showLoginModal} 
          onClose={() => setShowLoginModal(false)} 
        />
      </div>
    </Router>
  );
}

export default App;