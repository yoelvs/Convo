import React from 'react';
import '../styles/pages/PrivacyPage.css';

export const PrivacyPage = () => {
  return (
    <div className="privacy-page">
      <div className="privacy-container">
        <h1>Privacy Policy</h1>
        <p className="last-updated">Last updated: {new Date().toLocaleDateString()}</p>
        
        <section>
          <h2>1. Introduction</h2>
          <p>
            Welcome to 💬 Convo. We respect your privacy and are committed to protecting your personal data. 
            This privacy policy explains how we collect, use, and safeguard your information when you use our service.
          </p>
        </section>

        <section>
          <h2>2. Information We Collect</h2>
          <h3>2.1 Information You Provide</h3>
          <ul>
            <li>Account information (username, email, password)</li>
            <li>Profile information (avatar, bio, preferences)</li>
            <li>Content you post (messages, posts, images)</li>
            <li>Communication data (messages sent through our platform)</li>
          </ul>

          <h3>2.2 Information Automatically Collected</h3>
          <ul>
            <li>Usage data (how you interact with our service)</li>
            <li>Device information (browser type, operating system)</li>
            <li>IP address and location data</li>
            <li>Cookies and similar tracking technologies</li>
          </ul>
        </section>

        <section>
          <h2>3. How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul>
            <li>Provide, maintain, and improve our services</li>
            <li>Process your transactions and send related information</li>
            <li>Send you technical notices and support messages</li>
            <li>Respond to your comments and questions</li>
            <li>Monitor and analyze trends and usage</li>
            <li>Detect, prevent, and address technical issues</li>
          </ul>
        </section>

        <section>
          <h2>4. Information Sharing</h2>
          <p>We do not sell your personal information. We may share your information only in the following circumstances:</p>
          <ul>
            <li><strong>With your consent:</strong> We may share your information when you explicitly consent</li>
            <li><strong>Service providers:</strong> We may share data with third-party service providers who perform services on our behalf</li>
            <li><strong>Legal requirements:</strong> We may disclose information if required by law or to protect our rights</li>
            <li><strong>Public information:</strong> Information you choose to make public (such as posts) is visible to other users</li>
          </ul>
        </section>

        <section>
          <h2>5. Data Security</h2>
          <p>
            We implement appropriate technical and organizational measures to protect your personal data against 
            unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over 
            the Internet is 100% secure.
          </p>
        </section>

        <section>
          <h2>6. Your Rights</h2>
          <p>You have the right to:</p>
          <ul>
            <li>Access your personal data</li>
            <li>Correct inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Object to processing of your data</li>
            <li>Request restriction of processing</li>
            <li>Data portability</li>
            <li>Withdraw consent at any time</li>
          </ul>
        </section>

        <section>
          <h2>7. Cookies</h2>
          <p>
            We use cookies and similar tracking technologies to track activity on our service and hold certain information. 
            You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. 
            For more information, please visit our Manage Cookies page.
          </p>
        </section>

        <section>
          <h2>8. Children's Privacy</h2>
          <p>
            Our service is not intended for children under 13 years of age. We do not knowingly collect personal 
            information from children under 13. If you are a parent or guardian and believe your child has provided 
            us with personal information, please contact us.
          </p>
        </section>

        <section>
          <h2>9. Changes to This Privacy Policy</h2>
          <p>
            We may update our Privacy Policy from time to time. We will notify you of any changes by posting the 
            new Privacy Policy on this page and updating the "Last updated" date.
          </p>
        </section>

        <section>
          <h2>10. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us through our Contact page.
          </p>
        </section>
      </div>
    </div>
  );
};
