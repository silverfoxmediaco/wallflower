import React, { useState } from 'react';
import './App.css';
import Header from './frontend/components/Header';
import HowItWorks from './frontend/components/HowItWorks';
import SignupModal from './frontend/components/SignUpModal';

function App() {
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false); // Add login modal state

  return (
    <div className="App">
      <Header 
        onSignupClick={() => setShowSignupModal(true)}
        onLoginClick={() => setShowLoginModal(true)}
      />
      
      <main className="main-content">
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
              onClick={() => setShowSignupModal(true)}
            >
              Start Your Garden
            </button>
          </div>
        </section>
        
        <div id="how-it-works">
          <HowItWorks onStartPlanting={() => setShowSignupModal(true)} />
        </div>
      </main>
      
      <SignupModal 
        isOpen={showSignupModal} 
        onClose={() => setShowSignupModal(false)} 
      />
      
      {/* Add LoginModal when you create it */}
    </div>
  );
}

export default App;