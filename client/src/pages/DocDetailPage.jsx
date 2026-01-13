import React from 'react';
import { useParams, Link } from 'react-router-dom';
import '../styles/pages/DocDetailPage.css';

const docContent = {
  'getting-started': {
    title: 'Quick Start Guide',
    content: (
      <>
        <p>Welcome to 💬 Convo! This guide will help you get started quickly.</p>
        <h2>Step 1: Create Your Account</h2>
        <p>Sign up with your email and choose a unique username. You can also upload a profile picture.</p>
        <h2>Step 2: Explore Your Feed</h2>
        <p>Once logged in, you'll see posts from your friends in your feed.</p>
        <h2>Step 3: Add Friends</h2>
        <p>Search for users and send friend requests to connect with others.</p>
        <h2>Step 4: Start Chatting</h2>
        <p>Click on any friend to start a conversation or create a group chat.</p>
      </>
    )
  },
  'account-setup': {
    title: 'Setting Up Your Account',
    content: (
      <>
        <p>After signing up, customize your account to make it yours.</p>
        <h2>Profile Information</h2>
        <p>Go to Settings to update your username, bio, and profile picture.</p>
        <h2>Privacy Settings</h2>
        <p>Control who can see your online status and manage your privacy preferences.</p>
        <h2>Theme Preferences</h2>
        <p>Choose between light and dark mode in Settings.</p>
      </>
    )
  },
  'profile': {
    title: 'Customizing Your Profile',
    content: (
      <>
        <p>Make your profile unique and reflect your personality.</p>
        <h2>Profile Picture</h2>
        <p>Upload a profile picture that represents you. It will be visible to all users.</p>
        <h2>Bio</h2>
        <p>Add a short bio to tell others about yourself.</p>
        <h2>Username</h2>
        <p>Choose a username that others can use to find you.</p>
      </>
    )
  },
  'first-steps': {
    title: 'Your First Steps',
    content: (
      <>
        <p>Here's what to do after creating your account:</p>
        <ol>
          <li>Complete your profile with a picture and bio</li>
          <li>Search for friends and send friend requests</li>
          <li>Create your first post</li>
          <li>Start chatting with friends</li>
        </ol>
      </>
    )
  },
  'chat-basics': {
    title: 'Chat Basics',
    content: (
      <>
        <p>Learn the fundamentals of chatting on 💬 Convo.</p>
        <h2>Starting a Chat</h2>
        <p>Click on any friend in your friends list or search for a user to start a conversation.</p>
        <h2>Sending Messages</h2>
        <p>Type your message in the input field and press Send or Enter.</p>
        <h2>Reading Messages</h2>
        <p>Messages are displayed in chronological order. Unread messages are highlighted.</p>
      </>
    )
  },
  'group-chats': {
    title: 'Creating Group Chats',
    content: (
      <>
        <p>Create group chats to talk with multiple friends at once.</p>
        <h2>Creating a Group</h2>
        <p>Use the "💬 Chats Selection" option in the navbar to select multiple friends and create a group chat.</p>
        <h2>Managing Groups</h2>
        <p>Group creators can add or remove members, change the group name, and manage group settings.</p>
        <h2>Group Features</h2>
        <p>Groups support all the same features as individual chats, including file sharing and emojis.</p>
      </>
    )
  },
  'messages': {
    title: 'Sending Messages',
    content: (
      <>
        <p>Send messages to friends and groups easily.</p>
        <h2>Text Messages</h2>
        <p>Type your message and press Send. Messages are delivered instantly.</p>
        <h2>File Attachments</h2>
        <p>Click the attach button to share files, images, friends, or your location.</p>
        <h2>Emojis</h2>
        <p>Use the emoji button to add emojis to your messages.</p>
      </>
    )
  },
  'attachments': {
    title: 'Sharing Files & Media',
    content: (
      <>
        <p>Share various types of content with your friends.</p>
        <h2>Files</h2>
        <p>Upload documents, images, and other files up to 10MB.</p>
        <h2>Sharing Friends</h2>
        <p>Share friend profiles with others in your chats.</p>
        <h2>Location Sharing</h2>
        <p>Share your current location with friends.</p>
      </>
    )
  },
  'emoji': {
    title: 'Using Emojis',
    content: (
      <>
        <p>Express yourself with emojis in your messages.</p>
        <h2>Emoji Picker</h2>
        <p>Click the emoji button in the chat input to open the emoji picker.</p>
        <h2>Common Emojis</h2>
        <p>Quick access to frequently used emojis is available in the picker.</p>
        <h2>Emoji in Messages</h2>
        <p>Click any emoji to add it to your message.</p>
      </>
    )
  },
  'friends': {
    title: 'Managing Friends',
    content: (
      <>
        <p>Build your network by adding and managing friends.</p>
        <h2>Adding Friends</h2>
        <p>Search for users and send friend requests. Once accepted, they'll appear in your friends list.</p>
        <h2>Removing Friends</h2>
        <p>You can remove friends from your list at any time.</p>
        <h2>Starred Friends</h2>
        <p>Mark friends as starred to quickly access them in the chat sidebar.</p>
      </>
    )
  },
  'friend-requests': {
    title: 'Friend Requests',
    content: (
      <>
        <p>Manage incoming and outgoing friend requests.</p>
        <h2>Receiving Requests</h2>
        <p>When someone sends you a friend request, you'll see it in your Friends page.</p>
        <h2>Accepting Requests</h2>
        <p>Click Accept to add the user to your friends list.</p>
        <h2>Sending Requests</h2>
        <p>Search for users and click "Add Friend" to send a request.</p>
      </>
    )
  },
  'posts': {
    title: 'Creating Posts',
    content: (
      <>
        <p>Share your thoughts and updates with friends.</p>
        <h2>Creating a Post</h2>
        <p>Go to your Feed page and use the post composer to create a new post.</p>
        <h2>Post Content</h2>
        <p>Add text, images, or both to your posts.</p>
        <h2>Deleting Posts</h2>
        <p>You can delete your own posts at any time.</p>
      </>
    )
  },
  'chats': {
    title: 'Using Your Chats',
    content: (
      <>
        <p>Manage and organize your conversations.</p>
        <h2>Chat List</h2>
        <p>View all your conversations in the chat sidebar. Filter by All, Unread, Starred, or Groups.</p>
        <h2>Starting Chats</h2>
        <p>Select friends or groups to start new conversations using the "💬 Chats Selection" option.</p>
        <h2>Organizing Chats</h2>
        <p>Star important conversations to quickly access them. Mark messages as read to keep track of unread conversations.</p>
      </>
    )
  },
  'settings': {
    title: 'Account Settings',
    content: (
      <>
        <p>Customize your account settings to your preferences.</p>
        <h2>Profile Settings</h2>
        <p>Update your username, bio, and profile picture.</p>
        <h2>Email & Password</h2>
        <p>Change your email address or password from Settings.</p>
        <h2>Privacy Settings</h2>
        <p>Control your online status visibility and other privacy options.</p>
      </>
    )
  },
  'privacy-controls': {
    title: 'Privacy Controls',
    content: (
      <>
        <p>Control who can see your information and activity.</p>
        <h2>Online Status</h2>
        <p>Toggle your online status visibility in Settings.</p>
        <h2>Profile Visibility</h2>
        <p>Your profile is visible to all users, but you control what information is shown.</p>
        <h2>Privacy Policy</h2>
        <p>Read our Privacy Policy to understand how we protect your data.</p>
      </>
    )
  },
  'theme': {
    title: 'Dark Mode & Themes',
    content: (
      <>
        <p>Customize the appearance of 💬 Convo.</p>
        <h2>Dark Mode</h2>
        <p>Toggle dark mode in Settings to switch between light and dark themes.</p>
        <h2>Theme Persistence</h2>
        <p>Your theme preference is saved and will be applied automatically when you log in.</p>
      </>
    )
  },
  'notifications': {
    title: 'Notification Settings',
    content: (
      <>
        <p>Manage how you receive notifications.</p>
        <h2>Notification Types</h2>
        <p>Control notifications for messages, friend requests, and other activities.</p>
        <h2>Email Notifications</h2>
        <p>Enable or disable email notifications in Settings.</p>
      </>
    )
  },
  'security': {
    title: 'Security Best Practices',
    content: (
      <>
        <p>Keep your account secure with these tips.</p>
        <h2>Strong Passwords</h2>
        <p>Use a strong, unique password for your account.</p>
        <h2>Account Security</h2>
        <p>Never share your password with anyone.</p>
        <h2>Reporting Issues</h2>
        <p>Report any security concerns immediately through our Contact page.</p>
      </>
    )
  },
  'reporting': {
    title: 'Reporting Issues',
    content: (
      <>
        <p>Report problems or concerns to keep the community safe.</p>
        <h2>How to Report</h2>
        <p>Use the Contact page to report issues, bugs, or security concerns.</p>
        <h2>What to Report</h2>
        <p>Report inappropriate content, harassment, or technical issues.</p>
      </>
    )
  },
  'blocking': {
    title: 'Blocking Users',
    content: (
      <>
        <p>Block users who are causing problems.</p>
        <h2>Blocking a User</h2>
        <p>You can block users from their profile or chat.</p>
        <h2>Blocked Users</h2>
        <p>Blocked users cannot contact you or see your posts.</p>
      </>
    )
  },
  'password': {
    title: 'Password Security',
    content: (
      <>
        <p>Keep your password secure to protect your account.</p>
        <h2>Password Requirements</h2>
        <p>Use at least 6 characters. Longer passwords with numbers and symbols are more secure.</p>
        <h2>Changing Your Password</h2>
        <p>Update your password regularly in Settings.</p>
        <h2>Password Recovery</h2>
        <p>Keep your email address updated for password recovery.</p>
      </>
    )
  },
  'common-issues': {
    title: 'Common Issues',
    content: (
      <>
        <p>Solutions to frequently encountered problems.</p>
        <h2>Connection Issues</h2>
        <p>Check your internet connection and try refreshing the page.</p>
        <h2>Messages Not Sending</h2>
        <p>Ensure you're connected to the internet and try again.</p>
        <h2>Profile Not Loading</h2>
        <p>Clear your browser cache and refresh the page.</p>
      </>
    )
  },
  'connection-problems': {
    title: 'Connection Problems',
    content: (
      <>
        <p>Troubleshoot connection issues.</p>
        <h2>Check Internet Connection</h2>
        <p>Ensure you have a stable internet connection.</p>
        <h2>Browser Issues</h2>
        <p>Try using a different browser or clearing your browser cache.</p>
        <h2>Server Status</h2>
        <p>If problems persist, the server may be experiencing issues. Try again later.</p>
      </>
    )
  },
  'mobile': {
    title: 'Mobile App Help',
    content: (
      <>
        <p>Using 💬 Convo on mobile devices.</p>
        <h2>Mobile Browser</h2>
        <p>Access 💬 Convo through your mobile browser for the best experience.</p>
        <h2>Mobile Features</h2>
        <p>All features are available on mobile devices with responsive design.</p>
      </>
    )
  },
  'faq': {
    title: 'Frequently Asked Questions',
    content: (
      <>
        <h2>How do I add friends?</h2>
        <p>Go to the Friends page and search for users. Click "Add Friend" to send a request.</p>
        <h2>Can I delete my posts?</h2>
        <p>Yes, you can delete your own posts at any time.</p>
        <h2>How do I change my password?</h2>
        <p>Go to Settings and use the password change option.</p>
        <h2>Is my data secure?</h2>
        <p>Yes, we use encryption and follow security best practices. See our Security page for details.</p>
      </>
    )
  },
  'api': {
    title: 'API Reference',
    content: (
      <>
        <p>Developer API documentation for 💬 Convo.</p>
        <h2>Authentication</h2>
        <p>API endpoints require authentication using JWT tokens.</p>
        <h2>Endpoints</h2>
        <p>RESTful API endpoints are available for posts, users, friends, and chat functionality.</p>
        <h2>WebSocket</h2>
        <p>Real-time features use WebSocket connections for instant updates.</p>
      </>
    )
  },
  'changelog': {
    title: 'Changelog',
    content: (
      <>
        <p>Recent updates and changes to 💬 Convo.</p>
        <h2>Latest Features</h2>
        <ul>
          <li>Dark mode support</li>
          <li>File attachments in chat</li>
          <li>Group chat management</li>
          <li>Starred conversations</li>
          <li>Unread message tracking</li>
        </ul>
        <h2>Improvements</h2>
        <p>Continuous improvements to performance, security, and user experience.</p>
      </>
    )
  },
  'contributing': {
    title: 'Contributing',
    content: (
      <>
        <p>How to contribute to 💬 Convo.</p>
        <h2>Reporting Bugs</h2>
        <p>Use the Contact page to report bugs and issues.</p>
        <h2>Feature Requests</h2>
        <p>Suggest new features through the Contact page.</p>
        <h2>Code Contributions</h2>
        <p>For code contributions, please contact us for access to the repository.</p>
      </>
    )
  }
};

export const DocDetailPage = () => {
  const { docId } = useParams();
  const doc = docContent[docId];

  if (!doc) {
    return (
      <div className="doc-detail-page">
        <div className="doc-detail-container">
          <h1>Documentation Not Found</h1>
          <p>The documentation page you're looking for doesn't exist.</p>
          <Link to="/docs" className="back-link">← Back to Documentation</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="doc-detail-page">
      <div className="doc-detail-container">
        <Link to="/docs" className="back-link">← Back to Documentation</Link>
        <h1>{doc.title}</h1>
        <div className="doc-content">
          {doc.content}
        </div>
      </div>
    </div>
  );
};
