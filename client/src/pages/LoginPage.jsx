import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { authApi } from '../api/authApi';
import '../styles/pages/LoginPage.css';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const [forgotPasswordMessage, setForgotPasswordMessage] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);
    if (result.success) {
      navigate('/chat');
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setForgotPasswordMessage('');
    setForgotPasswordLoading(true);

    try {
      const result = await authApi.forgotPassword(forgotPasswordEmail);
      setForgotPasswordMessage(result.message || 'Password reset instructions have been sent to your email.');
      setForgotPasswordEmail('');
      setTimeout(() => {
        setShowForgotPassword(false);
        setForgotPasswordMessage('');
      }, 3000);
    } catch (error) {
      setForgotPasswordMessage(error.response?.data?.error || 'Failed to send password reset email. Please try again.');
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <Link to="/home" style={{ textDecoration: 'none', color: 'inherit' }}>
          <h1>💬 Convo</h1>
        </Link>
        <p className="subtitle">The Best Social Network</p>
        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}
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
            />
            <button
              type="button"
              onClick={() => setShowForgotPassword(true)}
              className="forgot-password-link"
              style={{
                background: 'none',
                border: 'none',
                color: '#007bff',
                cursor: 'pointer',
                padding: '5px 0',
                fontSize: '14px',
                textAlign: 'left',
                marginTop: '5px',
              }}
            >
              Forgot password?
            </button>
          </div>
          <button type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        {showForgotPassword && (
          <div className="forgot-password-form" style={{
            marginTop: '20px',
            padding: '20px',
            border: '1px solid #ddd',
            borderRadius: '5px',
            backgroundColor: '#f9f9f9',
          }}>
            <h3>Reset Password</h3>
            <form onSubmit={handleForgotPassword}>
              {forgotPasswordMessage && (
                <div className={forgotPasswordMessage.includes('error') || forgotPasswordMessage.includes('Failed') ? 'error-message' : 'success-message'} style={{
                  padding: '10px',
                  marginBottom: '10px',
                  borderRadius: '4px',
                  backgroundColor: forgotPasswordMessage.includes('error') || forgotPasswordMessage.includes('Failed') ? '#f8d7da' : '#d4edda',
                  color: forgotPasswordMessage.includes('error') || forgotPasswordMessage.includes('Failed') ? '#721c24' : '#155724',
                }}>
                  {forgotPasswordMessage}
                </div>
              )}
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={forgotPasswordEmail}
                  onChange={(e) => setForgotPasswordEmail(e.target.value)}
                  placeholder="Enter your email address"
                  required
                />
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" disabled={forgotPasswordLoading}>
                  {forgotPasswordLoading ? 'Sending...' : 'Send Reset Link'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotPassword(false);
                    setForgotPasswordEmail('');
                    setForgotPasswordMessage('');
                  }}
                  style={{ backgroundColor: '#6c757d' }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap', fontSize: '0.9rem', marginTop: '1rem', alignItems: 'center' }}>
          <p className="signup-link" style={{ margin: 0 }}>
            Don't have an account? <Link to="/signup">Sign up</Link>
          </p>
          <span style={{ color: 'var(--gray-500)' }}>•</span>
          <Link to="/home" className="home-link">
            Home
          </Link>
        </div>
      </div>
    </div>
  );
};

