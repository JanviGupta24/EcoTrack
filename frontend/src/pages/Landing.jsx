// src/pages/Landing.jsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Leaf,
  Recycle,
  Award,
  TrendingUp,
  Users,
  MapPin,
  Smartphone,
  Star,
  ArrowRight,
  X,
  MessageSquare,
} from "lucide-react";

// 🌿 Intersection Observer Hook (optimized)
const useIntersectionObserver = (options) => {
  const [entry, setEntry] = useState(null);
  const observer = useRef(null);
  const setNode = useCallback(
    (node) => {
      if (observer.current) observer.current.disconnect();
      if (node) {
        observer.current = new IntersectionObserver(([entry]) => {
          if (entry.isIntersecting) setEntry(entry);
        }, options);
        observer.current.observe(node);
      }
    },
    [options]
  );
  return [setNode, entry?.isIntersecting];
};

// 🌿 Animated Section Wrapper
const AnimatedSection = ({ children, className = "", id }) => {
  const [ref, isVisible] = useIntersectionObserver({ threshold: 0.1 });
  return (
    <section
      id={id}
      ref={ref}
      className={`py-20 lg:py-24 transition-all duration-1000 ease-out ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      } ${className}`}
    >
      <div className="max-w-7xl mx-auto px-4">{children}</div>
    </section>
  );
};

// 🌿 Animation Styles
const AnimationStyles = () => (
  <style>{`
    html { scroll-behavior: smooth; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
    .animate-fadeIn { animation: fadeIn 1s ease-out forwards; }
    .animate-slideInUp { opacity: 0; animation: slideInUp 0.8s ease-out forwards; }
  `}</style>
);

