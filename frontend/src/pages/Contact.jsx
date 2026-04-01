// src/pages/Contact.jsx
import React, { useState, useEffect, useRef } from "react";
import {
  Mail,
  MessageSquare,
  User,
  Send,
  Phone,
  MapPin,
  Loader,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

/* 🌿 Intersection Observer Animation Hook */
const useIntersectionObserver = (options) => {
  const [entry, setEntry] = useState(null);
  const [node, setNode] = useState(null);

  const observer = useRef(
    new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setEntry(entry);
        observer.current?.disconnect();
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

/* 🌟 Animated Block */
const AnimatedBlock = ({ children, className = "", delay = 0 }) => {
  const [ref, isVisible] = useIntersectionObserver({ threshold: 0.1 });
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${className} ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

/* 🌍 Page Wrapper */
const PageWrapper = ({ title, subtitle, children }) => (
  <div className="pt-32 pb-20 bg-white dark:bg-gray-900 transition-colors duration-300">
    <div className="max-w-5xl mx-auto px-4">
      <AnimatedBlock>
        <h1 className="text-5xl font-extrabold text-gray-900 dark:text-white mb-4">
          {title}
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-12">
          {subtitle}
        </p>
      </AnimatedBlock>
      {children}
    </div>
  </div>
);

/* 🧩 InfoCard Component */
const InfoCard = ({ icon, title, children }) => (
  <div className="flex items-start space-x-4">
    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-green-500/20 to-blue-500/20 dark:from-green-700/30 dark:to-blue-700/30 rounded-lg flex items-center justify-center">
      {icon}
    </div>
    <div>
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
        {title}
      </h3>
      <div className="text-gray-600 dark:text-gray-400">{children}</div>
    </div>
  </div>
);

/* 📩 Main Contact Page */
const ContactPage = () => {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", content: "" });

  /* 🧠 Handle Form Inputs */
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  /* 🚀 Simulated Submit */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFeedback({ type: "", content: "" });

    try {
      await new Promise((resolve) => setTimeout(resolve, 1800));
      setFeedback({
        type: "success",
        content: "Message sent! We’ll get back to you soon.",
      });
      setFormData({ name: "", email: "", message: "" });
    } catch (error) {
      setFeedback({
        type: "error",
        content: "Failed to send message. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper
      title="Contact Us"
      subtitle="We’d love to hear from you! Whether you have a question, feedback, or partnership opportunity."
    >
      <div className="grid md:grid-cols-2 gap-12">
        {/* 🌿 Contact Form */}
        <AnimatedBlock delay={100}>
          {feedback.content && (
            <div
              className={`mb-6 p-4 rounded-lg flex items-center ${
                feedback.type === "success"
                  ? "bg-green-100 border-l-4 border-green-500 text-green-700"
                  : "bg-red-100 border-l-4 border-red-500 text-red-700"
              }`}
            >
              {feedback.type === "success" ? (
                <CheckCircle className="w-5 h-5 mr-3" />
              ) : (
                <AlertCircle className="w-5 h-5 mr-3" />
              )}
              <span>{feedback.content}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Your Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Your Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="john@example.com"
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Message */}
            <div>
              <label
                htmlFor="message"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Message
              </label>
              <div className="relative">
                <MessageSquare className="absolute left-3 top-4 w-5 h-5 text-gray-400" />
                <textarea
                  id="message"
                  name="message"
                  rows="5"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Your message..."
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-500 to-blue-600 text-white py-3 rounded-lg font-semibold flex items-center justify-center hover:shadow-lg hover:scale-105 transition-all disabled:opacity-50"
            >
              {loading ? (
                <Loader className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <Send className="w-5 h-5 mr-2" />
              )}
              {loading ? "Sending..." : "Send Message"}
            </button>
          </form>
        </AnimatedBlock>

        {/* 📞 Contact Info */}
        <AnimatedBlock delay={200} className="space-y-8">
          <InfoCard
            icon={<Mail className="w-6 h-6 text-blue-600" />}
            title="Email"
          >
            <p>
              General Inquiries:{" "}
              <a
                href="mailto:info@ecotrack.com"
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                info@ecotrack.com
              </a>
            </p>
            <p>
              Support:{" "}
              <a
                href="mailto:support@ecotrack.com"
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                support@ecotrack.com
              </a>
            </p>
          </InfoCard>

          <InfoCard
            icon={<Phone className="w-6 h-6 text-blue-600" />}
            title="Phone"
          >
            <p>+91 98765 43210</p>
          </InfoCard>

          <InfoCard
            icon={<MapPin className="w-6 h-6 text-blue-600" />}
            title="Office"
          >
            <p>123 Green Way, EcoTower</p>
            <p>New Delhi, 110001, India</p>
          </InfoCard>
        </AnimatedBlock>
      </div>
    </PageWrapper>
  );
};

export default ContactPage;
