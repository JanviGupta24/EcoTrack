import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  BookOpen,
  Clock,
  Play,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Award,
  ArrowRight,
} from "lucide-react";
import { trainingService } from "../api/services";
import AppLoader from "../components/Loader";

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [expandedLessons, setExpandedLessons] = useState([]);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [currentLesson, setCurrentLesson] = useState(0);
  const lessonRefs = useRef([]); // For auto-scroll

  // Load course data
  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await trainingService.getCourseById(id);
        setCourse(res.data.course);
      } catch (err) {
        console.error("Failed to load course:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [id]);

  // Toggle lesson expand/collapse
  const toggleLesson = async (index) => {
    const alreadyOpen = expandedLessons.includes(index);
    setExpandedLessons(
      alreadyOpen
        ? expandedLessons.filter((i) => i !== index)
        : [...expandedLessons, index]
    );

    if (!alreadyOpen) {
      await trainingService.updateProgress(id, {
        type: "lessons",
        moduleIndex: index,
      });
      setProgress((prev) => Math.min(prev + 10, 100));
      setCurrentLesson(index);
    }
  };

  // Move to next lesson
  const goToNextLesson = async () => {
    if (!course?.modules) return;

    const nextIndex = currentLesson + 1;
    if (nextIndex < course.modules.length) {
      setCurrentLesson(nextIndex);
      if (!expandedLessons.includes(nextIndex)) {
        setExpandedLessons([...expandedLessons, nextIndex]);
      }

      await trainingService.updateProgress(id, {
        type: "lessons",
        moduleIndex: nextIndex,
      });
      setProgress((prev) => Math.min(prev + 10, 100));

      // Auto-scroll to next lesson smoothly
      lessonRefs.current[nextIndex]?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    } else {
      alert("🎉 You've reached the end of the lessons!");
    }
  };

  const handleQuizSubmit = async (e) => {
    e.preventDefault();
    await trainingService.updateProgress(id, { type: "quizzes" });
    setProgress((prev) => Math.min(prev + 30, 100));
    alert("✅ Quiz submitted successfully!");
  };

  const handleAssignmentSubmit = async (e) => {
    e.preventDefault();
    await trainingService.updateProgress(id, { type: "assignments" });
    setProgress((prev) => Math.min(prev + 30, 100));
    alert("📤 Assignment uploaded successfully!");
  };

  if (loading) return <AppLoader />;
  if (!course)
    return (
      <div className="p-8 text-center text-gray-600">Course not found</div>
    );

  return (
    <div className="max-w-6xl mx-auto py-10 px-6 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 min-h-screen rounded-lg shadow-md">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => navigate("/app/training")}
          className="text-blue-600 hover:underline text-sm font-medium"
        >
          ← Back to Training
        </button>
        <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
          <Clock className="w-5 h-5" />
          <span>{course.estimatedTime} min</span>
          <Award className="w-5 h-5 text-yellow-500 ml-3" />
          <span>+{course.ecoPointsReward} pts</span>
        </div>
      </div>

      {/* Course Header */}
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
        {course.title}
      </h1>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        {course.description}
      </p>

      {/* Intro Video */}
      {course.introVideoUrl && (
        <div className="aspect-w-16 aspect-h-9 mb-8">
          <iframe
            src={course.introVideoUrl}
            title="Course Intro Video"
            frameBorder="0"
            allowFullScreen
            className="w-full h-96 rounded-lg shadow-lg"
          ></iframe>
        </div>
      )}

      {/* Progress Bar */}
      <div className="mb-8">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
          Your Progress
        </p>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-green-500 to-blue-600 h-3 rounded-full transition-all duration-700"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Lessons */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
          <BookOpen className="w-6 h-6 mr-2 text-green-500" /> Lessons
        </h2>

        {(course.modules || []).map((lesson, index) => (
          <div
            key={index}
            ref={(el) => (lessonRefs.current[index] = el)}
            className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden mb-3"
          >
            <button
              className="w-full flex justify-between items-center px-4 py-3 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition"
              onClick={() => toggleLesson(index)}
            >
              <span className="font-medium text-gray-800 dark:text-gray-200">
                {index + 1}. {lesson.title}
              </span>
              {expandedLessons.includes(index) ? (
                <ChevronUp />
              ) : (
                <ChevronDown />
              )}
            </button>

            {expandedLessons.includes(index) && (
              <div className="p-5 text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
                {/* Video */}
                <div className="aspect-w-16 aspect-h-9 mb-4">
                  <iframe
                    src={
                      lesson.videoUrl ||
                      "https://www.youtube.com/embed/dQw4w9WgXcQ"
                    }
                    title={`Lesson ${index + 1} Video`}
                    frameBorder="0"
                    allowFullScreen
                    className="w-full h-64 rounded-lg shadow-lg"
                  ></iframe>
                </div>

                {/* Lesson Text */}
                <p className="text-sm leading-relaxed mb-4">
                  {lesson.content || "No content provided."}
                </p>

                {/* ✅ Next Lesson Button */}
                <div className="flex justify-end">
                  {index < course.modules.length - 1 ? (
                    <button
                      onClick={goToNextLesson}
                      className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:shadow-md transition"
                    >
                      Next Lesson <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <p className="text-green-600 font-medium flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500" /> All
                      lessons completed!
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Quiz Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
          <CheckCircle className="w-6 h-6 mr-2 text-blue-500" /> Quiz
        </h2>
        <form onSubmit={handleQuizSubmit}>
          {(course.modules[0]?.quiz || []).map((q, i) => (
            <div key={i} className="mb-4">
              <p className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
                {i + 1}. {q.question}
              </p>
              {q.options.map((opt, j) => (
                <label
                  key={j}
                  className="block text-sm text-gray-600 dark:text-gray-400"
                >
                  <input type="radio" name={`q${i}`} className="mr-2" /> {opt}
                </label>
              ))}
            </div>
          ))}
          <button
            type="submit"
            className="mt-3 bg-gradient-to-r from-green-500 to-blue-600 text-white px-5 py-2 rounded-lg font-semibold hover:shadow-md transition"
          >
            Submit Quiz
          </button>
        </form>
      </div>

      {/* Assignments */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
          <Play className="w-6 h-6 mr-2 text-purple-500" /> Assignments
        </h2>
        <form onSubmit={handleAssignmentSubmit}>
          <div className="mb-4">
            <p className="font-semibold text-gray-800 dark:text-gray-200">
              Upload your work
            </p>
            <input
              type="file"
              className="block w-full border border-gray-300 rounded-lg p-2 mb-2 text-sm"
            />
          </div>
          <button
            type="submit"
            className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-5 py-2 rounded-lg font-semibold hover:shadow-md transition"
          >
            Submit Assignment
          </button>
        </form>
      </div>
    </div>
  );
};

export default CourseDetail;
