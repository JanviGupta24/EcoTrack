/* =============================================================================
 * AI Routes
 * =============================================================================
 * Purpose:
 *   Expose authenticated AI endpoints used by the EcoTrack frontend:
 *   - `POST /api/ai/chatbot`
 *   - `POST /api/ai/classify-waste` (and alias `POST /api/ai/classify`)
 *   - `POST /api/ai/generate-insights`
 *   - `POST /api/ai/generate-quiz`
 *
 * Security:
 *   All routes require `authenticate` middleware.
 * ============================================================================= */
const express = require('express');
const router = express.Router();
const aiController = require('../controllers/ai.controller');
const { authenticate } = require('../middleware/auth.middleware');

/**
 * @route   POST /api/ai/chatbot
 * @desc    Interact with EcoBot - AI assistant for waste management, recycling & eco-tips
 * @body    { message: string, conversationHistory?: array }
 * @access  Private (Authenticated users)
 */
router.post('/chatbot', authenticate, aiController.chatbot);

/**
 * @route   POST /api/ai/classify-waste
 * @desc    Classify waste image and suggest recycling tips
 * @body    { imageUrl: string }
 * @access  Private (Authenticated users)
 */
router.post('/classify-waste', authenticate, aiController.classifyWaste);
/** @route POST /api/ai/classify — alias used by the React client */
router.post('/classify', authenticate, aiController.classifyWaste);

/**
 * @route   POST /api/ai/generate-insights
 * @desc    Generate AI-powered environmental data insights
 * @body    { data: object, analysisType: string }
 * @access  Private (Authenticated users)
 */
router.post('/generate-insights', authenticate, aiController.generateInsights);

/**
 * @route   POST /api/ai/generate-quiz
 * @desc    Generate an eco-awareness quiz dynamically via AI
 * @body    { topic: string, difficulty?: string, questionCount?: number }
 * @access  Private (Authenticated users)
 */
router.post('/generate-quiz', authenticate, aiController.generateQuiz);

module.exports = router;
