// Profile Component
// Path: src/frontend/components/profile/Profile.jsx
// Purpose: User profile creation and editing with photo display modes

import React, { useState, useEffect } from 'react';
import FilterSettings from './FilterSettings';
import SeedComponent from '../seeds/SeedComponent';
import './Profile.css';

const Profile = () => {
  const [isEditing, setIsEditing] = useState(true);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [photoError, setPhotoError] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showSeeds, setShowSeeds] = useState(false);
  const [filterPreferences, setFilterPreferences] = useState({});
  const [profileData, setProfileData] = useState({
    username: '',
    age: '',
    height: '',
    bodyType: '',
    location: '',
    bio: '',
    interests: [],
    lookingFor: '',
    photos: [],
    prompts: [
      { question: '', answer: '' },
      { question: '', answer: '' },
      { question: '', answer: '' }
    ]
  });

  const bodyTypes = ['Slim', 'Average', 'Athletic', 'Fit', 'Curvy', 'Full Figured', 'Prefer not to say'];
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

  useEffect(() => {
    loadProfile();
    loadFilterPreferences();
  }, []);

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
      if (data.success && data.profile) {
        const profile = data.profile.profile || {};
        setProfileData(prev => ({
          ...prev,
          username: data.profile.username || '',
          age: profile.age || '',
          height: profile.height || '',
          bodyType: profile.bodyType || '',
          location: profile.location || '',
          bio: profile.bio || '',
          interests: profile.interests || [],
          lookingFor: profile.lookingFor || '',
          photos: profile.photos || [],
          prompts: (profile.prompts && profile.prompts.length > 0) ? profile.prompts : [
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

  const loadFilterPreferences = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch('/api/profile/filters', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success && data.filters) {
        setFilterPreferences(data.filters);
      }
    } catch (error) {
      console.error('Load filter preferences error:', error);
    }
  };

  const saveFilterPreferences = async (filters) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/profile/filters', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(filters)
      });
      
      const data = await response.json();
      if (data.success) {
        setFilterPreferences(filters);
        alert('Match preferences saved! 🌸');
      } else {
        alert(data.message || 'Failed to save preferences');
      }
    } catch (error) {
      console.error('Error saving filters:', error);
      alert('Failed to save preferences');
    }
  };

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

  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files);
    
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    for (let file of files) {
      if (!validTypes.includes(file.type)) {
        setPhotoError('Please upload only JPEG, PNG or WebP images');
        return;
      }
      if (file.size > maxSize) {
        setPhotoError('Each photo must be less than 5MB');
        return;
      }
    }
    
    if (profileData.photos.length + files.length > 6) {
      setPhotoError(`You can only have 6 photos total. You currently have ${profileData.photos.length}.`);
      return;
    }
    
    setUploadingPhotos(true);
    setPhotoError('');
    
    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('photos', file);
      });
      
      const token = localStorage.getItem('token');
      const response = await fetch('/api/profile/photos', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      const data = await response.json();
      
      if (data.success) {
        setProfileData(prev => ({
          ...prev,
          photos: data.photos
        }));
      } else {
        setPhotoError(data.message || 'Failed to upload photos');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setPhotoError('Failed to upload photos. Please try again.');
    } finally {
      setUploadingPhotos(false);
    }
  };

  const removePhoto = async (photoId) => {
    if (!window.confirm('Are you sure you want to remove this photo?')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/profile/photos/${photoId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setProfileData(prev => ({
          ...prev,
          photos: data.photos
        }));
      } else {
        alert('Failed to remove photo');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to remove photo');
    }
  };

  const calculateCompletion = () => {
    const requiredFields = ['age', 'bio', 'location'];
    const filledRequired = requiredFields.filter(field => profileData[field]).length;
    const hasPhoto = profileData.photos.length > 0;
    const hasInterests = profileData.interests.length >= 3;
    const hasPrompt = profileData.prompts.some(p => p.answer);
    
    const total = requiredFields.length + 3;
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

      {/* Photo Section */}
      <section className="profile-section profile-edit-photo-section">
        <h2>Your Photos</h2>
        <p className="section-description">Add up to 6 photos that show your authentic self</p>
        
        {photoError && (
          <div className="photo-error">
            {photoError}
          </div>
        )}
        
        <div className="photo-grid">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="photo-slot">
              {profileData.photos && profileData.photos[index] ? (
                <div className="photo-preview">
                  <img 
                    src={profileData.photos[index].thumbnailUrl || profileData.photos[index].url} 
                    alt={`Photo ${index + 1}`} 
                    className={`preview-img ${profileData.photos[index].displayMode || 'contain'}`}
                  />
                  {profileData.photos[index].isMain && (
                    <span className="main-photo-badge">Main</span>
                  )}
                  <button 
                    className="remove-photo"
                    onClick={() => removePhoto(profileData.photos[index]._id)}
                    disabled={uploadingPhotos}
                    aria-label="Remove photo"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <label className={`photo-upload ${uploadingPhotos ? 'uploading' : ''}`}>
                  <input 
                    type="file" 
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handlePhotoUpload}
                    multiple
                    disabled={uploadingPhotos}
                  />
                  {uploadingPhotos ? (
                    <>
                      <div className="upload-spinner"></div>
                      <span className="upload-text">Uploading...</span>
                    </>
                  ) : (
                    <>
                      <span className="upload-icon">+</span>
                      <span className="upload-text">Add Photo</span>
                    </>
                  )}
                </label>
              )}
            </div>
          ))}
        </div>
        <div className="photo-tips">
          <p className="tip-title">Photo Tips:</p>
          <ul>
            <li>Use recent photos that clearly show your face</li>
            <li>Include a variety - close-ups and full body shots</li>
            <li>Show yourself doing activities you enjoy</li>
            <li>Smile naturally - be yourself! 🌸</li>
          </ul>
        </div>
      </section>
      
      <div className="profile-content">
        
        {/* Basic Info Section */}
        <section className="profile-section">
          <h2>Basic Information</h2>
          
          <div className="form-grid">
            <div className="form-group">
              <label>Garden Name (Username)</label>
              <input
                type="text"
                value={profileData.username}
                disabled
                style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
              />
              <small className="form-hint">Username cannot be changed</small>
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
          
          <div className="prompt-group">
            <select
              value={profileData.prompts?.[0]?.question || ''}
              onChange={(e) => handlePromptChange(0, 'question', e.target.value)}
              className="prompt-select"
            >
              <option value="">Choose a prompt...</option>
              {promptQuestions.map(q => (
                <option key={q} value={q}>{q}</option>
              ))}
            </select>
            {profileData.prompts?.[0]?.question && (
              <textarea
                value={profileData.prompts[0].answer || ''}
                onChange={(e) => handlePromptChange(0, 'answer', e.target.value)}
                placeholder="Your answer..."
                rows="3"
                maxLength="200"
                className="prompt-answer"
              />
            )}
          </div>

          <div className="prompt-group">
            <select
              value={profileData.prompts?.[1]?.question || ''}
              onChange={(e) => handlePromptChange(1, 'question', e.target.value)}
              className="prompt-select"
            >
              <option value="">Choose a prompt...</option>
              {promptQuestions.map(q => (
                <option key={q} value={q}>{q}</option>
              ))}
            </select>
            {profileData.prompts?.[1]?.question && (
              <textarea
                value={profileData.prompts[1].answer || ''}
                onChange={(e) => handlePromptChange(1, 'answer', e.target.value)}
                placeholder="Your answer..."
                rows="3"
                maxLength="200"
                className="prompt-answer"
              />
            )}
          </div>

          <div className="prompt-group">
            <select
              value={profileData.prompts?.[2]?.question || ''}
              onChange={(e) => handlePromptChange(2, 'question', e.target.value)}
              className="prompt-select"
            >
              <option value="">Choose a prompt...</option>
              {promptQuestions.map(q => (
                <option key={q} value={q}>{q}</option>
              ))}
            </select>
            {profileData.prompts?.[2]?.question && (
              <textarea
                value={profileData.prompts[2].answer || ''}
                onChange={(e) => handlePromptChange(2, 'answer', e.target.value)}
                placeholder="Your answer..."
                rows="3"
                maxLength="200"
                className="prompt-answer"
              />
            )}
          </div>
        </section>

        {/* Match Preferences Section */}
        <section className="profile-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-md)' }}>
            <h2 style={{ margin: 0 }}>Match Preferences</h2>
            <button 
              className="btn-secondary" 
              onClick={() => setShowFilters(!showFilters)}
              style={{ padding: 'var(--space-sm) var(--space-lg)' }}
            >
              {showFilters ? 'Hide' : 'Show'} Preferences
            </button>
          </div>
          
          {showFilters && (
            <FilterSettings 
              initialFilters={filterPreferences}
              onSave={saveFilterPreferences}
            />
          )}
        </section>

        {/* Seeds Section */}
        <section className="profile-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-md)' }}>
            <h2 style={{ margin: 0 }}>My Seeds</h2>
            <button 
              className="btn-secondary" 
              onClick={() => setShowSeeds(!showSeeds)}
              style={{ padding: 'var(--space-sm) var(--space-lg)' }}
            >
              {showSeeds ? 'Hide' : 'Show'} Seeds
            </button>
          </div>
          
          {showSeeds && (
            <SeedComponent isEmbedded={true} />
          )}
        </section>

        {/* Action Buttons */}
        <div className="profile-actions">
          <button 
            className="btn-secondary"
            onClick={() => setShowPreview(true)}
          >
            Preview Profile
          </button>
          <button 
            className="btn-primary" 
            disabled={calculateCompletion() < 60}
            onClick={handleSaveProfile}
          >
            Save Profile
          </button>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="preview-modal-overlay" onClick={() => setShowPreview(false)}>
          <div className="preview-modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-preview" onClick={() => setShowPreview(false)}>×</button>
            <h2>Profile Preview</h2>
            <p className="preview-subtitle">This is how others will see your profile</p>
            
            <div className="preview-content">
              {/* Photo */}
              <div className="preview-photo">
                {profileData.photos[0] ? (
                  <img 
                    src={profileData.photos[0].thumbnailUrl || profileData.photos[0].url} 
                    alt="Profile preview" 
                  />
                ) : (
                  <div className="no-photo-preview">
                    <span>🌸</span>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="preview-info">
                <h3>{profileData.username || 'Username'}, {profileData.age || '??'}</h3>
                <p className="preview-location">{profileData.location || 'Location not set'}</p>

                <div className="preview-details">
                  {profileData.height && <span>Height: {profileData.height}</span>}
                  {profileData.bodyType && <span>Body Type: {profileData.bodyType}</span>}
                  {profileData.lookingFor && <span>Looking for: {profileData.lookingFor}</span>}
                </div>

                {profileData.bio && (
                  <div className="preview-bio">
                    <h4>About Me</h4>
                    <p>{profileData.bio}</p>
                  </div>
                )}

                {profileData.interests.length > 0 && (
                  <div className="preview-interests">
                    <h4>Interests</h4>
                    <div className="interests-list">
                      {profileData.interests.map((interest, idx) => (
                        <span key={idx} className="interest-chip">{interest}</span>
                      ))}
                    </div>
                  </div>
                )}

                {profileData.prompts.some(p => p.answer) && (
                  <div className="preview-prompts">
                    {profileData.prompts.filter(p => p.answer).map((prompt, idx) => (
                      <div key={idx} className="preview-prompt">
                        <p className="prompt-q">{prompt.question}</p>
                        <p className="prompt-a">{prompt.answer}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;