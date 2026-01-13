import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/pages/DocsPage.css';

export const DocsPage = () => {
  return (
    <div className="docs-page">
      <div className="docs-container">
        <h1>Documentation</h1>
        <p className="docs-intro">
          Welcome to the 💬 Convo documentation. Here you'll find guides, tutorials, 
          and reference materials to help you get the most out of our platform.
        </p>

        <div className="docs-grid">
          <div className="docs-section">
            <h2>🚀 Getting Started</h2>
            <ul>
              <li><Link to="/docs/getting-started">Quick Start Guide</Link></li>
              <li><Link to="/docs/account-setup">Setting Up Your Account</Link></li>
              <li><Link to="/docs/profile">Customizing Your Profile</Link></li>
              <li><Link to="/docs/first-steps">Your First Steps</Link></li>
            </ul>
          </div>

          <div className="docs-section">
            <h2>💬 Chat Features</h2>
            <ul>
              <li><Link to="/docs/chat-basics">Chat Basics</Link></li>
              <li><Link to="/docs/group-chats">Creating Group Chats</Link></li>
              <li><Link to="/docs/messages">Sending Messages</Link></li>
              <li><Link to="/docs/attachments">Sharing Files & Media</Link></li>
              <li><Link to="/docs/emoji">Using Emojis</Link></li>
            </ul>
          </div>

          <div className="docs-section">
            <h2>👥 Social Features</h2>
            <ul>
              <li><Link to="/docs/friends">Managing Friends</Link></li>
              <li><Link to="/docs/friend-requests">Friend Requests</Link></li>
              <li><Link to="/docs/posts">Creating Posts</Link></li>
              <li><Link to="/docs/chats">Using Your Chats</Link></li>
            </ul>
          </div>

          <div className="docs-section">
            <h2>⚙️ Settings & Privacy</h2>
            <ul>
              <li><Link to="/docs/settings">Account Settings</Link></li>
              <li><Link to="/docs/privacy-controls">Privacy Controls</Link></li>
              <li><Link to="/docs/theme">Dark Mode & Themes</Link></li>
              <li><Link to="/docs/notifications">Notification Settings</Link></li>
            </ul>
          </div>

          <div className="docs-section">
            <h2>🔒 Security & Safety</h2>
            <ul>
              <li><Link to="/docs/security">Security Best Practices</Link></li>
              <li><Link to="/docs/reporting">Reporting Issues</Link></li>
              <li><Link to="/docs/blocking">Blocking Users</Link></li>
              <li><Link to="/docs/password">Password Security</Link></li>
            </ul>
          </div>

          <div className="docs-section">
            <h2>❓ Troubleshooting</h2>
            <ul>
              <li><Link to="/docs/common-issues">Common Issues</Link></li>
              <li><Link to="/docs/connection-problems">Connection Problems</Link></li>
              <li><Link to="/docs/mobile">Mobile App Help</Link></li>
              <li><Link to="/docs/faq">Frequently Asked Questions</Link></li>
            </ul>
          </div>
        </div>

        <div className="docs-quick-links">
          <h2>Quick Links</h2>
          <div className="quick-links-grid">
            <Link to="/docs/api" className="quick-link">
              <h3>🔌 API Reference</h3>
              <p>Developer API documentation</p>
            </Link>
            <Link to="/docs/changelog" className="quick-link">
              <h3>📝 Changelog</h3>
              <p>Recent updates and changes</p>
            </Link>
            <Link to="/contact" className="quick-link">
              <h3>💬 Contact Support</h3>
              <p>Get help from our team</p>
            </Link>
            <Link to="/docs/contributing" className="quick-link">
              <h3>🤝 Contributing</h3>
              <p>How to contribute to the project</p>
            </Link>
          </div>
        </div>

        <div className="docs-note">
          <p>
            <strong>Note:</strong> This documentation is continuously updated. If you can't find what you're looking for, 
            please <Link to="/contact">contact us</Link> and we'll be happy to help!
          </p>
        </div>
      </div>
    </div>
  );
};
