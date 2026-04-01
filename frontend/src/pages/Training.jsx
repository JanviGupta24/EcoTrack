import React, { useState, useEffect } from 'react';
import { 
  BookOpen, Award, Clock, Play, CheckCircle, 
  TrendingUp, AlertCircle, Inbox, Loader 
} from 'lucide-react';
import { trainingService } from '../api/services';
import { useAuth } from '../context/AuthContext';
import AppLoader from '../components/Loader';
import { useNavigate } from 'react-router-dom';

// --- Animation Wrapper ---
const AnimatedBlock = ({ children, delay = 0, className = "" }) => (
  <div 
    className={`animate-slideInUp ${className}`}
    style={{ animationDelay: `${delay}ms` }}
  >
    {children}
  </div>
);

const Training = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('all');
  const [allCourses, setAllCourses] = useState([]);
  const [myEnrolledCourses, setMyEnrolledCourses] = useState([]);
  const [myCompletedCourses, setMyCompletedCourses] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrollLoading, setEnrollLoading] = useState(null);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState({ type: "", content: "" });

  // ✅ Safe mapping
  const enrolledIds = new Set((myEnrolledCourses || []).map(c => c._id));
  const completedIds = new Set((myCompletedCourses || []).map(c => c._id));

  const fetchData = async () => {
    try {
      setError(null);
      const [coursesRes, myCoursesRes, certsRes] = await Promise.all([
        trainingService.getCourses(),
        trainingService.getMyCourses(),
        trainingService.getCertificates()
      ]);

      setAllCourses(coursesRes?.data?.courses || []);
      setMyEnrolledCourses(myCoursesRes?.data?.enrolledCourses || []);
      setMyCompletedCourses(myCoursesRes?.data?.completedCourses || []);
      setCertificates(certsRes?.data?.certificates || []);
    } catch (err) {
      console.error("Failed to fetch training data:", err);
      setError(err.response?.data?.message || "Failed to load training data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEnroll = async (courseId) => {
    setEnrollLoading(courseId);
    setMessage({ type: "", content: "" });
    try {
      await trainingService.enrollCourse(courseId);
      setMessage({ type: "success", content: "Enrolled successfully! You can find it in 'My Courses'." });
      fetchData();
    } catch (err) {
      setMessage({ type: "error", content: err.response?.data?.message || "Failed to enroll" });
    } finally {
      setEnrollLoading(null);
    }
  };
  
  const courseLists = {
    'all': allCourses || [],
    'my-courses': myEnrolledCourses || [],
    'completed': myCompletedCourses || []
  };
  
  const categoryColors = {
    beginner: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    intermediate: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    advanced: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300'
  };

  if (loading) return <AppLoader />;

  return (
    <div className="bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 pb-12 px-4">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <AnimatedBlock delay={0} className="mb-8 pt-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Training Hub</h1>
          <p className="text-gray-600 dark:text-gray-400">Learn, grow, and become an eco expert</p>
        </AnimatedBlock>

        {/* Feedback */}
        {error && (
          <AnimatedBlock delay={100} className="mb-4 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded-lg">
            <div className="flex items-center"><AlertCircle className="w-6 h-6 mr-3" /> <span className="font-medium">{error}</span></div>
          </AnimatedBlock>
        )}
        {message.content && (
          <AnimatedBlock delay={100} className="mb-4 p-4 bg-green-100 border-l-4 border-green-500 text-green-700 rounded-lg">
            <div className="flex items-center"><CheckCircle className="w-6 h-6 mr-3" /> <span className="font-medium">{message.content}</span></div>
          </AnimatedBlock>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <AnimatedBlock delay={200}>
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-6 text-white shadow-lg transform hover:scale-105 transition-transform duration-300">
              <BookOpen className="w-8 h-8 mb-3" />
              <div className="text-3xl font-bold mb-1">{(myEnrolledCourses || []).length}</div>
              <div className="text-green-100">Enrolled Courses</div>
            </div>
          </AnimatedBlock>

          <AnimatedBlock delay={300}>
            <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl p-6 text-white shadow-lg transform hover:scale-105 transition-transform duration-300">
              <Award className="w-8 h-8 mb-3" />
              <div className="text-3xl font-bold mb-1">{(certificates || []).length}</div>
              <div className="text-blue-100">Certificates Earned</div>
            </div>
          </AnimatedBlock>

          <AnimatedBlock delay={400}>
            <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl p-6 text-white shadow-lg transform hover:scale-105 transition-transform duration-300">
              <TrendingUp className="w-8 h-8 mb-3" />
              <div className="text-3xl font-bold mb-1">{user?.ecoPoints || 0}</div>
              <div className="text-purple-100">Total Eco-Points</div>
            </div>
          </AnimatedBlock>

          <AnimatedBlock delay={500}>
            <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-xl p-6 text-white shadow-lg transform hover:scale-105 transition-transform duration-300">
              <Clock className="w-8 h-8 mb-3" />
              <div className="text-3xl font-bold mb-1">
                ~{Math.round((myCompletedCourses || []).reduce((sum, course) => sum + (course.estimatedTime || 0), 0) / 60)}
              </div>
              <div className="text-orange-100">Hours Learned</div>
            </div>
          </AnimatedBlock>
        </div>

        {/* Certificates */}
        {(certificates || []).length > 0 && (
          <AnimatedBlock delay={600} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
              <Award className="w-6 h-6 mr-2 text-yellow-500" />
              My Certificates
            </h2>
            <div className="grid md:grid-cols-3 gap-4">
              {(certificates || []).map((cert) => (
                <div key={cert.courseId} className="border-2 border-yellow-400 rounded-lg p-4 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900 dark:to-orange-900 transform hover:scale-105 transition-transform duration-300">
                  <Award className="w-8 h-8 text-yellow-600 mb-2" />
                  <h3 className="font-bold text-gray-900 dark:text-white mb-1">{cert.courseName}</h3>
                  <p className="text-xs text-gray-500 mt-2">Earned: {new Date(cert.completedAt).toLocaleDateString()}</p>
                  <button className="mt-3 w-full py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition font-semibold">
                    Download Certificate
                  </button>
                </div>
              ))}
            </div>
          </AnimatedBlock>
        )}

        {/* Tabs */}
        <AnimatedBlock delay={700} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg mb-6">
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            {['all', 'my-courses', 'completed'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-4 font-semibold ${
                  activeTab === tab 
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                {tab === 'all' ? 'All Courses' : tab === 'my-courses' ? 'My Courses' : 'Completed'}
              </button>
            ))}
          </div>
        </AnimatedBlock>

        {/* Courses Grid */}
        <AnimatedBlock delay={800} className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(courseLists[activeTab] || []).length === 0 && (
            <div className="md:col-span-2 lg:col-span-3 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center text-gray-500 dark:text-gray-400">
              <Inbox className="w-12 h-12 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">No Courses Found</h3>
              <p>There are no courses in this category yet.</p>
            </div>
          )}

          {(courseLists[activeTab] || []).map((course) => {
            const isCompleted = completedIds.has(course._id);
            const isEnrolled = enrolledIds.has(course._id);
            
            return (
              <div
                key={course._id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all transform hover:-translate-y-2 duration-300"
              >
                {/* Thumbnail */}
                <div className="relative">
                  <img
                    src={`https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=400&h=250&fit=crop&q=80&${course._id}`}
                    alt={course.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-3 left-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${categoryColors[course.difficulty]}`}>
                      {course.difficulty || 'beginner'}
                    </span>
                  </div>
                  {isEnrolled && !isCompleted && (
                    <div className="absolute top-3 right-3 bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                      Enrolled
                    </div>
                  )}
                  {isCompleted && (
                    <div className="absolute top-3 right-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                      Completed
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 h-14">
                    {course.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 h-20">
                    {course.description}
                  </p>

                  {/* Meta Info — ✅ Crash-proof */}
                  <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-4">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {course.estimatedTime || 0} min
                    </div>
                    <div className="flex items-center">
                      <BookOpen className="w-4 h-4 mr-1" />
                      {(course.modules?.length || 0)} modules
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                    <span className="text-green-600 dark:text-green-400 font-bold flex items-center">
                      <Award className="w-4 h-4 mr-1" /> +{course.ecoPointsReward || 0} points
                    </span>

                    {isCompleted ? (
                      <button className="px-4 py-2 bg-green-500 text-white rounded-lg font-semibold flex items-center" disabled>
                        <CheckCircle className="w-4 h-4 mr-2" /> Completed
                      </button>
                    ) : isEnrolled ? (
                      <button 
                        onClick={() => navigate(`/app/training/${course._id}`)}
                        className="px-4 py-2 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-lg hover:shadow-lg transition font-semibold flex items-center"
                      >
                        <Play className="w-4 h-4 mr-2" /> Continue
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleEnroll(course._id)}
                        disabled={enrollLoading === course._id}
                        className="px-4 py-2 border-2 border-blue-500 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900 transition font-semibold flex items-center disabled:opacity-50"
                      >
                        {enrollLoading === course._id ? (
                          <Loader className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <BookOpen className="w-4 h-4 mr-2" />
                        )}
                        Enroll Now
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </AnimatedBlock>
      </div>
    </div>
  );
};

export default Training;
