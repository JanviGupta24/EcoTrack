/* =============================================================================
 * Course Detail Page
 * =============================================================================
 * Purpose:
 *   Show a single training course's detail view and allow the user to:
 *   - enroll/continue
 *   - mark progress (lesson/quiz/assignment)
 *   - complete the course and view outcomes
 *
 Key Behaviors:
 *   - Uses route param `:id` to fetch course data
 *   - Calls `trainingService.updateProgress()` to persist updates
 * ============================================================================= */

import React, { useEffect, useMemo, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  BookOpen,
  Clock,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Award,
  ArrowRight,
  AlertCircle,
  Loader,
} from "lucide-react";
import { trainingService } from "../api/services";
import AppLoader from "../components/Loader";
import { getApiErrorMessage } from "../utils/errors";

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [expandedLessons, setExpandedLessons] = useState([]);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [progressState, setProgressState] = useState({
    lessons: [],
    quizzes: [],
    assignments: [],
  });
  const [totals, setTotals] = useState({
    lessons: 0,
    quizzes: 0,
    assignments: 0,
  });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [currentLesson, setCurrentLesson] = useState(0);
  const [message, setMessage] = useState({ type: "", content: "" });
  const [error, setError] = useState("");
  const lessonRefs = useRef([]); // For auto-scroll

  const progressPercent = useMemo(() => {
    const done =
      (progressState.lessons?.length || 0) +
      (progressState.quizzes?.length || 0) +
      (progressState.assignments?.length || 0);
    const total =
      (totals.lessons || 0) + (totals.quizzes || 0) + (totals.assignments || 0);
    if (!total) return 0;
    return Math.min(100, Math.round((done / total) * 100));
  }, [progressState, totals]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      const [courseRes, progressRes] = await Promise.all([
        trainingService.getCourseById(id),
        trainingService.getCourseProgress(id).catch(() => null),
      ]);

      const fetchedCourse = courseRes.data?.course || null;
      setCourse(fetchedCourse);
      setIsEnrolled(Boolean(courseRes.data?.isEnrolled));
      setIsCompleted(Boolean(courseRes.data?.isCompleted));

      const p = progressRes?.data?.progress || {
        lessons: [],
        quizzes: [],
        assignments: [],
      };
      const t = progressRes?.data?.totals || {
        lessons: fetchedCourse?.modules?.length || 0,
        quizzes:
          fetchedCourse?.modules?.filter((m) => (m.quiz || []).length > 0).length ||
          0,
        assignments: fetchedCourse?.assignments?.length || 0,
      };
      setProgressState(p);
      setTotals(t);
    } catch (err) {
      console.error("Failed to load course:", err);
      setError(getApiErrorMessage(err, "Failed to load course. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const markProgress = async (type, index, successText) => {
    if (!isEnrolled) {
      setMessage({
        type: "error",
        content: "Please enroll in this course first.",
      });
      return false;
    }
    try {
      await trainingService.updateProgress(id, { type, moduleIndex: index });
      setProgressState((prev) => {
        if (prev[type]?.includes(index)) return prev;
        return { ...prev, [type]: [...(prev[type] || []), index] };
      });
      if (successText) setMessage({ type: "success", content: successText });
      return true;
    } catch (err) {
      setMessage({
        type: "error",
        content: getApiErrorMessage(err, "Could not update progress."),
      });
      return false;
    }
  };

  const handleEnroll = async () => {
    setActionLoading(true);
    setMessage({ type: "", content: "" });
    try {
      await trainingService.enrollCourse(id);
      setIsEnrolled(true);
      setMessage({
        type: "success",
        content: "Enrolled successfully. You can start learning now.",
      });
      await loadData();
    } catch (err) {
      setMessage({
        type: "error",
        content: getApiErrorMessage(err, "Failed to enroll. Please try again."),
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCompleteCourse = async () => {
    setActionLoading(true);
    setMessage({ type: "", content: "" });
    try {
      const res = await trainingService.completeCourse(id);
      setIsCompleted(true);
      setMessage({
        type: "success",
        content:
          res?.data?.message ||
          "Course completed successfully. Eco points have been awarded.",
      });
      await loadData();
    } catch (err) {
      setMessage({
        type: "error",
        content: getApiErrorMessage(err, "Failed to complete course."),
      });
    } finally {
      setActionLoading(false);
    }
  };

  const toggleLesson = async (index) => {
    const alreadyOpen = expandedLessons.includes(index);
    setExpandedLessons(
      alreadyOpen
        ? expandedLessons.filter((i) => i !== index)
        : [...expandedLessons, index]
    );

    if (!alreadyOpen) {
      await markProgress("lessons", index);
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

      await markProgress("lessons", nextIndex);

      // Auto-scroll to next lesson smoothly
      lessonRefs.current[nextIndex]?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  if (loading) return <AppLoader />;
  if (error) {
    return <div className="p-8 text-center text-red-600">{error}</div>;
  }
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
          <span>{course.estimatedTime || 0} min</span>
          <Award className="w-5 h-5 text-yellow-500 ml-3" />
          <span>+{course.ecoPointsReward || 0} pts</span>
        </div>
      </div>

      {message.content && (
        <div
          className={`mb-5 p-3 rounded-lg border-l-4 ${
            message.type === "success"
              ? "bg-green-50 border-green-500 text-green-700"
              : "bg-red-50 border-red-500 text-red-700"
          }`}
        >
          <div className="flex items-center">
            {message.type === "success" ? (
              <CheckCircle className="w-5 h-5 mr-2" />
            ) : (
              <AlertCircle className="w-5 h-5 mr-2" />
            )}
            <span>{message.content}</span>
          </div>
        </div>
      )}

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
          Your Progress ({progressPercent}%)
        </p>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-green-500 to-blue-600 h-3 rounded-full transition-all duration-700"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
      </div>

      <div className="mb-8 flex flex-wrap gap-3">
        {!isEnrolled ? (
          <button
            onClick={handleEnroll}
            disabled={actionLoading}
            className="px-5 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-semibold hover:shadow-md transition disabled:opacity-50"
          >
            {actionLoading ? (
              <span className="inline-flex items-center">
                <Loader className="w-4 h-4 mr-2 animate-spin" />
                Enrolling...
              </span>
            ) : (
              "Enroll to Start"
            )}
          </button>
        ) : (
          <button
            onClick={handleCompleteCourse}
            disabled={actionLoading || isCompleted}
            className={`px-5 py-2 rounded-lg font-semibold transition ${
              isCompleted
                ? "bg-green-100 text-green-700 cursor-not-allowed"
                : "bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:shadow-md"
            }`}
          >
            {actionLoading ? (
              <span className="inline-flex items-center">
                <Loader className="w-4 h-4 mr-2 animate-spin" />
                Completing...
              </span>
            ) : isCompleted ? (
              "Completed"
            ) : (
              "Mark as Complete"
            )}
          </button>
        )}
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

      {/* Quiz Section (one completion checkpoint per module that has quiz) */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
          <CheckCircle className="w-6 h-6 mr-2 text-blue-500" /> Quiz
        </h2>
        {(course.modules || []).filter((m) => (m.quiz || []).length > 0).length ===
        0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            This course has no quiz checkpoints.
          </p>
        ) : (
          <div className="space-y-3">
            {(course.modules || [])
              .map((m, idx) => ({ ...m, idx }))
              .filter((m) => (m.quiz || []).length > 0)
              .map((m) => {
                const done = progressState.quizzes?.includes(m.idx);
                return (
                  <div
                    key={`quiz-${m.idx}`}
                    className="flex items-center justify-between border border-gray-200 dark:border-gray-700 rounded-lg p-3"
                  >
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        Quiz checkpoint: {m.title}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {m.quiz.length} question(s)
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        markProgress(
                          "quizzes",
                          m.idx,
                          "Quiz checkpoint marked as completed."
                        )
                      }
                      disabled={done}
                      className={`px-4 py-2 rounded-lg font-semibold ${
                        done
                          ? "bg-green-100 text-green-700 cursor-not-allowed"
                          : "bg-blue-600 text-white hover:bg-blue-700"
                      }`}
                    >
                      {done ? "Completed" : "Mark Complete"}
                    </button>
                  </div>
                );
              })}
          </div>
        )}
      </div>

      {/* Assignments (checkpoint completion) */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
          <BookOpen className="w-6 h-6 mr-2 text-purple-500" /> Assignments
        </h2>
        {(course.assignments || []).length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            This course has no assignments.
          </p>
        ) : (
          <div className="space-y-3">
            {(course.assignments || []).map((a, idx) => {
              const done = progressState.assignments?.includes(idx);
              return (
                <div
                  key={`assign-${idx}`}
                  className="flex items-center justify-between border border-gray-200 dark:border-gray-700 rounded-lg p-3"
                >
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {a.title || `Assignment ${idx + 1}`}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {a.description || "Complete this assignment to progress."}
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      markProgress(
                        "assignments",
                        idx,
                        "Assignment checkpoint marked as completed."
                      )
                    }
                    disabled={done}
                    className={`px-4 py-2 rounded-lg font-semibold ${
                      done
                        ? "bg-green-100 text-green-700 cursor-not-allowed"
                        : "bg-purple-600 text-white hover:bg-purple-700"
                    }`}
                  >
                    {done ? "Completed" : "Mark Complete"}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseDetail;
