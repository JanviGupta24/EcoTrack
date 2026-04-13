/* =============================================================================
 * Training Routes
 * =============================================================================
 * Purpose:
 *   Route authenticated course/training operations under `/api/training`:
 *   - list courses and fetch course detail
 *   - enroll/complete courses
 *   - manage and retrieve course progress
 *   - fetch user certificates
 *
 * Security:
 *   All endpoints require authentication (`authenticate` middleware).
 * ============================================================================= */
const express = require('express');
const router = express.Router();
const trainingController = require('../controllers/training.controller');
const { authenticate } = require('../middleware/auth.middleware');

/**
 * @route   GET /api/trainings/courses
 * @desc    Get all active training courses (optionally filter by category/difficulty)
 * @access  Private
 */
router.get('/courses', authenticate, trainingController.getCourses);

/**
 * @route   GET /api/trainings/courses/:id
 * @desc    Get single course details (with enrollment/completion status)
 * @access  Private
 */
router.get('/courses/:id', authenticate, trainingController.getCourseById);

/**
 * @route   POST /api/trainings/courses/:id/enroll
 * @desc    Enroll user in a specific course
 * @access  Private
 */
router.post('/courses/:id/enroll', authenticate, trainingController.enrollCourse);

/**
 * @route   POST /api/trainings/courses/:id/complete
 * @desc    Mark course as completed, award eco-points, and issue certificate
 * @access  Private
 */
router.post('/courses/:id/complete', authenticate, trainingController.completeCourse);

/**
 * @route   GET /api/trainings/my-courses
 * @desc    Get all courses the user is enrolled in and/or completed
 * @access  Private
 */
router.get('/my-courses', authenticate, trainingController.getMyCourses);

/**
 * @route   GET /api/trainings/certificates
 * @desc    Get all certificates for the logged-in user
 * @access  Private
 */
router.get('/certificates', authenticate, trainingController.getCertificates);

/**
 * ✅ @route   GET /api/trainings/courses/:id/progress
 * @desc    Get user’s current progress (lessons, quizzes, assignments) for this course
 * @access  Private
 */
router.get('/courses/:id/progress', authenticate, trainingController.getCourseProgress);

/**
 * ✅ @route   POST /api/trainings/courses/:id/progress
 * @desc    Update user’s course progress (e.g. lesson completed, quiz submitted, assignment done)
 * @access  Private
 */
router.post('/courses/:id/progress', authenticate, trainingController.updateCourseProgress);

module.exports = router;
