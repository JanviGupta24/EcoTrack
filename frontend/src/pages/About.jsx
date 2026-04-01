// src/pages/About.jsx
import React from "react";
import { Users, Target, Eye, Leaf } from "lucide-react";

/* 🌿 Animated Wrapper */
const AnimatedBlock = ({ children, delay = 0, className = "" }) => (
  <div
    className={`animate-slideInUp opacity-0 ${className}`}
    style={{ animationDelay: `${delay}ms` }}
  >
    {children}
  </div>
);

/* 🌍 Page Wrapper (Consistent with PublicLayout Spacing) */
const PageWrapper = ({ title, subtitle, children }) => (
  <div className="pt-32 pb-20 bg-white dark:bg-gray-900 transition-colors duration-300">
    <div className="max-w-4xl mx-auto px-4">
      <AnimatedBlock delay={0}>
        <h1 className="text-5xl font-extrabold text-gray-900 dark:text-white mb-4">
          {title}
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-12">
          {subtitle}
        </p>
      </AnimatedBlock>
      <div className="prose dark:prose-invert prose-lg max-w-none text-gray-700 dark:text-gray-300 leading-relaxed">
        {children}
      </div>
    </div>
  </div>
);

/* 🌟 Info Card Component */
const InfoCard = ({ icon, title, text }) => (
  <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-850 rounded-xl p-6 shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300">
    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg flex items-center justify-center mb-4">
      {icon}
    </div>
    <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
      {title}
    </h3>
    <p className="text-gray-600 dark:text-gray-400">{text}</p>
  </div>
);

/* 👥 Team Member Card */
const TeamCard = ({ name, role, avatar }) => (
  <div className="text-center transition-transform hover:scale-105">
    <img
      src={avatar}
      alt={`Portrait of ${name}, ${role}`}
      className="w-32 h-32 rounded-full mx-auto mb-4 shadow-lg ring-4 ring-gray-200 dark:ring-gray-700"
    />
    <h4 className="text-xl font-bold text-gray-900 dark:text-white">{name}</h4>
    <p className="text-blue-600 dark:text-blue-400 font-medium">{role}</p>
  </div>
);

/* 🌿 About Page */
const AboutPage = () => (
  <PageWrapper
    title="About Us"
    subtitle="We are a passionate team leveraging technology for environmental good."
  >
    <AnimatedBlock delay={100}>
      <p>
        <strong>EcoTrack</strong> is a revolutionary smart waste management
        platform dedicated to making cities cleaner, greener, and more
        sustainable. Born from a passion for environmental change and
        technological innovation, our mission is to empower citizens and
        municipalities with the tools they need to tackle the growing challenge
        of urban waste.
      </p>
      <p>
        We believe that small actions, when multiplied by millions, can change
        the world. Our platform connects everyday people, dedicated waste
        workers, and city administrators in a seamless, gamified ecosystem that
        rewards positive environmental behavior.
      </p>
    </AnimatedBlock>

    <div className="grid md:grid-cols-2 gap-8 my-12 not-prose">
      <AnimatedBlock delay={200}>
        <InfoCard
          icon={<Target size={28} />}
          title="Our Mission"
          text="To build an engaging, AI-powered ecosystem that empowers communities to manage waste responsibly and promote a circular economy."
        />
      </AnimatedBlock>
      <AnimatedBlock delay={300}>
        <InfoCard
          icon={<Eye size={28} />}
          title="Our Vision"
          text="A future where technology and collaboration transform waste into opportunity, creating cleaner, smarter cities."
        />
      </AnimatedBlock>
    </div>

    <AnimatedBlock delay={400}>
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white mt-10 mb-4">
        Why We Started
      </h2>
      <p>
        We noticed a critical gap. Cities were overwhelmed by growing waste
        challenges, while citizens lacked clear ways to contribute.{" "}
        <strong>EcoTrack</strong> bridges this divide — turning your smartphone
        into a tool for environmental impact. With AI-powered detection,
        real-time analytics, and community-driven gamification, we’re redefining
        urban sustainability.
      </p>
    </AnimatedBlock>

    <AnimatedBlock delay={500} className="not-prose mt-16">
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-12">
        Meet the Team
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-12">
        <TeamCard
          name="Alice Johnson"
          role="Founder & CEO"
          avatar="https://ui-avatars.com/api/?name=Alice+Johnson&background=10b981&color=fff&size=128"
        />
        <TeamCard
          name="Bob Smith"
          role="Lead Developer"
          avatar="https://ui-avatars.com/api/?name=Bob+Smith&background=3b82f6&color=fff&size=128"
        />
        <TeamCard
          name="Carol Lee"
          role="Head of Sustainability"
          avatar="https://ui-avatars.com/api/?name=Carol+Lee&background=8b5cf6&color=fff&size=128"
        />
      </div>
    </AnimatedBlock>
  </PageWrapper>
);

export default AboutPage;