// 🌿 Public Chatbot Component
const PublicChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hi! I'm EcoBot 🌱 — ask me about EcoTrack!",
    },
  ]);
  const navigate = useNavigate();

  const cannedResponses = {
    "What is EcoTrack?":
      "EcoTrack lets users report waste, earn eco-points, and track their environmental contributions.",
    "How do rewards work?":
      "Each waste report earns you Eco-Points, which can be redeemed for cash or rewards.",
    "How do I sign up?":
      "Click the 'Get Started' button or register with your email or Google account.",
  };

  const handleQuickReply = (question) => {
    const answer = cannedResponses[question];
    setMessages((prev) => [
      ...prev,
      { role: "user", content: question },
      { role: "assistant", content: answer },
    ]);
  };

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 bg-gradient-to-r from-green-500 to-blue-600 text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform z-40"
          aria-label="Open EcoBot Chat"
        >
          <MessageSquare className="w-6 h-6" />
        </button>
      )}

      {isOpen && (
        <div className="fixed bottom-6 right-6 w-full max-w-sm h-[500px] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl flex flex-col z-50 border border-gray-200 dark:border-gray-700 animate-fadeIn">
          <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white p-4 rounded-t-2xl flex items-center justify-between">
            <div className="flex items-center">
              <Leaf className="w-6 h-6 mr-2" />
              <div>
                <h3 className="font-bold">EcoBot</h3>
                <p className="text-xs opacity-90">Your Eco Assistant</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-white/20 p-1 rounded-full"
              aria-label="Close EcoBot"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-2xl ${
                    msg.role === "user"
                      ? "bg-blue-500 text-white rounded-br-none"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-none"
                  }`}
                >
                  <p className="text-sm">{msg.content}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Replies */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
              Quick Questions:
            </p>
            <div className="flex flex-wrap gap-2">
              {Object.keys(cannedResponses).map((q) => (
                <button
                  key={q}
                  onClick={() => handleQuickReply(q)}
                  className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full text-sm hover:bg-blue-200 dark:hover:bg-blue-800 transition"
                >
                  {q}
                </button>
              ))}
              <button
                onClick={() => navigate("/register")}
                className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-full text-sm hover:bg-green-200 dark:hover:bg-green-800 transition"
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// 🌿 Landing Page Component
const Landing = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Smartphone,
      title: "Easy Reporting",
      description: "Report waste with a photo — AI detects type automatically.",
    },
    {
      icon: Award,
      title: "Earn Rewards",
      description: "Get eco-points for every verified report.",
    },
    {
      icon: MapPin,
      title: "Find Facilities",
      description: "Locate nearby recycling centers and drop-off points.",
    },
    {
      icon: TrendingUp,
      title: "Track Impact",
      description: "Monitor your contribution with live analytics.",
    },
    {
      icon: Users,
      title: "Community Driven",
      description: "Join thousands of eco-warriors in your city.",
    },
    {
      icon: Recycle,
      title: "Learn & Grow",
      description: "Complete training and become a Green Champion.",
    },
  ];

  const stats = [
    { value: "10K+", label: "Active Users" },
    { value: "50K+", label: "Reports Filed" },
    { value: "200+", label: "Facilities" },
    { value: "95%", label: "Success Rate" },
  ];

  const testimonials = [
    {
      name: "Priya Sharma",
      role: "Green Champion",
      image:
        "https://ui-avatars.com/api/?name=Priya+Sharma&background=10b981&color=fff",
      text: "EcoTrack transformed how I contribute to my city. Earned 5000 points in just 2 months!",
      rating: 5,
    },
    {
      name: "Rahul Verma",
      role: "Daily User",
      image:
        "https://ui-avatars.com/api/?name=Rahul+Verma&background=3b82f6&color=fff",
      text: "Super easy to use. The AI waste detection is impressive. Highly recommended!",
      rating: 5,
    },
    {
      name: "Admin Sarah",
      role: "City Administrator",
      image:
        "https://ui-avatars.com/api/?name=Sarah+Admin&background=8b5cf6&color=fff",
      text: "The admin dashboard provides incredible insights. Waste collection efficiency up 40%.",
      rating: 5,
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <AnimationStyles />
      <main className="flex-grow">
        {/* HERO */}
        <section
          id="home"
          className="pt-32 pb-20 bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900"
        >
          <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
            <div className="animate-slideInUp">
              <div className="inline-flex items-center px-4 py-2 bg-green-100 dark:bg-green-900 rounded-full mb-6">
                <span className="text-green-800 dark:text-green-200 text-sm font-semibold">
                  🌱 AI-Powered Waste Management
                </span>
              </div>
              <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 dark:text-white mb-6 leading-tight">
                Make Your City{" "}
                <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                  Cleaner
                </span>
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
                Report waste, earn rewards, and contribute to a sustainable
                future.
              </p>
              <button
                onClick={() => navigate("/register")}
                className="bg-gradient-to-r from-green-500 to-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:shadow-2xl transform hover:scale-105 transition-all flex items-center justify-center"
              >
                Start Reporting <ArrowRight className="ml-2 w-5 h-5" />
              </button>
            </div>
          </div>
        </section>

        {/* STATS */}
        <AnimatedSection className="bg-white dark:bg-gray-900">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((s, i) => (
              <div key={i}>
                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-2">
                  {s.value}
                </div>
                <div className="text-gray-600 dark:text-gray-400 font-medium">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </AnimatedSection>

        {/* FEATURES */}
        <AnimatedSection id="features" className="bg-gray-50 dark:bg-gray-800">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Everything You Need
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Powerful tools for sustainable living
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <div
                key={i}
                className="bg-white dark:bg-gray-900 rounded-xl p-8 shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all"
              >
                <div className="bg-gradient-to-br from-green-500 to-blue-500 w-14 h-14 rounded-lg flex items-center justify-center mb-6">
                  <f.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  {f.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {f.description}
                </p>
              </div>
            ))}
          </div>
        </AnimatedSection>

        {/* HOW IT WORKS */}
        <AnimatedSection
          id="how-it-works"
          className="bg-white dark:bg-gray-900"
        >
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Get started in 3 simple steps
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 text-center">
            {[
              {
                step: "1",
                title: "Sign Up",
                desc: "Create your free account in seconds",
              },
              {
                step: "2",
                title: "Report Waste",
                desc: "Snap a photo and add location",
              },
              {
                step: "3",
                title: "Earn Rewards",
                desc: "Collect eco-points and redeem prizes",
              },
            ].map((item, i) => (
              <div key={i}>
                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl font-bold text-white shadow-lg">
                  {item.step}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                  {item.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </AnimatedSection>

        {/* TESTIMONIALS */}
        <AnimatedSection
          id="testimonials"
          className="bg-gray-50 dark:bg-gray-800"
        >
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              What Our Users Say
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Join thousands of satisfied eco-warriors
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <div
                key={i}
                className="bg-white dark:bg-gray-900 rounded-xl p-8 shadow-lg"
              >
                <div className="flex mb-4">
                  {[...Array(t.rating)].map((_, j) => (
                    <Star
                      key={j}
                      className="w-5 h-5 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>
                <p className="text-gray-700 dark:text-gray-300 mb-6 italic">
                  "{t.text}"
                </p>
                <div className="flex items-center">
                  <img
                    src={t.image}
                    alt={t.name}
                    className="w-12 h-12 rounded-full mr-4"
                  />
                  <div>
                    <div className="font-bold text-gray-900 dark:text-white">
                      {t.name}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {t.role}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </AnimatedSection>

        {/* CTA */}
        <AnimatedSection className="py-0">
          <div className="py-20 bg-gradient-to-r from-green-600 to-blue-600 mb-0">
            <div className="max-w-4xl mx-auto px-4 text-center">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Ready to Make a Difference?
              </h2>
              <p className="text-xl text-green-100 mb-8">
                Join the EcoTrack community and start making an impact today.
              </p>
              <button
                onClick={() => navigate("/register")}
                className="bg-white text-green-600 px-8 py-4 rounded-lg font-bold text-lg hover:shadow-2xl transform hover:scale-105 transition-all"
              >
                Get Started Free
              </button>
            </div>
          </div>
        </AnimatedSection>
      </main>

      <PublicChatBot />
    </div>
  );
};

export default Landing;
