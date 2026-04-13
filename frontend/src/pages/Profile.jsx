/* =============================================================================
 * Profile Page
 * =============================================================================
 * Purpose:
 *   Allow authenticated users to view and update their profile details:
 *   - Name, phone, and address/location fields
 *   - Avatar upload (Cloudinary-backed via backend)
 *
 Data:
 *   Uses `userService.getProfile()` and `userService.updateProfile()`.
 * ============================================================================= */
import React, { useState, useRef, useEffect } from "react";
import {
  Camera,
  Save,
  User,
  Mail,
  Phone,
  MapPin,
  Loader,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  Award,
  Star,
  Crown,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { userService } from "../api/services";
import AppLoader from "../components/Loader"; // Use AppLoader to avoid conflict
import { getApiErrorMessage } from "../utils/errors";

// --- Define Eco Level System ---
const getEcoLevel = (points) => {
  if (points >= 2000)
    return {
      level: "Planet Guardian",
      color: "from-purple-500 to-indigo-600",
      emoji: "🪐",
    };
  if (points >= 1000)
    return {
      level: "Eco Warrior",
      color: "from-green-500 to-teal-600",
      emoji: "🌿",
    };
  if (points >= 500)
    return {
      level: "Recycling Hero",
      color: "from-blue-500 to-cyan-600",
      emoji: "♻️",
    };
  if (points >= 200)
    return {
      level: "Green Rookie",
      color: "from-lime-400 to-green-500",
      emoji: "🌱",
    };
  return {
    level: "Eco Learner",
    color: "from-gray-400 to-gray-600",
    emoji: "🌍",
  };
};

// --- Define Rank based on reports count ---
const getRank = (reports) => {
  if (reports >= 50) return "Legendary Recycler";
  if (reports >= 20) return "Sustainability Advocate";
  if (reports >= 10) return "Waste Champion";
  return "Eco Starter";
};

const Profile = () => {
  const { user, updateUser } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    city: "",
  });

  const [loading, setLoading] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", content: "" });
  const avatarInputRef = useRef(null);

  // Populate form when user data is available
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        city: user.location?.city || "",
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ✅ Update Profile Info
  const handleSave = async () => {
    setLoading(true);
    setMessage({ type: "", content: "" });
    try {
      const updateData = {
        name: formData.name,
        phone: formData.phone,
        location: { ...user.location, city: formData.city },
      };
      const response = await userService.updateProfile(updateData);
      updateUser(response.data.user);
      setMessage({ type: "success", content: "Profile updated successfully!" });
    } catch (error) {
      setMessage({
        type: "error",
        content: getApiErrorMessage(error, "Failed to update profile. Please try again."),
      });
    } finally {
      setLoading(false);
    }
  };

  // ✅ Upload Avatar
  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setAvatarLoading(true);
    setMessage({ type: "", content: "" });

    const avatarFormData = new FormData();
    avatarFormData.append("avatar", file);

    try {
      const response = await userService.uploadAvatar(avatarFormData);
      updateUser({ avatar: response.data.avatar });
      setMessage({ type: "success", content: "Avatar updated!" });
    } catch (error) {
      setMessage({
        type: "error",
        content: getApiErrorMessage(error, "Failed to upload avatar. Please try again."),
      });
    } finally {
      setAvatarLoading(false);
    }
  };

  // 🧠 Derived Data
  const ecoPoints = user?.ecoPoints || 0;
  const reports = user?.reportsCount || 0;
  const ecoLevel = getEcoLevel(ecoPoints);
  const rank = getRank(reports);

  if (!user) return <AppLoader />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 pt-8 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1
          className="text-4xl font-bold text-gray-900 dark:text-white mb-8 animate-slideInUp"
          style={{ animationDelay: "100ms" }}
        >
          My Profile
        </h1>

        {/* Profile Card */}
        <div
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-6 animate-slideInUp"
          style={{ animationDelay: "200ms" }}
        >
          <div className="flex flex-col sm:flex-row items-center sm:space-x-6 mb-6">
            {/* Avatar */}
            <div className="relative mb-4 sm:mb-0">
              <img
                src={
                  user?.avatar
                    ? user.avatar
                    : (() => {
                        const name = user?.name || "User";
                        const parts = name.trim().split(" ");
                        const first = parts[0]?.charAt(0) || "";
                        const last =
                          parts.length > 1
                            ? parts[parts.length - 1].charAt(0)
                            : "";
                        const initials = (first + last).toUpperCase();
                        return `https://ui-avatars.com/api/?name=${initials}&background=10b981&color=fff&size=128&bold=true`;
                      })()
                }
                alt="Profile"
                className="w-32 h-32 rounded-full ring-4 ring-green-500 shadow-md transition-all duration-300"
              />

              <input
                type="file"
                ref={avatarInputRef}
                onChange={handleAvatarChange}
                accept="image/*"
                className="hidden"
              />
              <button
                onClick={() => avatarInputRef.current.click()}
                className="absolute bottom-0 right-0 bg-blue-500 text-white p-3 rounded-full hover:bg-blue-600 shadow-lg transition transform hover:scale-110"
                disabled={avatarLoading}
              >
                {avatarLoading ? (
                  <Loader className="w-5 h-5 animate-spin" />
                ) : (
                  <Camera className="w-5 h-5" />
                )}
              </button>
            </div>

            {/* User Info */}
            <div className="text-center sm:text-left">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {user.name}
              </h2>
              <span className="px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 rounded-full text-sm font-semibold capitalize">
                {user.role.replace("_", " ")}
              </span>

              {/* Eco Level Badge */}
              <div
                className={`mt-3 inline-flex items-center px-3 py-1 rounded-full bg-gradient-to-r ${ecoLevel.color} text-white font-semibold shadow-md`}
              >
                <span className="text-lg mr-2">{ecoLevel.emoji}</span>
                {ecoLevel.level}
              </div>
            </div>
          </div>

          {/* Messages */}
          {message.content && (
            <div
              className={`mb-4 p-4 rounded-lg flex items-center animate-fadeIn ${
                message.type === "success"
                  ? "bg-green-100 border-l-4 border-green-500 text-green-700"
                  : "bg-red-100 border-l-4 border-red-500 text-red-700"
              }`}
            >
              {message.type === "success" ? (
                <CheckCircle className="w-5 h-5 mr-3" />
              ) : (
                <AlertCircle className="w-5 h-5 mr-3" />
              )}
              <span className="text-sm font-medium">{message.content}</span>
            </div>
          )}

          {/* Form */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <User className="w-4 h-4 inline mr-2" /> Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Mail className="w-4 h-4 inline mr-2" /> Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                disabled
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-900 dark:text-gray-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Phone className="w-4 h-4 inline mr-2" /> Phone
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <MapPin className="w-4 h-4 inline mr-2" /> City
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex space-x-4 mt-8">
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-green-500 to-blue-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition flex items-center justify-center disabled:opacity-50 transform hover:scale-105"
            >
              {loading ? (
                <Loader className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <Save className="w-5 h-5 mr-2" />
              )}
              Save Changes
            </button>
            <button className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition">
              Cancel
            </button>
          </div>
        </div>

        {/* Stats Section */}
        <div
          className="grid md:grid-cols-3 gap-6 animate-slideInUp"
          style={{ animationDelay: "300ms" }}
        >
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg text-center transform hover:-translate-y-1 transition-transform">
            <Award className="w-10 h-10 text-green-500 mx-auto mb-3" />
            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {reports}
            </div>
            <div className="text-gray-600 dark:text-gray-400">
              Reports Filed
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg text-center transform hover:-translate-y-1 transition-transform">
            <TrendingUp className="w-10 h-10 text-blue-500 mx-auto mb-3" />
            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {ecoPoints}
            </div>
            <div className="text-gray-600 dark:text-gray-400">
              Points Earned
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg text-center transform hover:-translate-y-1 transition-transform">
            <Crown className="w-10 h-10 text-yellow-500 mx-auto mb-3" />
            <div className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {rank}
            </div>
            <div className="text-gray-600 dark:text-gray-400">User Rank</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
