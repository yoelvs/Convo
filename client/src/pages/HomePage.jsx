import React from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import '../styles/pages/HomePage.css';

export const HomePage = () => {
  return (
    <div className="home-page">
      <div className="home-container">
        <div className="home-hero">
          <div className="home-logo">
            <MessageCircle size={80} className="logo-icon-large" />
            <h1 className="home-title">💬 Convo</h1>
          </div>
          <p className="home-subtitle">Connect, Chat, and Share with Friends</p>
          <p className="home-description">
            A modern social networking platform where you can chat with friends, 
            share posts, and stay connected with your community.
          </p>
          <div className="home-actions">
            <Link to="/signup" className="home-btn primary">
              Get Started
            </Link>
            <Link to="/login" className="home-btn secondary">
              Sign In
            </Link>
          </div>
        </div>

        <div className="home-features">
          <div className="feature-card">
            <div className="feature-icon">💬</div>
            <h3 className="feature-title">Real-time Chat</h3>
            <p className="feature-description">
              Chat with friends instantly with our real-time messaging system. 
              Create group chats and stay connected.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">👥</div>
            <h3 className="feature-title">Social Network</h3>
            <p className="feature-description">
              Connect with friends, share posts, and discover new people in your community.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔒</div>
            <h3 className="feature-title">Secure & Private</h3>
            <p className="feature-description">
              Your privacy is our priority. All your conversations and data are encrypted and secure.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
