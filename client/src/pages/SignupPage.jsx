import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import '../styles/pages/SignupPage.css';

export const SignupPage = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!acceptedTerms) {
      setShowTerms(true);
      setError('You must accept the Terms of Service to continue.');
      return;
    }
    
    setError('');
    setLoading(true);

    const result = await signup(username, email, password, avatarFile);
    if (result.success) {
      navigate('/chat');
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  const handleAcceptTerms = () => {
    setAcceptedTerms(true);
    setShowTerms(false);
    setError('');
  };

  const handleDeclineTerms = () => {
    setShowTerms(false);
    setError('You must accept the Terms of Service to create an account.');
  };

  return (
    <div className="signup-page">
      <div className="signup-container">
        <Link to="/home" style={{ textDecoration: 'none', color: 'inherit' }}>
          <h1>💬 Convo</h1>
        </Link>
        <p className="subtitle">The Best Social Network</p>
        <h2>Sign Up</h2>
        <form onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}
          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              minLength={3}
              maxLength={30}
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
          <div className="form-group">
            <label>Profile Picture (Optional)</label>
            <div className="avatar-upload">
              {avatarPreview ? (
                <div className="avatar-preview">
                  <img src={avatarPreview} alt="Avatar preview" />
                  <button
                    type="button"
                    onClick={() => {
                      setAvatarFile(null);
                      setAvatarPreview(null);
                    }}
                    className="remove-avatar"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <label className="avatar-upload-label">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    style={{ display: 'none' }}
                  />
                  <span>Choose Image</span>
                </label>
              )}
            </div>
          </div>
          <div className="form-group">
            <label className="terms-checkbox-label">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => {
                  if (!e.target.checked) {
                    setAcceptedTerms(false);
                  } else {
                    setShowTerms(true);
                  }
                }}
                required
              />
              <span>
                I accept the <button type="button" onClick={() => setShowTerms(true)} className="terms-link-btn">Terms of Service</button>
              </span>
            </label>
          </div>
          <button type="submit" disabled={loading || !acceptedTerms}>
            {loading ? 'Signing up...' : 'Sign Up'}
          </button>
        </form>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap', fontSize: '0.9rem', marginTop: '1rem', alignItems: 'center' }}>
          <p className="login-link" style={{ margin: 0 }}>
            Already have an account? <Link to="/login">Login</Link>
          </p>
          <span style={{ color: 'var(--gray-500)' }}>•</span>
          <Link to="/home" className="home-link">
            Home
          </Link>
        </div>
      </div>

      {showTerms && (
        <div className="terms-modal-overlay" onClick={() => setShowTerms(false)}>
          <div className="terms-modal" onClick={(e) => e.stopPropagation()}>
            <div className="terms-modal-header">
              <h2>Terms of Service</h2>
              <button className="terms-modal-close" onClick={() => setShowTerms(false)}>×</button>
            </div>
            <div className="terms-modal-content">
              <div className="terms-summary">
                <h3>Summary of Key Terms:</h3>
                <ul>
                  <li>You must be at least 13 years old to use this service</li>
                  <li>You are responsible for maintaining the confidentiality of your account</li>
                  <li>You agree not to post unlawful, harmful, or harassing content</li>
                  <li>You retain ownership of content you post, but grant us a license to use it</li>
                  <li>We reserve the right to terminate accounts that violate these terms</li>
                  <li>We provide the service "as is" without warranties</li>
                </ul>
                <p className="terms-full-link">
                  <Link to="/terms" target="_blank">Read the full Terms of Service</Link>
                </p>
              </div>
            </div>
            <div className="terms-modal-footer">
              <button className="terms-decline-btn" onClick={handleDeclineTerms}>
                Decline
              </button>
              <button className="terms-accept-btn" onClick={handleAcceptTerms}>
                I Accept
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

