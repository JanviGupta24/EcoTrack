// routes/payment.routes.js
const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const { authenticate } = require('../middleware/auth.middleware');

/**
 * @route   POST /api/payments/create-order
 * @desc    Create a Razorpay order for wallet top-up
 * @access  Private
 */
router.post('/create-order', authenticate, paymentController.createOrder);

/**
 * @route   POST /api/payments/verify
 * @desc    Verify Razorpay payment and update wallet balance
 * @access  Private
 */
router.post('/verify', authenticate, paymentController.verifyPayment);

/**
 * @route   POST /api/payments/redeem
 * @desc    Redeem eco-points into wallet balance
 * @access  Private
 */
router.post('/redeem', authenticate, paymentController.redeemPoints);

/**
 * @route   GET /api/payments/transactions
 * @desc    Get all wallet transactions for the logged-in user
 * @access  Private
 */
router.get('/transactions', authenticate, paymentController.getTransactions);

/**
 * @route   GET /api/payments/wallet
 * @desc    Get user's wallet summary (ecoPoints + wallet balance)
 * @access  Private
 */
router.get('/wallet', authenticate, paymentController.getWallet);

module.exports = router;
