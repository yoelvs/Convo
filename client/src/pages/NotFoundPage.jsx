import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/pages/NotFoundPage.css';

export const NotFoundPage = () => {
  return (
    <div className="not-found-page">
      <div className="not-found-container">
        <h1>404</h1>
        <h2>Page Not Found</h2>
        <p>The page you're looking for doesn't exist.</p>
        <Link to="/chats" className="home-link">
          Go to Chats
        </Link>
      </div>
    </div>
  );
};

