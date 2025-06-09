// GardeningInterface Component
// Path: src/frontend/components/browse/GardeningInterface.jsx
// Purpose: Browse profiles and send seeds

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './GardeningInterface.css';

const GardeningInterface = () => {
  const [profiles, setProfiles] = useState([]);
  const [currentProfileIndex, setCurrentProfileIndex] = useState(0);
  const [seedsRemaining, setSeedsRemaining] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Fetch profiles on component mount
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
          
          // Show success message (you can make this prettier)
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
          <button onClick={() => navigate('/')}>Go Back</button>
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

      {/* Profile Card */}
      <div className="profile-card">
        {/* Photo Section */}
        <div className="photo-section">
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
          <div className="photo-navigation">
            <span className="photo-indicator">
              1 / {profile.photos?.length || 1}
            </span>
          </div>
          <div className="profile-badges">
            <span className="personality-badge">{profile.personalityType}</span>
            <span className="active-badge">{profile.lastActive}</span>
          </div>
        </div>

        {/* Info Section */}
        <div className="info-section">
          <div className="profile-header">
            <h2 className="profile-name">{profile.username}, {profile.age}</h2>
            <p className="profile-location">{profile.location}</p>
          </div>

          <div className="profile-details">
            <div className="detail-row">
              <span className="detail-label">Height:</span>
              <span className="detail-value">{profile.height}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Body Type:</span>
              <span className="detail-value">{profile.bodyType}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Location:</span>
              <span className="detail-value">{profile.location}</span>
            </div>
          </div>

          <div className="profile-bio">
            <p>{profile.bio}</p>
          </div>

          {profile.interests && profile.interests.length > 0 && (
            <div className="interests-section">
              <h3 className="interests-title">Interests</h3>
              <div className="interests-grid">
                {profile.interests.map((interest, index) => (
                  <span key={index} className="interest-tag">
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Prompts Section */}
          {profile.prompts && profile.prompts.filter(p => p.answer).length > 0 && (
            <div className="prompts-section">
              <h3 className="prompts-title">Get to know me</h3>
              {profile.prompts.filter(p => p.answer).map((prompt, index) => (
                <div key={index} className="prompt-item">
                  <p className="prompt-question">{prompt.question}</p>
                  <p className="prompt-answer">{prompt.answer}</p>
                </div>
              ))}
            </div>
          )}
        </div>
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