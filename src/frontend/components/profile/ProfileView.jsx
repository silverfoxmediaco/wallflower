// ProfileView Component
// Path: src/frontend/components/profile/ProfileView.jsx
// Purpose: View another user's profile with flexible photo display

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './ProfileView.css';

const ProfileView = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [seedSent, setSeedSent] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, [userId]);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setProfile(data.user);
        setSeedSent(data.seedSent || false);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setLoading(false);
    }
  };

  const handleSendSeed = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/match/send-seed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ recipientId: userId })
      });

      const data = await response.json();
      if (data.success) {
        setSeedSent(true);
        alert('Seed sent! 🌱');
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Error sending seed:', error);
      alert('Failed to send seed');
    }
  };

  const nextPhoto = () => {
    if (profile?.profile?.photos?.length > 1) {
      setCurrentPhotoIndex((prev) => 
        prev === profile.profile.photos.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevPhoto = () => {
    if (profile?.profile?.photos?.length > 1) {
      setCurrentPhotoIndex((prev) => 
        prev === 0 ? profile.profile.photos.length - 1 : prev - 1
      );
    }
  };

  if (loading) {
    return (
      <div className="profile-view-container">
        <div className="loading">Loading profile... 🌸</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="profile-view-container">
        <div className="error">Profile not found</div>
        <button onClick={() => navigate('/garden')}>Back to Garden</button>
      </div>
    );
  }

  // Get current photo and its display mode
  const currentPhoto = profile.profile?.photos?.[currentPhotoIndex];
  const displayMode = currentPhoto?.displayMode || 'contain';

  return (
    <div className="profile-view-container">
      <button className="back-button" onClick={() => navigate(-1)}>
        ← Back
      </button>

      <div className="profile-view-card">
        {/* Photo Section */}
        <div className={`photo-section ${displayMode}`}>
          {currentPhoto ? (
            <>
              <img 
                src={currentPhoto.url} 
                alt={profile.username}
                className={`profile-photo ${displayMode}`}
              />
              {profile.profile.photos.length > 1 && (
                <>
                  <button className="photo-nav prev" onClick={prevPhoto}>‹</button>
                  <button className="photo-nav next" onClick={nextPhoto}>›</button>
                  <div className="photo-indicators">
                    {profile.profile.photos.map((_, index) => (
                      <span 
                        key={index} 
                        className={`indicator ${index === currentPhotoIndex ? 'active' : ''}`}
                        onClick={() => setCurrentPhotoIndex(index)}
                      />
                    ))}
                  </div>
                </>
              )}
              {/* Display mode indicator */}
              <div className="display-mode-indicator">
                {displayMode === 'cover' ? '🖼️ Fill' : '📸 Fit'}
              </div>
            </>
          ) : (
            <div className="no-photo-large">
              <span>🌸</span>
              <p>No photos yet</p>
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="info-section">
          <div className="profile-header">
            <h1>{profile.username}, {profile.profile?.age || '??'}</h1>
            <p className="location">{profile.profile?.location || 'Location not set'}</p>
            
            {profile.profile?.personalityType && (
              <span className="personality-badge">
                {profile.profile.personalityType}
              </span>
            )}
          </div>

          <div className="profile-details">
            {profile.profile?.height && (
              <div className="detail">
                <span className="label">Height:</span>
                <span className="value">{profile.profile.height}</span>
              </div>
            )}
            {profile.profile?.bodyType && (
              <div className="detail">
                <span className="label">Body Type:</span>
                <span className="value">{profile.profile.bodyType}</span>
              </div>
            )}
            {profile.profile?.lookingFor && (
              <div className="detail">
                <span className="label">Looking for:</span>
                <span className="value">{profile.profile.lookingFor}</span>
              </div>
            )}
          </div>

          {profile.profile?.bio && (
            <div className="bio-section">
              <h3>About Me</h3>
              <p>{profile.profile.bio}</p>
            </div>
          )}

          {profile.profile?.interests?.length > 0 && (
            <div className="interests-section">
              <h3>Interests</h3>
              <div className="interests-grid">
                {profile.profile.interests.map((interest, index) => (
                  <span key={index} className="interest-tag">
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          )}

          {profile.profile?.prompts?.filter(p => p.answer).length > 0 && (
            <div className="prompts-section">
              <h3>Get to know me</h3>
              {profile.profile.prompts.filter(p => p.answer).map((prompt, index) => (
                <div key={index} className="prompt-item">
                  <p className="prompt-question">{prompt.question}</p>
                  <p className="prompt-answer">{prompt.answer}</p>
                </div>
              ))}
            </div>
          )}

          {/* Action Buttons */}
          <div className="profile-actions">
            {!seedSent ? (
              <button className="send-seed-button" onClick={handleSendSeed}>
                Plant a Seed 🌱
              </button>
            ) : (
              <button className="seed-sent-button" disabled>
                Seed Sent ✓
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileView;