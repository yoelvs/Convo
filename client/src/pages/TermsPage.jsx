import React from 'react';
import '../styles/pages/TermsPage.css';

export const TermsPage = () => {
  return (
    <div className="terms-page">
      <div className="terms-container">
        <h1>Terms of Service</h1>
        <p className="last-updated">Last updated: {new Date().toLocaleDateString()}</p>
        
        <section>
          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing and using 💬 Convo, you accept and agree to be bound by the terms and provision of this agreement.
          </p>
        </section>

        <section>
          <h2>2. Use License</h2>
          <p>
            Permission is granted to temporarily use 💬 Convo for personal, non-commercial transitory viewing only. 
            This is the grant of a license, not a transfer of title, and under this license you may not:
          </p>
          <ul>
            <li>Modify or copy the materials</li>
            <li>Use the materials for any commercial purpose or for any public display</li>
            <li>Attempt to decompile or reverse engineer any software</li>
            <li>Remove any copyright or other proprietary notations from the materials</li>
          </ul>
        </section>

        <section>
          <h2>3. User Accounts</h2>
          <p>
            You are responsible for maintaining the confidentiality of your account and password. 
            You agree to accept responsibility for all activities that occur under your account.
          </p>
        </section>

        <section>
          <h2>4. User Conduct</h2>
          <p>You agree not to:</p>
          <ul>
            <li>Post or transmit any content that is unlawful, harmful, threatening, abusive, or harassing</li>
            <li>Impersonate any person or entity</li>
            <li>Interfere with or disrupt the service or servers</li>
            <li>Collect or store personal data about other users</li>
          </ul>
        </section>

        <section>
          <h2>5. Content</h2>
          <p>
            You retain ownership of any content you post on 💬 Convo. However, by posting content, 
            you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, and distribute your content.
          </p>
        </section>

        <section>
          <h2>6. Termination</h2>
          <p>
            We reserve the right to terminate or suspend your account and access to the service immediately, 
            without prior notice, for conduct that we believe violates these Terms of Service or is harmful to other users.
          </p>
        </section>

        <section>
          <h2>7. Disclaimer</h2>
          <p>
            The materials on 💬 Convo are provided on an 'as is' basis. We make no warranties, 
            expressed or implied, and hereby disclaim and negate all other warranties including, without limitation, 
            implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement.
          </p>
        </section>

        <section>
          <h2>8. Limitations</h2>
          <p>
            In no event shall 💬 Convo or its suppliers be liable for any damages (including, without limitation, 
            damages for loss of data or profit, or due to business interruption) arising out of the use or inability 
            to use the materials on 💬 Convo.
          </p>
        </section>

        <section>
          <h2>9. Changes to Terms</h2>
          <p>
            We reserve the right to revise these terms of service at any time without notice. By using this website, 
            you are agreeing to be bound by the then current version of these terms of service.
          </p>
        </section>

        <section>
          <h2>10. Contact Information</h2>
          <p>
            If you have any questions about these Terms of Service, please contact us through our Contact page.
          </p>
        </section>
      </div>
    </div>
  );
};
