import React from 'react';
import './HowItWorks.css';

const HowItWorks = ({ onStartPlanting }) => {  // Add the prop here
  const steps = [
    {
      number: "1",
      icon: "🌱",
      title: "Plant Your Profile",
      description: "Create a gentle introduction that reflects your authentic self. No pressure to be perfect - just be you.",
      hasButton: true,
      buttonText: "Start Planting",
      buttonAction: onStartPlanting  // Change this line to use the prop
    },
    {
      number: "2",
      icon: "🌸",
      title: "Send Seeds of Interest",
      description: "When someone catches your eye, send them a seed. It's a soft way to show interest without the pressure of a direct message."
    },
    {
      number: "3",
      icon: "🌺",
      title: "Nurture Connections",
      description: "If they're interested too, your seed blooms into a flower. Now you can start a conversation at your own pace."
    },
    {
      number: "4",
      icon: "🌻",
      title: "Grow Your Garden",
      description: "Build meaningful connections in your garden. Take your time, there's no rush to respond or meet."
    }
  ];

  return (
    <section className="how-it-works">
      <div className="container">
        <div className="how-it-works-header">
          <h2 className="section-title">How Wallflower Works</h2>
          <p className="section-subtitle text-muted">
            Dating designed for introverts - gentle, thoughtful, and at your own pace
          </p>
        </div>
        
        <div className="steps-grid">
          {steps.map((step, index) => (
            <div key={index} className="step-card fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
              <div className="step-number">{step.number}</div>
              <div className="step-icon">{step.icon}</div>
              <h3 className="step-title">{step.title}</h3>
              <p className="step-description">{step.description}</p>
              {step.hasButton && (
                <button 
                  className="step-action-btn" 
                  onClick={step.buttonAction}
                >
                  {step.buttonText}
                </button>
              )}
            </div>
          ))}
        </div>
        
        <div className="how-it-works-footer">
          <p className="footer-text text-muted">
            No swiping. No pressure. Just genuine connections blooming naturally.
          </p>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;