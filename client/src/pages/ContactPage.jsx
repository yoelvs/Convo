import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import '../styles/pages/ContactPage.css';

export const ContactPage = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.username || '',
    email: user?.email || '',
    subject: '',
    message: '',
    category: 'general'
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real application, this would send the form data to a backend API
    console.log('Contact form submitted:', formData);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({
        name: user?.username || '',
        email: user?.email || '',
        subject: '',
        message: '',
        category: 'general'
      });
    }, 3000);
  };

  return (
    <div className="contact-page">
      <div className="contact-container">
        <h1>Contact Us</h1>
        <p className="contact-intro">
          We'd love to hear from you! Whether you have a question, feedback, or need support, 
          we're here to help.
        </p>

        {submitted ? (
          <div className="success-message">
            <h2>✓ Thank you for contacting us!</h2>
            <p>We've received your message and will get back to you as soon as possible.</p>
          </div>
        ) : (
          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Your name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="your.email@example.com"
              />
            </div>

            <div className="form-group">
              <label htmlFor="category">Category *</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
              >
                <option value="general">General Inquiry</option>
                <option value="support">Technical Support</option>
                <option value="bug">Report a Bug</option>
                <option value="feature">Feature Request</option>
                <option value="privacy">Privacy Concern</option>
                <option value="security">Security Issue</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="subject">Subject *</label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                placeholder="Brief subject line"
              />
            </div>

            <div className="form-group">
              <label htmlFor="message">Message *</label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows="6"
                placeholder="Please provide details about your inquiry..."
              />
            </div>

            <button type="submit" className="submit-btn">
              Send Message
            </button>
          </form>
        )}

        <div className="contact-info">
          <h2>Other Ways to Reach Us</h2>
          <div className="info-grid">
            <div className="info-item">
              <h3>📧 Email</h3>
              <p>support@letstalk.com</p>
            </div>
            <div className="info-item">
              <h3>⏰ Response Time</h3>
              <p>We typically respond within 24-48 hours</p>
            </div>
            <div className="info-item">
              <h3>🔒 Security Issues</h3>
              <p>For urgent security concerns, please mark your message as "Security Issue"</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
