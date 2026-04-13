/* =============================================================================
 * Champion Events Page
 * =============================================================================
 * Purpose:
 *   Display upcoming events for `green_champion` users, sourced from the
 *   backend via `championService.getEvents()`.
 * ============================================================================= */

import React, { useEffect, useState } from "react";
import { Calendar, MapPin, Users, AlertCircle } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { championService } from "../../api/services"; // ✅ Correct service
import Loader from "../../components/Loader";
import { getApiErrorMessage } from "../../utils/errors";

// 🌿 Animation Wrapper
const AnimatedBlock = ({ children, delay = 0 }) => (
  <div className="animate-slideInUp" style={{ animationDelay: `${delay}ms` }}>
    {children}
  </div>
);

const ChampionEvents = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        setError(null);

        // ✅ Fetch from /api/champion/events
        const res = await championService.getEvents();
        setEvents(res.data.events || []);
      } catch (err) {
        console.error("Error fetching events:", err);
        setError(getApiErrorMessage(err, "Failed to load events. Please try again."));
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchEvents();
  }, [user]);

  if (loading) return <Loader />;

  if (error)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-6 rounded-lg flex items-center shadow">
          <AlertCircle className="w-6 h-6 mr-3" />
          <span>{error}</span>
        </div>
      </div>
    );

  return (
    <div className="bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-8 min-h-screen">
      <AnimatedBlock delay={0}>
        <h1 className="text-3xl font-bold text-green-600 flex items-center mb-6">
          <Calendar className="w-7 h-7 mr-2 text-green-500" />
          Green Champion Events
        </h1>
      </AnimatedBlock>

      <AnimatedBlock delay={150}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center col-span-full">
              No events available at the moment.
            </p>
          ) : (
            events.map((event) => (
              <div
                key={event._id}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {/* Title */}
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {event.title || "Untitled Event"}
                </h3>

                {/* Description */}
                <p className="text-gray-600 dark:text-gray-400 mb-3 line-clamp-3">
                  {event.description || "No description available."}
                </p>

                {/* Location */}
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-2">
                  <MapPin className="w-4 h-4 mr-2 text-blue-500" />
                  {event.location || "N/A"}
                </div>

                {/* Date */}
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-2">
                  <Calendar className="w-4 h-4 mr-2 text-green-500" />
                  {event.date
                    ? new Date(event.date).toLocaleDateString()
                    : "Date not set"}
                </div>

                {/* Participants */}
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <Users className="w-4 h-4 mr-2 text-purple-500" />
                  {event.participants?.length || 0} participants
                </div>
              </div>
            ))
          )}
        </div>
      </AnimatedBlock>
    </div>
  );
};

export default ChampionEvents;
