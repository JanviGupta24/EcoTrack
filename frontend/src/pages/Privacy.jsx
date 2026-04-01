// src/pages/Privacy.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Lock, Cookie, UserCheck } from 'lucide-react';

// We assume the keyframes 'animate-slideInUp' and 'fadeIn' are defined globally
// in your App.js or index.css, as established in previous files.

// --- 1. Modern Animation Hook & Component ---
const useIntersectionObserver = (options) => {
  const [entry, setEntry] = useState(null);
  const [node, setNode] = useState(null);

  const observer = useRef(
    new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setEntry(entry);
        if (observer.current) {
          observer.current.disconnect();
        }
      }
    }, options)
  );

  useEffect(() => {
    const { current: currentObserver } = observer;
    currentObserver.disconnect();
    if (node) currentObserver.observe(node);
    return () => currentObserver.disconnect();
  }, [node]);

  return [setNode, entry?.isIntersecting];
};

const AnimatedBlock = ({ children, className = '', delay = 0 }) => {
  const [ref, isVisible] = useIntersectionObserver({ threshold: 0.1 });
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${className} ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

// --- 2. Professional PageWrapper (Enhanced) ---
const PageWrapper = ({ title, subtitle, children }) => (
  // pt-32 offsets the fixed public navbar (assumed from App.js structure)
  <div className="pt-32 pb-20 bg-white dark:bg-gray-900 animate-fadeIn">
    <div className="max-w-4xl mx-auto px-4">
      <AnimatedBlock>
        <h1 className="text-5xl font-extrabold text-gray-900 dark:text-white mb-4">{title}</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-12">{subtitle}</p>
      </AnimatedBlock>
      {/* The 'prose' class is great for styling text content */}
      <div className="prose dark:prose-invert prose-lg max-w-none text-gray-700 dark:text-gray-300">
        {children}
      </div>
    </div>
  </div>
);

// --- 3. Main PrivacyPage Component (Refactored) ---
const PrivacyPage = () => (
  <PageWrapper
    title="Privacy Policy"
    subtitle="Your privacy is critically important to us."
  >
    <AnimatedBlock delay={100}>
      <p>Last updated: November 8, 2025</p>
      <p>
        EcoTrack ("us", "we", or "our") operates the EcoTrack mobile application and website (the "Service").
        This page informs you of our policies regarding the collection, use, and disclosure of personal data
        when you use our Service and the choices you have associated with that data.
      </p>
    </AnimatedBlock>

    <AnimatedBlock delay={200} className="mt-8">
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Information We Collect</h2>
      <p>We collect several different types of information for various purposes to provide and improve our Service to you.</p>
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-4 mb-2">Personal Data</h3>
      <ul className="list-disc pl-6">
        <li><strong>Identity Data:</strong> Name, email address, phone number.</li>
        <li><strong>Location Data:</strong> Precise geolocation (latitude and longitude) when you submit a report.</li>
        <li><strong>User Content:</strong> Photos and descriptions you upload for waste reporting.</li>
        <li><strong>Usage Data:</strong> Information on how you interact with our Service, including report history, app usage, and feature engagement.</li>
      </ul>
    </AnimatedBlock>

    <AnimatedBlock delay={300} className="mt-8">
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">How We Use Your Information</h2>
      <p>EcoTrack uses the collected data for various purposes:</p>
      <ul className="list-disc pl-6">
        <li>To provide and maintain our Service.</li>
        <li>To manage your account, authenticate you, and reward eco-points.</li>
        <li>To coordinate with waste collection workers and dispatch them to report locations.</li>
        <li>To improve our AI models for waste classification (all data used for training is anonymized).</li>
        <li>To notify you about changes to our Service or updates on your reports.</li>
      </ul>
    </AnimatedBlock>

    {/* --- 4. NEW Professional Sections --- */}
    
    <AnimatedBlock delay={400} className="mt-8 not-prose grid md:grid-cols-2 gap-6">
      <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 shadow-lg">
        <Lock className="w-10 h-10 text-blue-500 mb-3" />
        <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">Data Security</h3>
        <p className="text-gray-600 dark:text-gray-400">
          We use strong encryption (SSL) for all data in transit and at rest. Access to personal data
          is strictly limited to personnel who need it to perform their jobs.
        </p>
      </div>
      <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 shadow-lg">
        <Cookie className="w-10 h-10 text-green-500 mb-3" />
        <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">Cookies</h3>
        <p className="text-gray-600 dark:text-gray-400">
          We use essential cookies to keep you logged in and to remember your preferences (like dark mode).
          We do not use third-party tracking or advertising cookies.
        </p>
      </div>
    </AnimatedBlock>

    <AnimatedBlock delay={500} className="mt-8">
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Your Data Rights</h2>
      <p>You have the right to access, update, or delete your personal information at any time. You can do this by:</p>
      <ul className="list-disc pl-6">
        <li>Visiting your "Profile" page within the app.</li>
        <li>Contacting us directly through our "Contact" page to request data deletion.</li>
      </ul>
    </AnimatedBlock>
    
    <AnimatedBlock delay={600} className="mt-8">
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Changes to This Policy</h2>
      <p>
        We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new
        Privacy Policy on this page. You are advised to review this page periodically for any changes.
      </p>
    </AnimatedBlock>
  </PageWrapper>
);

export default PrivacyPage;