import React from 'react';
import '../styles/pages/SecurityPage.css';

export const SecurityPage = () => {
  return (
    <div className="security-page">
      <div className="security-container">
        <h1>Security</h1>
        <p className="last-updated">Last updated: {new Date().toLocaleDateString()}</p>
        
        <section>
          <h2>Our Commitment to Security</h2>
          <p>
            At 💬 Convo, we take security seriously. We implement industry-standard security measures 
            to protect your data and ensure a safe experience for all users.
          </p>
        </section>

        <section>
          <h2>1. Account Security</h2>
          <h3>Password Protection</h3>
          <ul>
            <li>Use a strong, unique password for your account</li>
            <li>Never share your password with anyone</li>
            <li>Change your password regularly</li>
            <li>Enable two-factor authentication if available</li>
          </ul>

          <h3>Account Access</h3>
          <ul>
            <li>Log out from shared or public devices</li>
            <li>Review your active sessions regularly</li>
            <li>Report suspicious activity immediately</li>
          </ul>
        </section>

        <section>
          <h2>2. Data Encryption</h2>
          <p>
            We use encryption to protect your data both in transit and at rest:
          </p>
          <ul>
            <li><strong>HTTPS:</strong> All data transmitted between your device and our servers is encrypted using SSL/TLS</li>
            <li><strong>Database encryption:</strong> Sensitive data stored in our databases is encrypted</li>
            <li><strong>Password hashing:</strong> Passwords are hashed using secure algorithms and never stored in plain text</li>
          </ul>
        </section>

        <section>
          <h2>3. Secure Communication</h2>
          <p>
            All messages sent through 💬 Convo are transmitted securely. However, please be aware that:
          </p>
          <ul>
            <li>Messages are stored on our servers and may be accessible to administrators</li>
            <li>Do not share sensitive information (passwords, credit card numbers) through messages</li>
            <li>Be cautious when sharing personal information with other users</li>
          </ul>
        </section>

        <section>
          <h2>4. Protection Against Threats</h2>
          <h3>We protect against:</h3>
          <ul>
            <li>SQL injection attacks</li>
            <li>Cross-site scripting (XSS)</li>
            <li>Cross-site request forgery (CSRF)</li>
            <li>Brute force attacks</li>
            <li>DDoS attacks</li>
            <li>Malware and viruses</li>
          </ul>
        </section>

        <section>
          <h2>5. Regular Security Updates</h2>
          <p>
            We regularly update our systems and applications to address security vulnerabilities and improve protection. 
            We monitor security advisories and apply patches promptly.
          </p>
        </section>

        <section>
          <h2>6. Reporting Security Issues</h2>
          <p>
            If you discover a security vulnerability or have concerns about security, please report it to us immediately 
            through our Contact page. We appreciate responsible disclosure and will investigate all reports promptly.
          </p>
        </section>

        <section>
          <h2>7. Best Practices for Users</h2>
          <h3>Keep Your Account Safe:</h3>
          <ul>
            <li>Use a strong, unique password</li>
            <li>Be cautious of phishing attempts</li>
            <li>Verify the identity of users before sharing personal information</li>
            <li>Keep your device and browser updated</li>
            <li>Use antivirus software</li>
            <li>Be wary of suspicious links or attachments</li>
          </ul>
        </section>

        <section>
          <h2>8. Data Breach Procedures</h2>
          <p>
            In the unlikely event of a data breach, we will:
          </p>
          <ul>
            <li>Investigate the breach immediately</li>
            <li>Notify affected users as soon as possible</li>
            <li>Take steps to prevent further unauthorized access</li>
            <li>Work with relevant authorities if necessary</li>
            <li>Provide guidance on protective measures</li>
          </ul>
        </section>

        <section>
          <h2>9. Third-Party Services</h2>
          <p>
            We may use third-party services that have their own security measures. While we choose reputable providers, 
            we are not responsible for their security practices. Please review their privacy and security policies.
          </p>
        </section>

        <section>
          <h2>10. Contact Us</h2>
          <p>
            If you have security concerns or questions, please contact us through our Contact page.
          </p>
        </section>
      </div>
    </div>
  );
};
