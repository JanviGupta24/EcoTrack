/* =============================================================================
 * Footer Component
 * =============================================================================
 * Purpose:
 *   Display the public footer content across the app, including policy links
 *   and a consistent EcoTrack branding section.
 *
 * Dependencies:
 *   - `react-router-dom` Link components (for internal navigation)
 * ============================================================================= */
import React from "react";
import {
  Leaf,
  Facebook,
  Instagram,
  Linkedin,
  Github,
  Youtube,
  Twitter,
} from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";

const Footer = ({ className = "" }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Smooth scroll handler for footer internal links
  const handleSmoothScroll = (e, id) => {
    e.preventDefault();

    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
      }, 500);
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <footer
      className={`bg-gray-900 text-gray-400 py-12 transition-colors duration-300 ${className}`}
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-10">
          {/* 🌿 Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center mb-4">
              <div className="bg-gradient-to-r from-green-500 to-blue-500 p-2 rounded-lg shadow-md">
                <Leaf
                  className="w-5 h-5 text-white"
                  aria-label="EcoTrack Logo"
                />
              </div>
              <span className="ml-2 text-lg font-bold text-white tracking-wide">
                EcoTrack
              </span>
            </div>
            <p className="text-sm leading-relaxed text-gray-400">
              Empowering citizens to build cleaner cities — one report at a
              time.
            </p>
          </div>

          {/* 🌍 Quick Links */}
          <div>
            <h4 className="font-semibold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="#features"
                  onClick={(e) => handleSmoothScroll(e, "features")}
                  className="hover:text-white transition-colors"
                >
                  Features
                </a>
              </li>
              <li>
                <a
                  href="#how-it-works"
                  onClick={(e) => handleSmoothScroll(e, "how-it-works")}
                  className="hover:text-white transition-colors"
                >
                  How It Works
                </a>
              </li>
              <li>
                <Link
                  to="/about"
                  className="hover:text-white transition-colors"
                >
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          {/* 🏢 Company */}
          <div>
            <h4 className="font-semibold text-white mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  to="/about"
                  className="hover:text-white transition-colors"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="hover:text-white transition-colors"
                >
                  Contact
                </Link>
              </li>
              <li>
                <a
                  href="https://your-portfolio.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  Portfolio
                </a>
              </li>
              <li>
                <a
                  href="https://your-blog.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  Blog
                </a>
              </li>
            </ul>
          </div>

          {/* ⚖️ Legal */}
          <div>
            <h4 className="font-semibold text-white mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  to="/privacy"
                  className="hover:text-white transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="hover:text-white transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* 🌐 Social Icons */}
        <div className="flex items-center space-x-5 mb-6">
          {[
            { Icon: Facebook, href: "https://facebook.com", label: "Facebook" },
            {
              Icon: Instagram,
              href: "https://instagram.com",
              label: "Instagram",
            },
            { Icon: Linkedin, href: "https://linkedin.com", label: "LinkedIn" },
            { Icon: Github, href: "https://github.com", label: "GitHub" },
            { Icon: Youtube, href: "https://youtube.com", label: "YouTube" },
            { Icon: Twitter, href: "https://twitter.com", label: "Twitter" },
          ].map(({ Icon, href, label }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              className="hover:text-white transition-all hover:scale-110 transform"
            >
              <Icon className="w-5 h-5" />
            </a>
          ))}
        </div>

        {/* 💬 Footer Bottom */}
        <div className="border-t border-gray-800 pt-6 text-center text-sm text-gray-500">
          © {new Date().getFullYear()}{" "}
          <span className="font-semibold text-white">EcoTrack</span>. All rights
          reserved.
          <br />
          <span className="text-green-400">
            Made with 💚 for a cleaner planet.
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
