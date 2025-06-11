// Garden Component
// Path: src/frontend/components/garden/Garden.jsx
// Purpose: Display seeds sent/received and matches with clickable stat boxes

import React, { useState, useEffect } from 'react';
import './Garden.css';

const Garden = () => {
  const [gardenData, setGardenData] = useState({
    seedsReceived: [],
    seedsSent: [],
    matches: [],
    flowersInBloom: []
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('received');

  useEffect(() => {
    fetchGardenData();
  }, []);

  const fetchGardenData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/garden', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      console.log('Garden API response:', data); // Debug log
      
      if (data.success && data.garden) {
        setGardenData({
          seedsReceived: data.garden.seedsReceived || [],
          seedsSent: data.garden.seedsSent || [],
          matches: data.garden.matches || [],
          flowersInBloom: data.garden.flowersInBloom || []
        });
      } else {
        // Set empty arrays if no data
        setGardenData({
          seedsReceived: [],
          seedsSent: [],
          matches: [],
          flowersInBloom: []
        });
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching garden data:', error);
      // Set empty arrays on error
      setGardenData({
        seedsReceived: [],
        seedsSent: [],
        matches: [],
        flowersInBloom: []
      });
      setLoading(false);
    }
  };

  const handleViewProfile = (userId) => {
    // For now, navigate to browse page
    // In a complete implementation, you'd navigate to /profile/:userId
    window.location.href = '/browse';
  };

  const handleSendSeedBack = async (userId) => {
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
        alert('Seed sent! 🌱 You have a match!');
        fetchGardenData(); // Refresh the garden
      }
    } catch (error) {
      console.error('Error sending seed:', error);
    }
  };

  if (loading) {
    return (
      <div className="garden-container">
        <div className="loading">Loading your garden... 🌻</div>
      </div>
    );
  }

  return (
    <div className="garden-container">
      <div className="garden-header">
        <h1>My Garden 🌻</h1>
        <p className="garden-subtitle">Watch your connections bloom</p>
      </div>

      {/* Clickable Stats Boxes */}
      <div className="garden-stats">
        <div 
          className={`stat-box clickable ${activeTab === 'received' ? 'active' : ''}`}
          onClick={() => setActiveTab('received')}
        >
          <span className="stat-number">{gardenData.seedsReceived.length}</span>
          <span className="stat-label">Seeds Received</span>
        </div>
        <div 
          className={`stat-box clickable ${activeTab === 'sent' ? 'active' : ''}`}
          onClick={() => setActiveTab('sent')}
        >
          <span className="stat-number">{gardenData.seedsSent.length}</span>
          <span className="stat-label">Seeds Sent</span>
        </div>
        <div 
          className={`stat-box clickable matches ${activeTab === 'matches' ? 'active' : ''}`}
          onClick={() => setActiveTab('matches')}
        >
          <span className="stat-number">{gardenData.matches.length}</span>
          <span className="stat-label">Matches</span>
        </div>
        <div 
          className={`stat-box clickable flowers ${activeTab === 'blooming' ? 'active' : ''}`}
          onClick={() => setActiveTab('blooming')}
        >
          <span className="stat-number">{gardenData.flowersInBloom.length}</span>
          <span className="stat-label">Flowers in Bloom</span>
        </div>
      </div>

      {/* Content Area */}
      <div className="garden-content">
        {activeTab === 'received' && (
          <div className="seeds-grid">
            {gardenData.seedsReceived.length > 0 ? (
              gardenData.seedsReceived.map(seed => (
                <div key={seed._id} className="seed-card">
                  <div className="seed-photo">
                    {seed.profile?.photos?.[0] ? (
                      <img 
                        src={seed.profile.photos[0].thumbnailUrl || seed.profile.photos[0].url} 
                        alt={seed.username} 
                      />
                    ) : (
                      <div className="no-photo">🌸</div>
                    )}
                  </div>
                  <div className="seed-info">
                    <h3>{seed.username}</h3>
                    <p className="seed-details">
                      {seed.profile?.age || '??'} • {seed.profile?.location || 'Location not set'}
                    </p>
                    <button 
                      className="view-profile-btn"
                      onClick={() => handleViewProfile(seed._id)}
                    >
                      View Profile
                    </button>
                    <button 
                      className="send-seed-btn"
                      onClick={() => handleSendSeedBack(seed._id)}
                    >
                      Send Seed Back
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <span className="empty-icon">🌱</span>
                <p>No seeds received yet. Keep growing your profile!</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'sent' && (
          <div className="seeds-grid">
            {gardenData.seedsSent.length > 0 ? (
              gardenData.seedsSent.map(seed => (
                <div key={seed._id} className="seed-card">
                  <div className="seed-photo">
                    {seed.profile?.photos?.[0] ? (
                      <img 
                        src={seed.profile.photos[0].thumbnailUrl || seed.profile.photos[0].url} 
                        alt={seed.username} 
                      />
                    ) : (
                      <div className="no-photo">🌸</div>
                    )}
                  </div>
                  <div className="seed-info">
                    <h3>{seed.username}</h3>
                    <p className="seed-details">
                      {seed.profile?.age || '??'} • {seed.profile?.location || 'Location not set'}
                    </p>
                    <p className="waiting-text">Waiting for response... 🌱</p>
                    <button 
                      className="view-profile-btn"
                      onClick={() => handleViewProfile(seed._id)}
                    >
                      View Profile
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <span className="empty-icon">🌰</span>
                <p>You haven't sent any seeds yet. Start browsing!</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'matches' && (
          <div className="matches-grid">
            {gardenData.matches.length > 0 ? (
              gardenData.matches.map(match => (
                <div key={match._id} className="match-card">
                  <div className="match-photo">
                    {match.profile?.photos?.[0] ? (
                      <img 
                        src={match.profile.photos[0].thumbnailUrl || match.profile.photos[0].url} 
                        alt={match.username} 
                      />
                    ) : (
                      <div className="no-photo">💜</div>
                    )}
                  </div>
                  <div className="match-info">
                    <h3>{match.username}</h3>
                    <p className="seed-details">
                      {match.profile?.age || '??'} • {match.profile?.location || 'Location not set'}
                    </p>
                    <p className="match-text">It's a match! 🌸</p>
                    <button 
                      className="view-profile-btn"
                      onClick={() => handleViewProfile(match._id)}
                    >
                      View Profile
                    </button>
                    <button 
                      className="message-btn"
                      onClick={() => alert('Messaging coming soon! 💌')}
                    >
                      Send Message
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <span className="empty-icon">💜</span>
                <p>No matches yet. When someone you sent a seed to sends one back, you'll match!</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'blooming' && (
          <div className="flowers-grid">
            {gardenData.flowersInBloom.length > 0 ? (
              gardenData.flowersInBloom.map(flower => (
                <div key={flower._id} className="flower-card">
                  <div className="flower-photo">
                    {flower.profile?.photos?.[0] ? (
                      <img 
                        src={flower.profile.photos[0].thumbnailUrl || flower.profile.photos[0].url} 
                        alt={flower.username} 
                      />
                    ) : (
                      <div className="no-photo">🌺</div>
                    )}
                  </div>
                  <div className="flower-info">
                    <h3>{flower.username}</h3>
                    <p className="seed-details">
                      {flower.profile?.age || '??'} • {flower.profile?.location || 'Location not set'}
                    </p>
                    <p className="blooming-status">🌺 Actively chatting</p>
                    <button 
                      className="view-profile-btn"
                      onClick={() => handleViewProfile(flower._id)}
                    >
                      View Profile
                    </button>
                    <button 
                      className="continue-chat-btn"
                      onClick={() => alert('Opening chat... 💬')}
                    >
                      Continue Chat
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <span className="empty-icon">🌺</span>
                <p>No active conversations yet. Start chatting with your matches!</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Garden;