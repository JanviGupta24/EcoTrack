// controllers/training.controller.js
const Training = require("../models/Training");
const User = require("../models/User");
const Transaction = require("../models/Transaction");

/**
 * @desc Get all active courses (optionally filter by category/difficulty)
 * @route GET /api/training/courses
 */
exports.getCourses = async (req, res) => {
  try {
    const { category, difficulty, search } = req.query;

    const filter = { isActive: true };
    if (category) filter.category = category;
    if (difficulty) filter.difficulty = difficulty;
    if (search) filter.$text = { $search: search };

    const courses = await Training.find(filter).select(
      "title description category difficulty ecoPointsReward estimatedTime isActive createdAt updatedAt"
    );

    return res.status(200).json({
      success: true,
      count: courses.length,
      courses,
    });
  } catch (error) {
    console.error("getCourses Error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * @desc Get single course details
 * @route GET /api/training/courses/:id
 */
exports.getCourseById = async (req, res) => {
  try {
    const course = await Training.findById(req.params.id);
    if (!course || !course.isActive)
      return res
        .status(404)
        .json({ success: false, message: "Course not found or inactive" });

    const userId = req.user?._id;
    const isEnrolled = userId
      ? course.enrolledUsers?.some((id) => id.equals(userId))
      : false;
    const isCompleted = userId
      ? course.completedUsers?.some((id) => id.equals(userId))
      : false;

    return res.status(200).json({
      success: true,
      course,
      isEnrolled,
      isCompleted,
    });
  } catch (error) {
    console.error("getCourseById Error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * @desc Enroll user in a course
 * @route POST /api/training/courses/:id/enroll
 */
exports.enrollCourse = async (req, res) => {
  try {
    const course = await Training.findById(req.params.id);
    if (!course)
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });

    if (course.enrolledUsers.includes(req.user._id))
      return res
        .status(400)
        .json({ success: false, message: "Already enrolled in this course" });

    course.enrolledUsers.push(req.user._id);
    await course.save();

    return res.status(200).json({
      success: true,
      message: `Successfully enrolled in ${course.title}`,
    });
  } catch (error) {
    console.error("enrollCourse Error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * @desc Mark course as completed, award eco-points & certification
 * @route POST /api/training/courses/:id/complete
 */
exports.completeCourse = async (req, res) => {
  try {
    const { quizAnswers } = req.body;
    const course = await Training.findById(req.params.id);
    if (!course)
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });

    const userId = req.user._id;

    if (course.completedUsers.includes(userId))
      return res
        .status(400)
        .json({ success: false, message: "Course already completed" });

    // --- Optional quiz scoring ---
    let totalQuestions = 0,
      correctAnswers = 0;
    if (quizAnswers && Array.isArray(quizAnswers)) {
      for (const mod of course.modules) {
        for (const q of mod.quiz || []) {
          totalQuestions++;
          const userAns = quizAnswers.find((a) => a.question === q.question);
          if (userAns && userAns.answer === q.answer) correctAnswers++;
        }
      }
    }
    const quizScore = totalQuestions
      ? Math.round((correctAnswers / totalQuestions) * 100)
      : null;

    // --- Mark completion ---
    course.completedUsers.push(userId);
    await course.save();

    // --- Award points and certification ---
    await User.findByIdAndUpdate(userId, {
      $inc: { ecoPoints: course.ecoPointsReward },
      $push: {
        certifications: {
          courseId: course._id,
          courseName: course.title,
          completedAt: new Date(),
          certificateUrl: `/certificates/${course._id}/${userId}.pdf`,
        },
      },
    });

    // --- Log transaction ---
    await Transaction.create({
      userId,
      type: "eco-points-earned",
      amount: 0,
      ecoPoints: course.ecoPointsReward,
      description: `Completed course: ${course.title}`,
      relatedTraining: course._id,
      status: "completed",
    });

    return res.status(200).json({
      success: true,
      message: "Course completed successfully",
      ecoPointsAwarded: course.ecoPointsReward,
      quizScore,
    });
  } catch (error) {
    console.error("completeCourse Error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * @desc Get all courses user is enrolled in or completed
 * @route GET /api/training/my-courses
 */
exports.getMyCourses = async (req, res) => {
  try {
    const userId = req.user._id;

    const [enrolledCourses, completedCourses] = await Promise.all([
      Training.find({ enrolledUsers: userId }).select(
        "title category difficulty ecoPointsReward estimatedTime"
      ),
      Training.find({ completedUsers: userId }).select(
        "title category difficulty ecoPointsReward estimatedTime"
      ),
    ]);

    return res.status(200).json({
      success: true,
      enrolledCourses,
      completedCourses,
    });
  } catch (error) {
    console.error("getMyCourses Error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * @desc Get all certificates for user
 * @route GET /api/training/certificates
 */
exports.getCertificates = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("certifications");
    return res.status(200).json({
      success: true,
      certificates: user.certifications || [],
    });
  } catch (error) {
    console.error("getCertificates Error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * @desc Get course progress for user
 * @route GET /api/training/courses/:id/progress
 */
exports.getCourseProgress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    const progress = user.progress?.[req.params.id] || {
      lessons: [],
      quizzes: [],
      assignments: [],
    };

    return res.status(200).json({ success: true, progress });
  } catch (error) {
    console.error("getCourseProgress Error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * @desc Update user progress for specific course
 * @route POST /api/training/courses/:id/progress
 */
exports.updateCourseProgress = async (req, res) => {
  try {
    const { type, moduleIndex } = req.body;
    const validTypes = ["lessons", "quizzes", "assignments"];
    if (!validTypes.includes(type))
      return res
        .status(400)
        .json({ success: false, message: "Invalid progress type" });

    const user = await User.findById(req.user._id);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    if (!user.progress) user.progress = {};
    if (!user.progress[req.params.id]) {
      user.progress[req.params.id] = {
        lessons: [],
        quizzes: [],
        assignments: [],
      };
    }

    if (!user.progress[req.params.id][type].includes(moduleIndex)) {
      user.progress[req.params.id][type].push(moduleIndex);
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Progress updated successfully",
      progress: user.progress[req.params.id],
    });
  } catch (error) {
    console.error("updateCourseProgress Error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
