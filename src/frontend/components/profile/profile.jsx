// Profile Component
// Path: src/frontend/components/profile/Profile.jsx
// Purpose: User profile creation and editing

import React, { useState, useEffect } from 'react';
import './Profile.css';

const Profile = () => {
  const [isEditing, setIsEditing] = useState(true); // Start in edit mode for new users
  const [profileData, setProfileData] = useState({
    username: '',
    age: '',
    height: '',
    bodyType: '',
    location: '',
    bio: '',
    interests: [],
    personalityType: '',
    lookingFor: '',
    photos: [],
    prompts: [
      { question: '', answer: '' },
      { question: '', answer: '' },
      { question: '', answer: '' }
    ]
  });

  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  const bodyTypes = ['Slim', 'Average', 'Athletic', 'Fit', 'Curvy', 'Full Figured', 'Prefer not to say'];
  const personalityTypes = ['INTJ', 'INTP', 'INFJ', 'INFP', 'ISTJ', 'ISFJ', 'ISTP', 'ISFP'];
  const lookingForOptions = ['Long-term relationship', 'Something casual', 'Not sure yet', 'New friends'];
  
  const heightOptions = [];
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
    'Tea', 'Wine Tasting', 'Astronomy', 'History', 'Languages',
    'Podcasts', 'Anime', 'Comics', 'Theatre', 'Poetry'
  ];

  const promptQuestions = [
    "My ideal Sunday morning involves...",
    "I'm looking for someone who...",
    "The way to my heart is...",
    "My happy place is...",
    "I geek out about...",
    "My most irrational fear is...",
    "Two truths and a lie...",
    "I'm convinced that...",
    "My love language is...",
    "After work you'll find me..."
  ];

  // Load existing profile data on component mount
  useEffect(() => {
    const loadProfile = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const response = await fetch('/api/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await response.json();
        if (data.success && data.profile.profile) {
          const profile = data.profile.profile;
          setProfileData(prev => ({
            ...prev,
            username: data.profile.username || '',
            age: profile.age || '',
            height: profile.height || '',
            bodyType: profile.bodyType || '',
            location: profile.location || '',
            bio: profile.bio || '',
            interests: profile.interests || [],
            personalityType: profile.personalityType || '',
            lookingFor: profile.lookingFor || '',
            prompts: profile.prompts || [
              { question: '', answer: '' },
              { question: '', answer: '' },
              { question: '', answer: '' }
            ]
          }));
        }
      } catch (error) {
        console.error('Load profile error:', error);
      }
    };

    loadProfile();
  }, []);

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleInterestToggle = (interest) => {
    setProfileData(prev => {
      const interests = [...prev.interests];
      const index = interests.indexOf(interest);
      
      if (index > -1) {
        interests.splice(index, 1);
      } else if (interests.length < 10) {
        interests.push(interest);
      }
      
      return { ...prev, interests };
    });
  };

  const handlePromptChange = (index, field, value) => {
    setProfileData(prev => {
      const prompts = [...prev.prompts];
      prompts[index] = { ...prompts[index], [field]: value };
      return { ...prev, prompts };
    });
  };

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    // In a real app, you'd upload these to a server
    // For now, we'll create local URLs
    const newPhotos = files.map(file => URL.createObjectURL(file));
    
    setProfileData(prev => ({
      ...prev,
      photos: [...prev.photos, ...newPhotos].slice(0, 6) // Max 6 photos
    }));
  };

  const removePhoto = (index) => {
    setProfileData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
    
    if (currentPhotoIndex >= profileData.photos.length - 1) {
      setCurrentPhotoIndex(Math.max(0, profileData.photos.length - 2));
    }
  };

  const calculateCompletion = () => {
    const requiredFields = ['username', 'age', 'bio', 'location'];
    const filledRequired = requiredFields.filter(field => profileData[field]).length;
    const hasPhoto = profileData.photos.length > 0;
    const hasInterests = profileData.interests.length >= 3;
    const hasPrompt = profileData.prompts.some(p => p.answer);
    
    const total = requiredFields.length + 3; // +3 for photo, interests, and prompts
    const completed = filledRequired + (hasPhoto ? 1 : 0) + (hasInterests ? 1 : 0) + (hasPrompt ? 1 : 0);
    
    return Math.round((completed / total) * 100);
  };

  const handleSaveProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please log in to save your profile');
        return;
      }

      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          age: profileData.age,
          height: profileData.height,
          bodyType: profileData.bodyType,
          location: profileData.location,
          bio: profileData.bio,
          interests: profileData.interests,
          personalityType: profileData.personalityType,
          lookingFor: profileData.lookingFor,
          prompts: profileData.prompts.filter(p => p.question && p.answer)
        })
      });

      const data = await response.json();

      if (data.success) {
        alert('Profile saved successfully! 🌸');
        setIsEditing(false);
      } else {
        alert(data.message || 'Failed to save profile');
      }
    } catch (error) {
      console.error('Save profile error:', error);
      alert('Something went wrong. Please try again.');
    }
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>Your Garden Profile</h1>
        <div className="profile-completion">
          <span className="completion-text">{calculateCompletion()}% Complete</span>
          <div className="completion-bar">
            <div className="completion-fill" style={{ width: `${calculateCompletion()}%` }}></div>
          </div>
        </div>
      </div>

      <div className="profile-content">
        {/* Photo Section */}
        <section className="profile-section photo-section">
          <h2>Your Photos</h2>
          <p className="section-description">Add up to 6 photos that show your authentic self</p>
          
          <div className="photo-grid">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="photo-slot">
                {profileData.photos[index] ? (
                  <div className="photo-preview">
                    <img src={profileData.photos[index]} alt={`Photo ${index + 1}`} />
                    <button 
                      className="remove-photo"
                      onClick={() => removePhoto(index)}
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <label className="photo-upload">
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      multiple
                    />
                    <span className="upload-icon">+</span>
                    <span className="upload-text">Add Photo</span>
                  </label>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Basic Info Section */}
        <section className="profile-section">
          <h2>Basic Information</h2>
          
          <div className="form-grid">
            <div className="form-group">
              <label>Garden Name (Username)*</label>
              <input
                type="text"
                value={profileData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                placeholder="e.g., QuietDaisy, BookishRose"
              />
            </div>

            <div className="form-group">
              <label>Age*</label>
              <input
                type="number"
                min="18"
                max="100"
                value={profileData.age}
                onChange={(e) => handleInputChange('age', e.target.value)}
                placeholder="Your age"
              />
            </div>

            <div className="form-group">
              <label>Height</label>
              <select
                value={profileData.height}
                onChange={(e) => handleInputChange('height', e.target.value)}
              >
                <option value="">Select height</option>
                {heightOptions.map(height => (
                  <option key={height} value={height}>{height}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Body Type</label>
              <select
                value={profileData.bodyType}
                onChange={(e) => handleInputChange('bodyType', e.target.value)}
              >
                <option value="">Select body type</option>
                {bodyTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Location*</label>
              <input
                type="text"
                value={profileData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="City, State"
              />
            </div>

            <div className="form-group">
              <label>Personality Type</label>
              <select
                value={profileData.personalityType}
                onChange={(e) => handleInputChange('personalityType', e.target.value)}
              >
                <option value="">Select type (optional)</option>
                {personalityTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section className="profile-section">
          <h2>About You</h2>
          
          <div className="form-group">
            <label>Bio*</label>
            <textarea
              value={profileData.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              placeholder="Share what makes you unique. What are your passions? What makes you feel alive?"
              rows="5"
              maxLength="500"
            />
            <span className="char-count">{profileData.bio.length}/500</span>
          </div>

          <div className="form-group">
            <label>What are you looking for?</label>
            <select
              value={profileData.lookingFor}
              onChange={(e) => handleInputChange('lookingFor', e.target.value)}
            >
              <option value="">Select an option</option>
              {lookingForOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
        </section>

        {/* Interests Section */}
        <section className="profile-section">
          <h2>Your Interests</h2>
          <p className="section-description">Choose up to 10 interests (minimum 3)</p>
          
          <div className="interests-grid">
            {interestOptions.map(interest => (
              <button
                key={interest}
                className={`interest-chip ${profileData.interests.includes(interest) ? 'selected' : ''}`}
                onClick={() => handleInterestToggle(interest)}
              >
                {interest}
              </button>
            ))}
          </div>
          <p className="interests-count">{profileData.interests.length}/10 interests selected</p>
        </section>

        {/* Prompts Section */}
        <section className="profile-section">
          <h2>Conversation Starters</h2>
          <p className="section-description">Answer at least one prompt to help others get to know you</p>
          
          {profileData.prompts.map((prompt, index) => (
            <div key={index} className="prompt-group">
              <select
                value={prompt.question}
                onChange={(e) => handlePromptChange(index, 'question', e.target.value)}
                className="prompt-select"
              >
                <option value="">Choose a prompt...</option>
                {promptQuestions.map(q => (
                  <option key={q} value={q}>{q}</option>
                ))}
              </select>
              
              {prompt.question && (
                <textarea
                  value={prompt.answer}
                  onChange={(e) => handlePromptChange(index, 'answer', e.target.value)}
                  placeholder="Your answer..."
                  rows="3"
                  maxLength="200"
                  className="prompt-answer"
                />
              )}
            </div>
          ))}
        </section>

        {/* Action Buttons */}
        <div className="profile-actions">
          <button className="btn-secondary">Preview Profile</button>
          <button 
            className="btn-primary" 
            disabled={calculateCompletion() < 60}
            onClick={handleSaveProfile}
          >
            Save Profile
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;