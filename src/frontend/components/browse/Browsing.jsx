// Browsing Component
// Path: src/frontend/components/browse/Browsing.jsx
// Purpose: Browse all profiles in a responsive grid layout

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../Footer';
import './Browsing.css';

const Browsing = () => {
  const [profiles, setProfiles] = useState([]);
  const [seedsRemaining, setSeedsRemaining] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sentSeeds, setSentSeeds] = useState(new Set());
  const navigate = useNavigate();

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

      const response = await fetch('/api/profile/all', {
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

  const handlePlantSeed = async (profileId) => {
    if (seedsRemaining === 0) {
      alert('You\'re out of seeds! Visit your profile to get more.');
      return;
    }

    if (sentSeeds.has(profileId)) {
      alert('You\'ve already sent a seed to this person.');
      return;
    }

    try {
      const token = localStorage.getItem('token');

      const response = await fetch('/api/match/send-seed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          recipientId: profileId
        })
      });

      const data = await response.json();

      if (data.success) {
        setSeedsRemaining(data.seedsRemaining);
        setSentSeeds(prev => new Set([...prev, profileId]));
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Send seed error:', error);
      alert('Failed to send seed');
    }
  };

  const handleProfileClick = (profileId) => {
    navigate(`/profile/${profileId}`);
  };

  if (loading) {
    return (
      <div className="browsing-container">
        <div className="loading-message">
          <p>Finding your perfect garden matches...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="browsing-container">
        <div className="error-message">
          <p>{error}</p>
          <button className="btn-primary" onClick={() => navigate('/')}>Go Back</button>
        </div>
      </div>
    );
  }

  if (profiles.length === 0) {
    return (
      <div className="browsing-container">
        <div className="no-profiles-message">
          <h2>No profiles available</h2>
          <p>Check back later for new members.</p>
          <button className="btn-primary" onClick={() => navigate('/garden')}>Visit My Garden</button>
        </div>
      </div>
    );
  }

  return (
    <div className="browsing-page-container">
      <div className="browsing-container">
        <div className="profiles-grid">
          {profiles.map((profile) => (
            <div key={profile.id} className="profile-card-browse">
              <div
                className="profile-image-container"
                onClick={() => handleProfileClick(profile.id)}
                style={{
                  backgroundImage: profile.photos && profile.photos.length > 0 
                    ? `url(${profile.photos[0].url || profile.photos[0]})`
                    : 'none',
                  backgroundColor: profile.photos && profile.photos.length > 0 
                    ? 'transparent' 
                    : '#C8A2C8'
                }}
              >
                <div className="profile-gradient-overlay">
                  {(!profile.photos || profile.photos.length === 0) && (
                    <div className="no-photo-placeholder">
                      <span>🌸</span>
                      <p>No photo yet</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="profile-info-bottom">
                <h3 className="profile-name">{profile.username}, {profile.age || '??'}</h3>
                <p className="profile-location">{profile.location || 'Location not set'}</p>

                <button 
                  className={`seed-btn ${sentSeeds.has(profile.id) ? 'seed-sent' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePlantSeed(profile.id);
                  }}
                  disabled={seedsRemaining === 0 || sentSeeds.has(profile.id)}
                >
                  {sentSeeds.has(profile.id) ? (
                    <><span className="btn-icon">✓</span><span>Seed Sent</span></>
                  ) : (
                    <><span className="btn-icon">🌱</span><span>Send Seed</span></>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        {seedsRemaining === 0 && (
          <div className="out-of-seeds-overlay">
            <p>You're out of seeds!</p>
            <button className="cta-btn" onClick={() => navigate('/profile')}>Get More Seeds</button>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Browsing;
