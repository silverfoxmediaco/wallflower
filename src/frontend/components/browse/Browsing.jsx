// Browsing Component
// Path: src/frontend/components/browse/Browsing.jsx
// Purpose: Browse profiles with vertical scroll interface

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './Browsing.css';

const Browsing = () => {
  const [profiles, setProfiles] = useState([]);
  const [seedsRemaining, setSeedsRemaining] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sentSeeds, setSentSeeds] = useState(new Set());
  const [visibleProfiles, setVisibleProfiles] = useState([]);
  const [currentViewIndex, setCurrentViewIndex] = useState(0);
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const observerRef = useRef(null);

  useEffect(() => {
    fetchProfiles();
  }, []);

  useEffect(() => {
    // Initialize visible profiles when profiles are loaded
    if (profiles.length > 0) {
      setVisibleProfiles(profiles.slice(0, 5)); // Start with first 5 profiles
    }
  }, [profiles]);

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

  // Intersection Observer for tracking which profile is in view
  useEffect(() => {
    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 0.5
    };

    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const index = parseInt(entry.target.dataset.index);
          setCurrentViewIndex(index);
        }
      });
    }, options);

    // Observe all profile cards
    const profileCards = document.querySelectorAll('.profile-card-scroll');
    profileCards.forEach(card => {
      observerRef.current.observe(card);
    });

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [visibleProfiles]);

  // Load more profiles when user scrolls near bottom
  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    
    // Load more when user is 80% down the page
    if (scrollTop + clientHeight >= scrollHeight * 0.8) {
      loadMoreProfiles();
    }
  }, [visibleProfiles.length, profiles.length]);

  const loadMoreProfiles = () => {
    if (visibleProfiles.length < profiles.length) {
      const nextBatch = profiles.slice(visibleProfiles.length, visibleProfiles.length + 3);
      setVisibleProfiles(prev => [...prev, ...nextBatch]);
    }
  };

  const handlePlantSeed = async (profileId, index) => {
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
        
        // Smooth scroll to next profile
        const nextCard = document.querySelector(`[data-index="${index + 1}"]`);
        if (nextCard) {
          nextCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
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

  const scrollToTop = () => {
    if (containerRef.current) {
      containerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
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
          <button className="btn-primary" onClick={() => navigate('/')}>
            Go Back
          </button>
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
          <button className="btn-primary" onClick={() => navigate('/garden')}>
            Visit My Garden
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="browsing-container">
      {/* Header with seed count */}
      <div className="browsing-header">
        <div className="seeds-counter">
          <span className="seed-icon">🌱</span>
          <span className="seed-count">{seedsRemaining} seeds</span>
        </div>
        <button className="garden-link" onClick={() => navigate('/garden')}>
          My Garden
        </button>
      </div>

      {/* Scrollable profiles container */}
      <div 
        className="profiles-scroll-container" 
        ref={containerRef}
        onScroll={handleScroll}
      >
        {visibleProfiles.map((profile, index) => (
          <div 
            key={profile.id} 
            className="profile-card-scroll"
            data-index={index}
          >
            {/* Profile image section */}
            <div 
              className="profile-image-section"
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
              {/* Gradient overlay */}
              <div className="profile-gradient-overlay">
                {/* Top badges */}
                <div className="profile-badges">
                  <span className="active-badge">● Active recently</span>
                  {profile.photos && profile.photos.length > 1 && (
                    <span className="photo-count">
                      1 / {profile.photos.length}
                    </span>
                  )}
                </div>

                {/* No photo placeholder */}
                {(!profile.photos || profile.photos.length === 0) && (
                  <div className="no-photo-placeholder">
                    <span>🌸</span>
                    <p>No photo yet</p>
                  </div>
                )}
              </div>
            </div>

            {/* Profile info section */}
            <div className="profile-info-section">
              <div className="profile-header-info">
                <h2 className="profile-name">
                  {profile.username}, {profile.age || '??'}
                </h2>
                <p className="profile-location">
                  {profile.location || 'Location not set'}
                </p>
              </div>

              {/* Profile details */}
              <div className="profile-details">
                {profile.bio && (
                  <p className="profile-bio">{profile.bio}</p>
                )}
                
                {profile.interests && profile.interests.length > 0 && (
                  <div className="profile-interests">
                    <h3>Interests</h3>
                    <div className="interests-tags">
                      {profile.interests.map((interest, idx) => (
                        <span key={idx} className="interest-tag">
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {profile.prompts && profile.prompts.length > 0 && (
                  <div className="profile-prompts">
                    {profile.prompts.map((prompt, idx) => (
                      <div key={idx} className="prompt-item">
                        <p className="prompt-question">{prompt.question}</p>
                        <p className="prompt-answer">{prompt.answer}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="profile-actions">
                <button 
                  className="action-btn secondary-btn"
                  onClick={() => handleProfileClick(profile.id)}
                >
                  View Full Profile
                </button>
                <button 
                  className={`action-btn primary-btn ${sentSeeds.has(profile.id) ? 'seed-sent' : ''}`}
                  onClick={() => handlePlantSeed(profile.id, index)}
                  disabled={seedsRemaining === 0 || sentSeeds.has(profile.id)}
                >
                  {sentSeeds.has(profile.id) ? (
                    <>
                      <span className="btn-icon">✓</span>
                      <span>Seed Sent</span>
                    </>
                  ) : (
                    <>
                      <span className="btn-icon">🌱</span>
                      <span>Send Seed</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Load more indicator */}
        {visibleProfiles.length < profiles.length && (
          <div className="load-more-section">
            <p>Keep scrolling to see more profiles...</p>
          </div>
        )}

        {/* End of profiles */}
        {visibleProfiles.length === profiles.length && profiles.length > 0 && (
          <div className="end-of-profiles">
            <p>You've seen all available profiles!</p>
            <button className="btn-primary" onClick={() => navigate('/garden')}>
              Check Your Garden
            </button>
          </div>
        )}
      </div>

      {/* Scroll to top button */}
      {currentViewIndex > 2 && (
        <button className="scroll-to-top" onClick={scrollToTop}>
          ↑
        </button>
      )}

      {/* Out of seeds overlay */}
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

export default Browsing;