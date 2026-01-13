import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/components/CookieConsent.css';

export const CookieConsent = () => {
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // Check if user has already accepted cookies
    const cookieConsent = localStorage.getItem('cookie_consent_accepted');
    const cookiePreferencesSaved = localStorage.getItem('cookie_preferences_saved');
    
    // Show modal if consent hasn't been given
    if (!cookieConsent && !cookiePreferencesSaved) {
      // Small delay to ensure page is loaded
      setTimeout(() => {
        setShowModal(true);
      }, 500);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem('cookie_consent_accepted', 'true');
    localStorage.setItem('cookie_analytics', 'true');
    localStorage.setItem('cookie_marketing', 'true');
    localStorage.setItem('cookie_preferences_saved', 'true');
    setShowModal(false);
  };

  const handleAcceptEssential = () => {
    localStorage.setItem('cookie_consent_accepted', 'true');
    localStorage.setItem('cookie_analytics', 'false');
    localStorage.setItem('cookie_marketing', 'false');
    localStorage.setItem('cookie_preferences_saved', 'true');
    setShowModal(false);
  };

  const handleCustomize = () => {
    // Navigate to cookies page
    window.location.href = '/cookies';
  };

  if (!showModal) {
    return null;
  }

  return (
    <div className="cookie-consent-overlay">
      <div className="cookie-consent-modal">
        <div className="cookie-consent-header">
          <h2>🍪 Cookie Consent</h2>
        </div>
        <div className="cookie-consent-content">
          <p>
            We use cookies to enhance your experience, analyze site usage, and assist in our marketing efforts. 
            By clicking "Accept All", you consent to our use of cookies. You can also choose to accept only 
            essential cookies or customize your preferences.
          </p>
          <p className="cookie-consent-link">
            <Link to="/cookies" target="_blank">Learn more about our cookie policy</Link>
          </p>
        </div>
        <div className="cookie-consent-footer">
          <button onClick={handleCustomize} className="cookie-customize-btn">
            Customize
          </button>
          <button onClick={handleAcceptEssential} className="cookie-essential-btn">
            Essential Only
          </button>
          <button onClick={handleAcceptAll} className="cookie-accept-all-btn">
            Accept All
          </button>
        </div>
      </div>
    </div>
  );
};
