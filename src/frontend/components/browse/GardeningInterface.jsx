// GardeningInterface Component
// Path: src/frontend/components/browse/GardeningInterface.jsx
// Purpose: Browse profiles with full-screen swipe interface

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './GardeningInterface.css';

const GardeningInterface = () => {
  const [profiles, setProfiles] = useState([]);
  const [currentProfileIndex, setCurrentProfileIndex] = useState(0);
  const [seedsRemaining, setSeedsRemaining] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragCurrent, setDragCurrent] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const navigate = useNavigate();
  const cardRef = useRef(null);

  // Swipe thresholds - adjusted for better mobile experience
  const swipeThreshold = window.innerWidth * 0.25; // 25% of screen width
  const rotationMultiplier = 0.15;
  const tapThreshold = 10; // Increased for better tap detection

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/');
        return;
      }

      const response = await fetch('/api/match/browse', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setProfiles(data.profiles);
        setSeedsRemaining(data.seedsRemaining);
        setLoading(false);
      } else {
        setError(data.message);
        setLoading(false);
      }
    } catch (error) {
      console.error('Fetch profiles error:', error);
      setError('Failed to load profiles');
      setLoading(false);
    }
  };

  // Handle drag/swipe start
  const handleDragStart = (e) => {
    e.preventDefault();
    const startX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
    const startY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;
    
    setDragStart({ x: startX, y: startY });
    setDragCurrent({ x: startX, y: startY });
    setIsDragging(true);
  };

  // Handle drag/swipe move
  const handleDragMove = (e) => {
    if (!isDragging) return;
    
    const currentX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
    const currentY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;
    
    setDragCurrent({ x: currentX, y: currentY });
    
    // Apply transform to card
    if (cardRef.current) {
      const deltaX = currentX - dragStart.x;
      const rotation = deltaX * rotationMultiplier;
      const opacity = 1 - Math.abs(deltaX) / (window.innerWidth * 0.5);
      
      cardRef.current.style.transform = `translateX(${deltaX}px) rotate(${rotation}deg)`;
      cardRef.current.style.opacity = Math.max(0.2, opacity);
    }
  };

  // Handle drag/swipe end
  const handleDragEnd = () => {
    if (!isDragging) return;
    
    const deltaX = dragCurrent.x - dragStart.x;
    const deltaY = Math.abs(dragCurrent.y - dragStart.y);
    
    // Ignore if too much vertical movement (scrolling)
    if (deltaY > 50) {
      resetCardPosition();
      return;
    }
    
    const isSwipeRight = deltaX > swipeThreshold;
    const isSwipeLeft = deltaX < -swipeThreshold;
    
    if (cardRef.current) {
      if (isSwipeLeft) {
        // Pass
        cardRef.current.classList.add('swipe-left');
        setTimeout(() => {
          handlePass();
          resetCardPosition();
        }, 300);
      } else if (isSwipeRight) {
        // Plant seed
        cardRef.current.classList.add('swipe-right');
        setTimeout(() => {
          handlePlantSeed();
          resetCardPosition();
        }, 300);
      } else {
        resetCardPosition();
      }
    }
    
    setIsDragging(false);
    setDragStart({ x: 0, y: 0 });
    setDragCurrent({ x: 0, y: 0 });
  };

  const resetCardPosition = () => {
    if (cardRef.current) {
      cardRef.current.style.transform = '';
      cardRef.current.style.opacity = '';
      cardRef.current.classList.remove('swipe-left', 'swipe-right');
    }
  };

  const handlePlantSeed = async (e) => {
    if (e) e.stopPropagation();
    
    if (seedsRemaining > 0 && profiles[currentProfileIndex]) {
      try {
        const token = localStorage.getItem('token');
        const currentProfile = profiles[currentProfileIndex];

        const response = await fetch('/api/match/send-seed', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            recipientId: currentProfile.id
          })
        });

        const data = await response.json();

        if (data.success) {
          setSeedsRemaining(data.seedsRemaining);
          moveToNextProfile();
        } else {
          alert(data.message);
        }
      } catch (error) {
        console.error('Send seed error:', error);
        alert('Failed to send seed');
      }
    } else if (seedsRemaining === 0) {
      alert('You\'re out of seeds! Visit your profile to get more.');
    }
  };

  const handlePass = async (e) => {
    if (e) e.stopPropagation();
    
    if (profiles[currentProfileIndex]) {
      try {
        const token = localStorage.getItem('token');
        const currentProfile = profiles[currentProfileIndex];

        await fetch('/api/match/pass', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            profileId: currentProfile.id
          })
        });

        moveToNextProfile();
      } catch (error) {
        console.error('Pass profile error:', error);
      }
    }
  };

  const handleMaybeLater = (e) => {
    if (e) e.stopPropagation();
    moveToNextProfile();
  };

  const moveToNextProfile = () => {
    if (currentProfileIndex < profiles.length - 1) {
      setCurrentProfileIndex(prev => prev + 1);
    } else {
      setProfiles([]);
    }
  };

  // Handle profile card click/tap
  const handleProfileClick = (e) => {
    const moveDistance = Math.abs(dragCurrent.x - dragStart.x) + Math.abs(dragCurrent.y - dragStart.y);
    
    if (!isDragging && moveDistance < tapThreshold) {
      e.stopPropagation();
      const currentProfile = profiles[currentProfileIndex];
      if (currentProfile && currentProfile.id) {
        navigate(`/profile/${currentProfile.id}`);
      }
    }
  };

  if (loading) {
    return (
      <div className="gardening-container">
        <div className="loading-message">
          <p>Finding your perfect garden matches...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="gardening-container">
        <div className="error-message">
          <p>{error}</p>
          <button className="btn-primary" onClick={() => navigate('/')}>
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (profiles.length === 0 || !profiles[currentProfileIndex]) {
    return (
      <div className="gardening-container">
        <div className="no-profiles-message">
          <h2>No more profiles to browse!</h2>
          <p>Check back later for new members or browse your matches in your garden.</p>
          <button className="btn-primary" onClick={() => navigate('/garden')}>
            Visit My Garden
          </button>
        </div>
      </div>
    );
  }

  const profile = profiles[currentProfileIndex];

  return (
    <div className="gardening-container">
      {/* Profile Stack */}
      <div className="profile-stack">
        {/* Current Profile Card */}
        <div 
          className={`profile-card-simple ${isDragging ? 'dragging' : ''}`}
          ref={cardRef}
          onClick={handleProfileClick}
          onMouseDown={handleDragStart}
          onMouseMove={handleDragMove}
          onMouseUp={handleDragEnd}
          onMouseLeave={handleDragEnd}
          onTouchStart={handleDragStart}
          onTouchMove={handleDragMove}
          onTouchEnd={handleDragEnd}
        >
          <div className="photo-container">
            {profile.photos && profile.photos.length > 0 ? (
              <>
                <img 
                  src={profile.photos[0].url || profile.photos[0]} 
                  alt={profile.username}
                  className="profile-photo"
                  draggable="false"
                />
                <div className="photo-overlay" />
              </>
            ) : (
              <div className="no-photo">
                <span>🌸</span>
                <p>No photo yet</p>
              </div>
            )}
            
            {/* Photo navigation indicator */}
            {profile.photos && profile.photos.length > 1 && (
              <div className="photo-navigation">
                <span className="photo-indicator">
                  1 / {profile.photos.length}
                </span>
              </div>
            )}
            
            {/* Recently active badge */}
            <div className="profile-badges">
              <span className="active-badge">● Active recently</span>
            </div>
            
            {/* Profile info overlay */}
            <div className="profile-info-overlay">
              <h2 className="profile-username">{profile.username}</h2>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="action-buttons">
            <button 
              className="action-btn pass-btn" 
              onClick={handlePass}
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              title="Pass"
            >
              <span className="btn-icon">🍂</span>
              <span className="btn-text">Pass</span>
            </button>
            
            <button 
              className="action-btn plant-btn" 
              onClick={handlePlantSeed}
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              disabled={seedsRemaining === 0}
              title="Plant a seed"
            >
              <span className="btn-icon">🌱</span>
              <span className="btn-text">Seed</span>
            </button>
            
            <button 
              className="action-btn save-btn"
              onClick={handleMaybeLater}
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              title="Maybe later"
            >
              <span className="btn-icon">🌙</span>
              <span className="btn-text">Later</span>
            </button>
          </div>
        </div>

        {/* Preview of next profiles */}
        {profiles[currentProfileIndex + 1] && (
          <div className="profile-card-simple" style={{ pointerEvents: 'none' }}>
            <div className="photo-container">
              {profiles[currentProfileIndex + 1].photos?.[0] && (
                <>
                  <img 
                    src={profiles[currentProfileIndex + 1].photos[0].url || profiles[currentProfileIndex + 1].photos[0]} 
                    alt="Next profile"
                    className="profile-photo"
                  />
                  <div className="photo-overlay" />
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Out of seeds message */}
      {seedsRemaining === 0 && (
        <div className="out-of-seeds-overlay">
          <p>You're out of seeds!</p>
          <button className="cta-btn" onClick={() => navigate('/profile')}>
            Get More Seeds
          </button>
        </div>
      )}
    </div>
  );
};

export default GardeningInterface;