// Garden Component
// Path: src/frontend/components/garden/Garden.jsx
// Purpose: Display seeds sent/received and matches

import React, { useState, useEffect } from 'react';
import './Garden.css';

const Garden = () => {
  const [gardenData, setGardenData] = useState({
    seedsReceived: [],
    seedsSent: [],
    matches: []
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
      if (data.success) {
        setGardenData(data.garden);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching garden data:', error);
      setLoading(false);
    }
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

      <div className="garden-stats">
        <div className="stat-box">
          <span className="stat-number">{gardenData.seedsReceived.length}</span>
          <span className="stat-label">Seeds Received</span>
        </div>
        <div className="stat-box">
          <span className="stat-number">{gardenData.seedsSent.length}</span>
          <span className="stat-label">Seeds Sent</span>
        </div>
        <div className="stat-box matches">
          <span className="stat-number">{gardenData.matches.length}</span>
          <span className="stat-label">Matches</span>
        </div>
      </div>

      <div className="garden-tabs">
        <button 
          className={`tab ${activeTab === 'received' ? 'active' : ''}`}
          onClick={() => setActiveTab('received')}
        >
          Seeds Received ({gardenData.seedsReceived.length})
        </button>
        <button 
          className={`tab ${activeTab === 'sent' ? 'active' : ''}`}
          onClick={() => setActiveTab('sent')}
        >
          Seeds Sent ({gardenData.seedsSent.length})
        </button>
        <button 
          className={`tab ${activeTab === 'matches' ? 'active' : ''}`}
          onClick={() => setActiveTab('matches')}
        >
          Matches ({gardenData.matches.length})
        </button>
      </div>

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
                    <h3>{seed.username}, {seed.profile?.age || '??'}</h3>
                    <p className="location">{seed.profile?.location || 'Location not set'}</p>
                    {seed.profile?.bio && (
                      <p className="bio">{seed.profile.bio.substring(0, 100)}...</p>
                    )}
                    <button 
                      className="send-seed-btn"
                      onClick={() => handleSendSeedBack(seed._id)}
                    >
                      Send Seed Back 🌱
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
                    <h3>{seed.username}, {seed.profile?.age || '??'}</h3>
                    <p className="location">{seed.profile?.location || 'Location not set'}</p>
                    <p className="waiting-text">Waiting for them to send a seed back...</p>
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
                    <h3>{match.username}, {match.profile?.age || '??'}</h3>
                    <p className="location">{match.profile?.location || 'Location not set'}</p>
                    <p className="match-text">It's a match! 🌸</p>
                    <button className="message-btn">
                      Send Message 💌
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
      </div>
    </div>
  );
};

export default Garden;