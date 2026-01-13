import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/pages/CookiesPage.css';

export const CookiesPage = () => {
  const [cookiePreferences, setCookiePreferences] = useState({
    essential: true, // Always required
    analytics: localStorage.getItem('cookie_analytics') === 'true' || false,
    marketing: localStorage.getItem('cookie_marketing') === 'true' || false,
  });

  const handleToggle = (type) => {
    if (type === 'essential') return; // Essential cookies cannot be disabled
    
    setCookiePreferences(prev => {
      const updated = {
        ...prev,
        [type]: !prev[type]
      };
      localStorage.setItem(`cookie_${type}`, updated[type].toString());
      return updated;
    });
  };

  const handleSavePreferences = () => {
    localStorage.setItem('cookie_analytics', cookiePreferences.analytics.toString());
    localStorage.setItem('cookie_marketing', cookiePreferences.marketing.toString());
    localStorage.setItem('cookie_preferences_saved', 'true');
    alert('Cookie preferences saved successfully!');
  };

  return (
    <div className="cookies-page">
      <div className="cookies-container">
        <h1>Manage Cookies</h1>
        <p className="cookies-intro">
          We use cookies and similar technologies to enhance your experience, analyze site usage, 
          and assist in our marketing efforts. You can manage your cookie preferences below.
        </p>

        <section>
          <h2>What Are Cookies?</h2>
          <p>
            Cookies are small text files that are placed on your device when you visit a website. 
            They are widely used to make websites work more efficiently and provide information to 
            the website owners.
          </p>
        </section>

        <section>
          <h2>Types of Cookies We Use</h2>
          
          <div className="cookie-type">
            <div className="cookie-header">
              <div>
                <h3>Essential Cookies</h3>
                <p>Required for the website to function properly</p>
              </div>
              <label className="cookie-toggle">
                <input
                  type="checkbox"
                  checked={cookiePreferences.essential}
                  disabled
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
            <p className="cookie-description">
              These cookies are necessary for the website to function and cannot be switched off. 
              They are usually set in response to actions made by you, such as logging in or setting 
              your privacy preferences.
            </p>
          </div>

          <div className="cookie-type">
            <div className="cookie-header">
              <div>
                <h3>Analytics Cookies</h3>
                <p>Help us understand how visitors interact with our website</p>
              </div>
              <label className="cookie-toggle">
                <input
                  type="checkbox"
                  checked={cookiePreferences.analytics}
                  onChange={() => handleToggle('analytics')}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
            <p className="cookie-description">
              These cookies allow us to count visits and traffic sources so we can measure and improve 
              the performance of our site. They help us know which pages are most popular and see how 
              visitors move around the site.
            </p>
          </div>

          <div className="cookie-type">
            <div className="cookie-header">
              <div>
                <h3>Marketing Cookies</h3>
                <p>Used to deliver relevant advertisements</p>
              </div>
              <label className="cookie-toggle">
                <input
                  type="checkbox"
                  checked={cookiePreferences.marketing}
                  onChange={() => handleToggle('marketing')}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
            <p className="cookie-description">
              These cookies may be set through our site by our advertising partners. They may be used 
              to build a profile of your interests and show you relevant content on other sites.
            </p>
          </div>
        </section>

        <section>
          <h2>Third-Party Cookies</h2>
          <p>
            In addition to our own cookies, we may also use various third-party cookies to report usage 
            statistics and deliver advertisements. These third parties may set their own cookies to 
            collect information about your online activities.
          </p>
        </section>

        <section>
          <h2>Managing Cookies in Your Browser</h2>
          <p>You can control and manage cookies in your browser settings. Here's how:</p>
          <ul>
            <li><strong>Chrome:</strong> Settings → Privacy and security → Cookies and other site data</li>
            <li><strong>Firefox:</strong> Options → Privacy & Security → Cookies and Site Data</li>
            <li><strong>Safari:</strong> Preferences → Privacy → Cookies and website data</li>
            <li><strong>Edge:</strong> Settings → Privacy, search, and services → Cookies and site permissions</li>
          </ul>
        </section>

        <div className="cookie-actions">
          <button onClick={handleSavePreferences} className="save-preferences-btn">
            Save Preferences
          </button>
          <button 
            onClick={() => {
              setCookiePreferences({
                essential: true,
                analytics: false,
                marketing: false
              });
            }}
            className="reject-all-btn"
          >
            Reject All (Except Essential)
          </button>
          <button 
            onClick={() => {
              setCookiePreferences({
                essential: true,
                analytics: true,
                marketing: true
              });
            }}
            className="accept-all-btn"
          >
            Accept All
          </button>
        </div>

        <section>
          <h2>More Information</h2>
          <p>
            For more detailed information about how we use cookies and your privacy rights, 
            please see our <Link to="/privacy">Privacy Policy</Link>.
          </p>
        </section>
      </div>
    </div>
  );
};
