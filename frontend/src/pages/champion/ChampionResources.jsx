import React, { useEffect, useState } from "react";
import { BookOpen, Link, AlertCircle } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { championService } from "../../api/services"; // ✅ Correct Service
import Loader from "../../components/Loader";

// 🌿 Animation Wrapper
const AnimatedBlock = ({ children, delay = 0 }) => (
  <div className="animate-slideInUp" style={{ animationDelay: `${delay}ms` }}>
    {children}
  </div>
);

const ChampionResources = () => {
  const { user } = useAuth();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchResources = async () => {
      try {
        setLoading(true);
        setError(null);

        // ✅ Fetch Champion Sustainability Resources
        const res = await championService.getResources();
        setResources(res.data.resources || []);
      } catch (err) {
        console.error("Error fetching Green Champion resources:", err);
        setError("Failed to load sustainability resources. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchResources();
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
    <div className="bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-8 min-h-screen">
      {/* Header */}
      <AnimatedBlock delay={0}>
        <h1 className="text-3xl font-bold text-blue-600 flex items-center mb-6">
          <BookOpen className="w-7 h-7 mr-2 text-blue-500" />
          Sustainability Resources
        </h1>
      </AnimatedBlock>

      {/* Resource Grid */}
      <AnimatedBlock delay={200}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center col-span-full">
              No resources available right now.
            </p>
          ) : (
            resources.map((r) => (
              <div
                key={r._id}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {r.title || "Untitled Resource"}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-3 line-clamp-3">
                  {r.description || "No description provided."}
                </p>

                {r.link ? (
                  <a
                    href={r.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    <Link className="w-4 h-4 mr-2" />
                    View Resource
                  </a>
                ) : (
                  <p className="text-sm text-gray-400 italic">No link available</p>
                )}
              </div>
            ))
          )}
        </div>
      </AnimatedBlock>
    </div>
  );
};

export default ChampionResources;
