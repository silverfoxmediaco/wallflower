// Community Guidelines Page
// Path: src/frontend/pages/CommunityGuidelines.jsx
// Purpose: Display community guidelines for Wallflower.me

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import './CommunityGuidelines.css';

const CommunityGuidelines = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    // Check if user is logged in
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    window.location.href = '/';
  };

  const currentDate = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <>
      <Header 
        isLoggedIn={isLoggedIn}
        onLogout={handleLogout}
        onSignupClick={() => {}}
        onLoginClick={() => {}}
      />
      <div className="guidelines-page">
        <div className="guidelines-container">
          <div className="guidelines-header">
            <h1 className="guidelines-title">Wallflower.me Community Guidelines</h1>
            <p className="guidelines-effective-date">Effective Date: {currentDate}</p>
          </div>

          <div className="guidelines-body">
            <p className="guidelines-intro">
              At Wallflower, we believe that meaningful relationships grow best in safe, 
              respectful, and intentional environments. These Community Guidelines exist to 
              ensure that every user feels welcome, valued, and secure.
            </p>

            <p className="guidelines-agreement">
              By using Wallflower.me, you agree to follow these principles:
            </p>

            <section className="guideline-item">
              <h2 className="guideline-number">1.</h2>
              <div className="guideline-content">
                <h3 className="guideline-title">Be Kind and Respectful</h3>
                <p className="guideline-text">
                  Treat others the way you want to be treated. Harassment, hate speech, 
                  discrimination, or any form of abuse — verbal or visual — will not be tolerated.
                </p>
              </div>
            </section>

            <section className="guideline-item">
              <h2 className="guideline-number">2.</h2>
              <div className="guideline-content">
                <h3 className="guideline-title">Be Honest and Real</h3>
                <p className="guideline-text">
                  Represent yourself truthfully. Do not create fake profiles or impersonate 
                  others. Authenticity is the heart of every connection here.
                </p>
              </div>
            </section>

            <section className="guideline-item">
              <h2 className="guideline-number">3.</h2>
              <div className="guideline-content">
                <h3 className="guideline-title">Consent is Essential</h3>
                <p className="guideline-text">
                  Do not send unwanted messages, explicit content, or pressure others into 
                  conversations or meetings. A flower must be accepted before it can grow.
                </p>
              </div>
            </section>

            <section className="guideline-item">
              <h2 className="guideline-number">4.</h2>
              <div className="guideline-content">
                <h3 className="guideline-title">Keep Things Appropriate</h3>
                <p className="guideline-text">
                  Wallflower is not a space for explicit material, violent content, or anything 
                  that might make others uncomfortable. If you wouldn't show it in public, 
                  don't post it here.
                </p>
              </div>
            </section>

            <section className="guideline-item">
              <h2 className="guideline-number">5.</h2>
              <div className="guideline-content">
                <h3 className="guideline-title">Respect Boundaries</h3>
                <p className="guideline-text">
                  No means no — whether it's a declined flower, a lack of response, or someone 
                  unmatching. Give space and practice empathy.
                </p>
              </div>
            </section>

            <section className="guideline-item">
              <h2 className="guideline-number">6.</h2>
              <div className="guideline-content">
                <h3 className="guideline-title">Help Keep the Garden Safe</h3>
                <p className="guideline-text">
                  Report inappropriate behavior, suspicious profiles, or anything that feels 
                  unsafe. Our team reviews all reports carefully and takes appropriate action.
                </p>
              </div>
            </section>

            <section className="guideline-item">
              <h2 className="guideline-number">7.</h2>
              <div className="guideline-content">
                <h3 className="guideline-title">One Profile, One Person</h3>
                <p className="guideline-text">
                  Wallflower is a space for individual connection. Each user should maintain 
                  a single account, and each account must represent a real, individual person.
                </p>
              </div>
            </section>

            <section className="guideline-item">
              <h2 className="guideline-number">8.</h2>
              <div className="guideline-content">
                <h3 className="guideline-title">Use Wallflower as Intended</h3>
                <p className="guideline-text">
                  Do not use Wallflower for commercial, promotional, or malicious purposes. 
                  This space is for building genuine romantic and emotional connections — 
                  not business or spam.
                </p>
              </div>
            </section>

            <div className="guidelines-consequences">
              <h2 className="consequences-title">Consequences of Violating These Guidelines</h2>
              <p className="consequences-text">
                Violating these guidelines may result in a warning, suspension, or permanent 
                removal from Wallflower.me without refund. We take your safety and well-being 
                seriously.
              </p>
            </div>

            <div className="guidelines-closing">
              <p className="closing-message">
                <strong>Let's grow something real, together.</strong>
              </p>
              <p className="closing-text">
                If you see or experience behavior that violates these guidelines, please 
                report it directly through the app or contact us at:{' '}
                <a href="mailto:safety@wallflower.me" className="safety-link">
                  safety@wallflower.me
                </a>
              </p>
            </div>
          </div>

          <div className="guidelines-footer">
            <Link to="/" className="btn btn-secondary">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default CommunityGuidelines;