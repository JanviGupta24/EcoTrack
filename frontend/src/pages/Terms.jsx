// src/pages/Terms.jsx
import React, { useState, useEffect, useRef } from 'react';

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

// --- 3. Main TermsPage Component (Refactored) ---
// Now uses AnimatedBlocks and has more professional content
const TermsPage = () => (
  <PageWrapper
    title="Terms of Service"
    subtitle="Please read these terms carefully before using our service."
  >
    <AnimatedBlock delay={100}>
      <p>Last updated: November 8, 2025</p>
      <p>
        By accessing or using the EcoTrack application ("Service"), you are agreeing to be bound by the
        following terms and conditions ("Terms"). If you disagree with any part of the terms,
        then you may not access the Service.
      </p>
    </AnimatedBlock>

    <AnimatedBlock delay={200} className="mt-8">
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">1. Your Account</h2>
      <p>
        You must be at least 13 years old to use EcoTrack. You are responsible for safeguarding
        your account and for all activities that occur under it. You must notify us
        immediately upon becoming aware of any breach of security or unauthorized use of your account.
      </p>
    </AnimatedBlock>
    
    <AnimatedBlock delay={300} className="mt-8">
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">2. Submitting Reports</h2>
      <p>
        You agree to submit accurate and truthful information. You grant EcoTrack a worldwide,
        non-exclusive, royalty-free license to use, reproduce, and display the images and data
        you submit for the purpose of waste management and service improvement.
      </p>
      <p>
        Falsifying reports, submitting spam, or abusing the reporting system may result in
        the suspension or termination of your account.
      </p>
    </AnimatedBlock>

    <AnimatedBlock delay={400} className="mt-8">
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">3. Eco-Points & Rewards</h2>
      <p>
        Eco-Points are a reward for verified, positive contributions to the platform. They are not
        a currency and have no inherent cash value until redeemed through the methods specified in the app.
      </p>
      <p>
        We reserve the right to manage, regulate, control, modify, or eliminate Eco-Points at our
        discretion, and we will have no liability to you based on our exercise of such rights.
        The redemption rates for rewards can be changed at any time.
      </p>
    </AnimatedBlock>

    <AnimatedBlock delay={500} className="mt-8">
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">4. Termination</h2>
      <p>
        We may terminate or suspend your access to our Service immediately, without prior notice or
        liability, for any reason whatsoever, including without limitation if you breach the Terms.
      </p>
    </AnimatedBlock>
    
    <AnimatedBlock delay={600} className="mt-8">
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">5. Changes to These Terms</h2>
      <p>
        We reserve the right, at our sole discretion, to modify or replace these Terms at any time.
        We will provide at least 30 days' notice prior to any new terms taking effect.
        By continuing to access or use our Service after those revisions become effective, you agree
        to be bound by the revised terms.
      </p>
    </AnimatedBlock>
  </PageWrapper>
);

export default TermsPage;