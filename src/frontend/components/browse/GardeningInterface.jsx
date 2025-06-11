// GardeningInterface Component
// Path: src/frontend/components/browse/GardeningInterface.jsx
// Purpose: Browse profiles and send seeds with swipe navigation

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './GardeningInterface.css';

const GardeningInterface = () => {
  const [profiles, setProfiles] = useState([]);
  const [currentProfileIndex, setCurrentProfileIndex] = useState(0);
  const [seedsRemaining, setSeedsRemaining] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [swiping, setSwiping] = useState(false);
  const navigate = useNavigate();
  const cardRef = useRef(null);

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50;

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

  const onTouchStart = (e) => {
    setTouchEnd(0);
    setTouchStart(e.targetTouches[0].clientX);
    setSwiping(true);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && currentProfileIndex < profiles.length - 1) {
      setCurrentProfileIndex(prev => prev + 1);
    }
    if (isRightSwipe && currentProfileIndex > 0) {
      setCurrentProfileIndex(prev => prev - 1);
    }
    
    setSwiping(false);
  };

  const handlePlantSeed = async () => {
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
          
          // Show success message
          alert(`Seed sent to ${currentProfile.username}! 🌱`);
          
          // Move to next profile
          setTimeout(() => {
            if (currentProfileIndex < profiles.length - 1) {
              setCurrentProfileIndex(prev => prev + 1);
            } else {
              // No more profiles
              setProfiles([]);
            }
          }, 500);
        } else {
          alert(data.message);
        }
      } catch (error) {
        console.error('Send seed error:', error);
        alert('Failed to send seed');
      }
    }
  };

  const handlePass = async () => {
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

        // Move to next profile
        if (currentProfileIndex < profiles.length - 1) {
          setCurrentProfileIndex(prev => prev + 1);
        } else {
          // No more profiles
          setProfiles([]);
        }
      } catch (error) {
        console.error('Pass profile error:', error);
      }
    }
  };

  const handleMaybeLater = () => {
    // Move to next profile without any action
    if (currentProfileIndex < profiles.length - 1) {
      setCurrentProfileIndex(prev => prev + 1);
    } else {
      setProfiles([]);
    }
  };

  const viewFullProfile = () => {
    if (profiles[currentProfileIndex]) {
      // For now, just show an alert since the profile detail page isn't built yet
      alert('Full profile view coming soon! 🌸');
      // In the future: navigate(`/profile/${profiles[currentProfileIndex].id}`);
    }
  };

  if (loading) {
    return (
      <div className="gardening-container">
        <div className="loading-message">
          <p>Finding your perfect garden matches... 🌸</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="gardening-container">
        <div className="error-message">
          <p>{error}</p>
          <button className="btn-primary" onClick={() => navigate('/')}>Go Back</button>
        </div>
      </div>
    );
  }

  if (profiles.length === 0 || !profiles[currentProfileIndex]) {
    return (
      <div className="gardening-container">
        <div className="no-profiles-message">
          <h2>No more profiles to browse! 🌻</h2>
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
      {/* Seeds Counter */}
      <div className="seeds-counter">
        <span className="seeds-icon">🌱</span>
        <span className="seeds-text">{seedsRemaining} seeds remaining</span>
        <button className="get-seeds-btn">Get More Seeds</button>
      </div>

      {/* Profile Card - Simplified */}
      <div 
        className="profile-card-simple"
        ref={cardRef}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div className="photo-container" onClick={viewFullProfile}>
          {profile.photos && profile.photos.length > 0 ? (
            <img 
              src={profile.photos[0].url || profile.photos[0]} 
              alt={profile.username}
              className="profile-photo"
            />
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
            <span className="active-badge">Recently active</span>
          </div>
          
          {/* Tap to view profile hint */}
          <div className="view-profile-hint">
            <span>Tap to view full profile</span>
          </div>
        </div>
      </div>

      {/* Profile Info Summary */}
      <div className="profile-summary">
        <h2>{profile.username}, {profile.age}</h2>
        <p>{profile.location}</p>
      </div>

      {/* Action Buttons */}
      <div className="action-buttons">
        <button 
          className="action-btn pass-btn" 
          onClick={handlePass}
          title="Pass for now"
        >
          <span className="btn-icon">🍂</span>
          <span className="btn-text">Pass</span>
        </button>
        
        <button 
          className="action-btn plant-btn" 
          onClick={handlePlantSeed}
          disabled={seedsRemaining === 0}
          title="Plant a seed"
        >
          <span className="btn-icon">🌱</span>
          <span className="btn-text">Plant Seed</span>
        </button>
        
        <button 
          className="action-btn save-btn"
          onClick={handleMaybeLater}
          title="Save for later"
        >
          <span className="btn-icon">🌙</span>
          <span className="btn-text">Maybe Later</span>
        </button>
      </div>

      {/* Out of seeds message */}
      {seedsRemaining === 0 && (
        <div className="out-of-seeds-message">
          <p>You're out of seeds! 🌱</p>
          <p>Get more seeds to continue connecting with amazing people.</p>
          <button className="cta-btn">View Seed Packages</button>
        </div>
      )}
    </div>
  );
};

export default GardeningInterface;