import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/components/Footer.css';

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-links">
          <Link to="/terms" className="footer-link">Terms</Link>
          <Link to="/privacy" className="footer-link">Privacy</Link>
          <Link to="/security" className="footer-link">Security</Link>
          <Link to="/contact" className="footer-link">Contact</Link>
          <Link to="/docs" className="footer-link">Docs</Link>
          <Link to="/cookies" className="footer-link">Manage Cookies</Link>
        </div>
        <p className="footer-text">
          © {currentYear} 💬 Convo. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

