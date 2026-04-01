// src/pages/Leaderboard.jsx
import React, { useState, useEffect } from "react";
import { Trophy, Crown, AlertCircle } from "lucide-react";
import { userService } from "../api/services";
import { useAuth } from "../context/AuthContext";
import AppLoader from "../components/Loader"; // Renamed to avoid icon conflict

// We assume the keyframes 'animate-slideInUp' are defined globally 
// in App.js or index.css, as established in previous files.

// --- 1. Modern Animation Wrapper ---
const AnimatedBlock = ({ children, delay = 0, className = "" }) => (
  <div 
    className={`animate-slideInUp ${className}`}
    style={{ animationDelay: `${delay}ms` }}
  >
    {children}
  </div>
);

// --- 2. Reusable Tab Component for Timeframe ---
const TimeframeTabs = ({ activeTimeframe, onChange }) => {
  const timeframes = [
    { key: 'all', label: 'All Time' },
    { key: 'month', label: 'This Month' },
    { key: 'week', label: 'This Week' },
  ];

  return (
    <div className="flex justify-center mb-8">
      <div className="flex p-1 bg-gray-200 dark:bg-gray-700 rounded-lg">
        {timeframes.map((tf) => (
          <button
            key={tf.key}
            onClick={() => onChange(tf.key)}
            className={`px-4 py-2 font-semibold text-sm rounded-md transition-all ${
              activeTimeframe === tf.key
                ? 'bg-white dark:bg-gray-900 text-blue-600 shadow-md'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            {tf.label}
          </button>
        ))}
      </div>
    </div>
  );
};

// --- 3. Main Leaderboard Component ---
const Leaderboard = () => {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [currentUserRank, setCurrentUserRank] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeframe, setTimeframe] = useState('all'); // State for timeframe filter

  // 4. Fetch leaderboard data, now with timeframe
  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Pass the timeframe state to the API call
        const response = await userService.getLeaderboard({ timeframe });
        
        setLeaderboard(response.data.leaderboard);
        setCurrentUserRank(response.data.currentUser);
        
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load leaderboard");
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [timeframe]); // Re-fetch when timeframe changes

  const getRankIcon = (rank) => {
    if (rank === 1) return <Crown className="w-6 h-6 text-yellow-500" />;
    if (rank === 2) return <Trophy className="w-6 h-6 text-gray-400" />;
    if (rank === 3) return <Trophy className="w-6 h-6 text-orange-600" />;
    return null;
  };

  if (loading) {
    return <AppLoader />;
  }
  
  // 4. Separate top 3 from the rest of the list
  const top3 = leaderboard.filter(l => l.rank <= 3);
  const rest = leaderboard.filter(l => l.rank > 3);

  // 5. Check if the current user is in the fetched list
  const isUserInList = leaderboard.some(l => l.user._id === user._id);

  // 6. Define podium styles for modern UI
  const getPodiumStyle = (rank) => {
    if (rank === 1) return 'order-2 md:order-2 scale-110 !pt-8 ring-4 ring-yellow-400 z-10';
    if (rank === 2) return 'order-1 md:order-1 ring-2 ring-gray-300';
    if (rank === 3) return 'order-3 md:order-3 ring-2 ring-orange-400';
    return '';
  };

  return (
    <div className="bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        
        <AnimatedBlock delay={0} className="text-center mb-8 pt-8">
          <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4 animate-[bounce_2s_ease-in-out_infinite]" />
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Leaderboard</h1>
          <p className="text-gray-600 dark:text-gray-400">See who's making the biggest impact!</p>
        </AnimatedBlock>

        {/* 7. Add Timeframe Tabs */}
        <AnimatedBlock delay={100}>
          <TimeframeTabs activeTimeframe={timeframe} onChange={setTimeframe} />
        </AnimatedBlock>

        {error && (
          <AnimatedBlock delay={200} className="mb-4 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded-lg">
            <div className="flex items-center"><AlertCircle className="w-6 h-6 mr-3" /> <span className="font-medium">{error}</span></div>
          </AnimatedBlock>
        )}

        {/* 8. Dynamic & Animated Top 3 Podium (Now Responsive) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12 items-end">
          {top3.map((leader) => (
            <AnimatedBlock 
              delay={leader.rank * 100 + 200}
              key={leader.rank} 
              className={`flex-1 ${getPodiumStyle(leader.rank)}`}
            >
              <div className={`bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg text-center transform transition-all duration-300 ${
                leader.user._id === user._id ? 'ring-4 ring-blue-500' : ''
              }`}>
                <img 
                  src={leader.user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(leader.user.name)}&background=10b981&color=fff`} 
                  alt={leader.user.name} 
                  className="w-20 h-20 rounded-full mx-auto mb-3 ring-4 ring-white dark:ring-gray-700" 
                />
                <div className="flex justify-center items-center h-8">
                  {getRankIcon(leader.rank)}
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white mt-2 truncate">{leader.user.name}</div>
                <div className="text-green-600 dark:text-green-400 font-bold text-xl mt-1">{leader.user.ecoPoints.toLocaleString()}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{leader.user.reportsCount || 0} reports</div>
              </div>
            </AnimatedBlock>
          ))}
        </div>

        {/* 9. Dynamic Rest of List (Animated) */}
        <AnimatedBlock delay={500} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          {rest.map((leader, index) => (
            <div 
              key={leader.rank} 
              className={`flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 last:border-b-0 transition-colors ${
                leader.user._id === user._id ? 'bg-blue-50 dark:bg-blue-900' : 'hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <div className="flex items-center space-x-4">
                <div className="text-lg font-bold text-gray-400 w-8">{leader.rank}</div>
                <img 
                  src={leader.user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(leader.user.name)}`} 
                  alt={leader.user.name} 
                  className="w-12 h-12 rounded-full" 
                />
                <div>
                  <div className="font-bold text-gray-900 dark:text-white truncate">{leader.user.name}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{leader.user.reportsCount || 0} reports</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-green-600 dark:text-green-400 font-bold text-lg">{leader.user.ecoPoints.toLocaleString()}</div>
                <div className="text-xs text-gray-500">points</div>
              </div>
            </div>
          ))}
        </AnimatedBlock>
        
        {/* 10. Dedicated "Your Rank" Card */}
        {!isUserInList && currentUserRank && (
          <AnimatedBlock delay={600} className="mt-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden ring-4 ring-blue-500">
              <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900">
                <div className="flex items-center space-x-4">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 w-8">{currentUserRank.rank}</div>
                  <img 
                    src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}`} 
                    alt={user.name} 
                    className="w-12 h-12 rounded-full" 
                  />
                  <div>
                    <div className="font-bold text-gray-900 dark:text-white">{user.name} (You)</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{user.reportsCount || 0} reports</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-green-600 dark:text-green-400 font-bold text-lg">{currentUserRank.ecoPoints.toLocaleString()}</div>
                  <div className="text-xs text-gray-500">points</div>
                </div>
              </div>
            </div>
          </AnimatedBlock>
        )}

      </div>
    </div>
  );
};

export default Leaderboard;