// CurrentMembers Component
// Path: src/frontend/components/CurrentMembers.jsx
// Purpose: Display member statistics and testimonials on landing page

import React, { useState, useEffect } from 'react';
import './CurrentMembers.css';

const CurrentMembers = () => {
  // Real data from API
  const [memberStats, setMemberStats] = useState({
    total: '...',
    newThisWeek: '...',
    successStories: '...',
    activeGardens: '...'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch real member statistics
    fetch('/api/stats/members')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setMemberStats(data.stats);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch member stats:', err);
        setLoading(false);
      });
  }, []);

  const testimonials = [
    {
      id: 1,
      name: 'Sarah',
      age: 28,
      personality: 'INFJ',
      quote: "Finally, a dating app that doesn't drain my social battery. I love taking things slow here.",
      avatar: '🌻'
    },
    {
      id: 2,
      name: 'Michael',
      age: 32,
      personality: 'INTJ',
      quote: "The seed system is brilliant. No pressure, just genuine connections at my own pace.",
      avatar: '🌿'
    },
    {
      id: 3,
      name: 'Emma',
      age: 26,
      personality: 'ISFP',
      quote: "I met my partner here after years of overwhelming dating apps. Wallflower just gets it.",
      avatar: '🌸'
    }
  ];

  return (
    <section className="current-members" id="current-members">
      <div className="container">
        <div className="members-header">
          <h2 className="section-title">Join Our Growing Garden</h2>
          <p className="section-subtitle">
            A community of introverts blooming at their own pace
          </p>
        </div>

        {/* Member Statistics */}
        <div className="member-stats">
          <div className="stat-card">
            <div className={`stat-number ${loading ? 'loading' : ''}`}>
              {memberStats.total}
            </div>
            <div className="stat-label">Wallflowers</div>
          </div>
          <div className="stat-card">
            <div className={`stat-number ${loading ? 'loading' : ''}`}>
              {memberStats.newThisWeek}
            </div>
            <div className="stat-label">New This Week</div>
          </div>
          <div className="stat-card">
            <div className={`stat-number ${loading ? 'loading' : ''}`}>
              {memberStats.successStories}
            </div>
            <div className="stat-label">Love Stories</div>
          </div>
          <div className="stat-card">
            <div className={`stat-number ${loading ? 'loading' : ''}`}>
              {memberStats.activeGardens}
            </div>
            <div className="stat-label">Active Gardens</div>
          </div>
        </div>

        {/* Member Testimonials */}
        <div className="testimonials-section">
          <h3 className="testimonials-title">What Our Members Say</h3>
          <div className="testimonials-grid">
            {testimonials.map(testimonial => (
              <div key={testimonial.id} className="testimonial-card">
                <div className="testimonial-header">
                  <span className="testimonial-avatar">{testimonial.avatar}</span>
                  <div className="testimonial-info">
                    <span className="testimonial-name">{testimonial.name}, {testimonial.age}</span>
                    <span className="testimonial-personality">{testimonial.personality}</span>
                  </div>
                </div>
                <p className="testimonial-quote">"{testimonial.quote}"</p>
              </div>
            ))}
          </div>
        </div>

        {/* Community Features */}
        <div className="community-features">
          <div className="feature-highlight">
            <span className="feature-icon">🛡️</span>
            <h4>Safe & Respectful</h4>
            <p>Our community values consent and boundaries</p>
          </div>
          <div className="feature-highlight">
            <span className="feature-icon">🌙</span>
            <h4>Introvert-Friendly</h4>
            <p>Designed for those who recharge in solitude</p>
          </div>
          <div className="feature-highlight">
            <span className="feature-icon">💜</span>
            <h4>Quality Over Quantity</h4>
            <p>Meaningful connections, not endless swiping</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CurrentMembers;