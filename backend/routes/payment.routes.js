/* =============================================================================
 * Payment Routes (Wallet + Razorpay)
 * =============================================================================
 * Purpose:
 *   Route requests under `/api/payments` to payment controller methods:
 *   - create-order: create Razorpay order for wallet top-up
 *   - verify: verify Razorpay payment signature and update wallet
 *   - redeem: redeem eco-points into wallet balance
 *   - transactions: fetch wallet transaction history
 *   - wallet: fetch wallet summary for current user
 *
 * Security:
 *   All endpoints require authentication via `authenticate` middleware.
 * ============================================================================= */
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

/**
 * @route   POST /api/payments/withdraw
 * @desc    Create a wallet withdrawal request (manual payout)
 * @access  Private
 */
router.post('/withdraw', authenticate, paymentController.requestWithdraw);

module.exports = router;
