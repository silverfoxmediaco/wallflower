import React, { useState } from 'react';
import './GardeningInterface.css';

const GardeningInterface = () => {
  const [currentProfile, setCurrentProfile] = useState(0);
  const [seedsRemaining, setSeedsRemaining] = useState(5);
  
  // Mock user data - replace with real data later
  const mockProfiles = [
    {
      id: 1,
      username: "BookwormBee",
      age: 28,
      height: "5'6\"",
      bodyType: "Average",
      location: "Austin, TX",
      distance: "5 miles away",
      bio: "Introvert who loves cozy bookstores and quiet coffee shops. Looking for someone to share comfortable silences and deep conversations with.",
      interests: ["Reading", "Creative Writing", "Indie Films", "Tea Collection", "Yoga"],
      photos: ["/api/placeholder/400/600"],
      videos: [],
      lastActive: "Active today",
      personalityType: "INFJ"
    },
    {
      id: 2,
      username: "GardenSoul",
      age: 32,
      height: "5'10\"",
      bodyType: "Fit",
      location: "Portland, OR", 
      distance: "12 miles away",
      bio: "Plant parent and sunset chaser. I find peace in my garden and joy in farmers markets. Seeking someone who appreciates life's quiet moments.",
      interests: ["Gardening", "Cooking", "Hiking", "Photography", "Meditation"],
      photos: ["/api/placeholder/400/600"],
      videos: [],
      lastActive: "Active 2 hours ago",
      personalityType: "ISFP"
    }
  ];

  const profile = mockProfiles[currentProfile];

  const handlePlantSeed = () => {
    if (seedsRemaining > 0) {
      setSeedsRemaining(seedsRemaining - 1);
      // Add animation and move to next profile
      setTimeout(() => {
        setCurrentProfile((prev) => (prev + 1) % mockProfiles.length);
      }, 500);
    }
  };

  const handlePass = () => {
    // Move to next profile
    setCurrentProfile((prev) => (prev + 1) % mockProfiles.length);
  };

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
          <img 
            src={profile.photos[0]} 
            alt={profile.username}
            className="profile-photo"
          />
          <div className="photo-navigation">
            <span className="photo-indicator">1 / {profile.photos.length}</span>
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
            <p className="profile-location">{profile.distance}</p>
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

          {/* Media Section */}
          <div className="media-section">
            <button className="media-btn">
              📷 View All Photos ({profile.photos.length})
            </button>
            {profile.videos.length > 0 && (
              <button className="media-btn">
                🎥 View Videos ({profile.videos.length})
              </button>
            )}
          </div>
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

// Profile Creation/Edit Form Component
export const ProfileForm = () => {
  const [formData, setFormData] = useState({
    username: '',
    age: '',
    height: '',
    bodyType: '',
    location: '',
    bio: '',
    interests: [],
    personalityType: ''
  });

  const bodyTypes = ['Slim', 'Average', 'Athletic', 'Fit', 'Curvy', 'Full Figured'];
  const heightOptions = [];
  
  // Generate height options from 4'0" to 7'0"
  for (let feet = 4; feet <= 7; feet++) {
    for (let inches = 0; inches < 12; inches++) {
      if (feet === 7 && inches > 0) break;
      heightOptions.push(`${feet}'${inches}"`);
    }
  }

  const interestOptions = [
    'Reading', 'Writing', 'Art', 'Music', 'Cooking', 'Baking',
    'Gardening', 'Hiking', 'Yoga', 'Meditation', 'Photography',
    'Board Games', 'Video Games', 'Movies', 'Travel', 'Crafts',
    'Volunteering', 'Pets', 'Nature', 'Museums', 'Coffee',
    'Tea', 'Wine Tasting', 'Astronomy', 'History', 'Languages'
  ];

  return (
    <div className="profile-form">
      <h2>Create Your Garden Profile</h2>
      
      <div className="form-section">
        <label>Garden Name (Username)</label>
        <input 
          type="text" 
          placeholder="Choose a unique garden name"
          value={formData.username}
          onChange={(e) => setFormData({...formData, username: e.target.value})}
        />
      </div>

      <div className="form-row">
        <div className="form-section">
          <label>Age</label>
          <input 
            type="number" 
            min="18" 
            max="100"
            value={formData.age}
            onChange={(e) => setFormData({...formData, age: e.target.value})}
          />
        </div>

        <div className="form-section">
          <label>Height</label>
          <select 
            value={formData.height}
            onChange={(e) => setFormData({...formData, height: e.target.value})}
          >
            <option value="">Select height</option>
            {heightOptions.map(height => (
              <option key={height} value={height}>{height}</option>
            ))}
          </select>
        </div>

        <div className="form-section">
          <label>Body Type</label>
          <select 
            value={formData.bodyType}
            onChange={(e) => setFormData({...formData, bodyType: e.target.value})}
          >
            <option value="">Select body type</option>
            {bodyTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-section">
        <label>Location</label>
        <input 
          type="text" 
          placeholder="City, State"
          value={formData.location}
          onChange={(e) => setFormData({...formData, location: e.target.value})}
        />
      </div>

      <div className="form-section">
        <label>About Your Garden (Bio)</label>
        <textarea 
          rows="4"
          placeholder="Share what makes your garden unique..."
          value={formData.bio}
          onChange={(e) => setFormData({...formData, bio: e.target.value})}
        />
      </div>

      <div className="form-section">
        <label>Interests (Choose up to 10)</label>
        <div className="interests-select-grid">
          {interestOptions.map(interest => (
            <label key={interest} className="interest-checkbox">
              <input 
                type="checkbox"
                checked={formData.interests.includes(interest)}
                onChange={(e) => {
                  if (e.target.checked && formData.interests.length < 10) {
                    setFormData({...formData, interests: [...formData.interests, interest]});
                  } else if (!e.target.checked) {
                    setFormData({...formData, interests: formData.interests.filter(i => i !== interest)});
                  }
                }}
              />
              <span>{interest}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="form-section">
        <label>Upload Photos</label>
        <div className="upload-area">
          <input type="file" accept="image/*" multiple />
          <p>Upload up to 6 photos</p>
        </div>
      </div>

      <div className="form-section">
        <label>Upload Introduction Video (Optional)</label>
        <div className="upload-area">
          <input type="file" accept="video/*" />
          <p>Share a 30-second introduction</p>
        </div>
      </div>
    </div>
  );
};

export default GardeningInterface;