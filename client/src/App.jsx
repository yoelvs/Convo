import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Footer } from './components/Footer';
import { RequireAuth } from './components/RequireAuth';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { FeedPage } from './pages/FeedPage';
import { SettingsPage } from './pages/SettingsPage';
import { FriendsPage } from './pages/FriendsPage';
import { ChatPage } from './pages/ChatPage';
import { TermsPage } from './pages/TermsPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { SecurityPage } from './pages/SecurityPage';
import { ContactPage } from './pages/ContactPage';
import { DocsPage } from './pages/DocsPage';
import { DocDetailPage } from './pages/DocDetailPage';
import { CookiesPage } from './pages/CookiesPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { CookieConsent } from './components/CookieConsent';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import './styles/App.css';

function App() {
  // Initialize keyboard shortcuts globally
  useKeyboardShortcuts();

  return (
    <div className="app">
      <div className="app-content">
        <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route
          path="/chats"
          element={
            <RequireAuth>
              <ChatPage />
            </RequireAuth>
          }
        />
        <Route
          path="/feed"
          element={
            <RequireAuth>
              <FeedPage />
            </RequireAuth>
          }
        />
        <Route
          path="/settings"
          element={
            <RequireAuth>
              <SettingsPage />
            </RequireAuth>
          }
        />
        <Route
          path="/friends"
          element={
            <RequireAuth>
              <FriendsPage />
            </RequireAuth>
          }
        />
        <Route
          path="/chat"
          element={
            <RequireAuth>
              <ChatPage />
            </RequireAuth>
          }
        />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/security" element={<SecurityPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/docs" element={<DocsPage />} />
        <Route path="/docs/:docId" element={<DocDetailPage />} />
        <Route path="/cookies" element={<CookiesPage />} />
        <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>
      <Footer />
      <CookieConsent />
    </div>
  );
}

export default App;

