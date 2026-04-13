/* =============================================================================
 * Payments Controller (Razorpay + Wallet)
 * =============================================================================
 * Purpose:
 *   Handle wallet top-up payments via Razorpay and wallet eco-points redemption.
 *
 * Key Endpoints (mounted under `/api/payments`):
 *   - createOrder(req,res): POST `/create-order`
 *   - verifyPayment(req,res): POST `/verify`
 *   - redeemPoints(req,res): POST `/redeem`
 *   - getTransactions(req,res): GET `/transactions`
 *   - getWallet(req,res): GET `/wallet`
 *
 * Safety:
 *   - Razorpay client is created lazily; if keys are missing the API returns 503
 *     instead of crashing the server.
 *
 * Env Vars:
 *   - RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET
 * ============================================================================= */
const Razorpay = require('razorpay');
const crypto = require('crypto');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

let razorpayInstance = null;
function getRazorpay() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) return null;
  if (!razorpayInstance) {
    razorpayInstance = new Razorpay({ key_id: keyId, key_secret: keySecret });
  }
  return razorpayInstance;
}

/**
 * @desc Create a Razorpay order for wallet top-up
 * @route POST /api/payments/create-order
 * @access Private
 */
exports.createOrder = async (req, res) => {
  try {
    const razorpay = getRazorpay();
    if (!razorpay) {
      return res.status(503).json({
        success: false,
        message: 'Payment gateway is not configured (missing Razorpay keys)',
      });
    }

    const { amount, currency = 'INR' } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid amount' });
    }

    const options = {
      amount: Math.round(amount * 100), // ₹ → paise
      currency,
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    await Transaction.create({
      userId: req.user._id,
      type: 'wallet-topup',
      amount,
      orderId: order.id,
      paymentMethod: 'razorpay',
      status: 'pending',
      description: `Wallet top-up initiated via Razorpay`,
    });

    res.json({ success: true, order });
  } catch (error) {
    console.error('createOrder Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc Verify Razorpay payment and update wallet
 * @route POST /api/payments/verify
 * @access Private
 */
exports.verifyPayment = async (req, res) => {
  try {
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      return res.status(503).json({
        success: false,
        message: 'Payment gateway is not configured',
      });
    }

    const { orderId, paymentId, signature } = req.body;

    if (!orderId || !paymentId || !signature) {
      return res.status(400).json({ success: false, message: 'Missing payment details' });
    }

    const generatedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    if (generatedSignature !== signature) {
      return res.status(400).json({ success: false, message: 'Payment verification failed' });
    }

    const transaction = await Transaction.findOne({ orderId });
    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    transaction.status = 'completed';
    transaction.paymentId = paymentId;
    await transaction.save();

    await User.findByIdAndUpdate(transaction.userId, {
      $inc: { walletBalance: transaction.amount },
    });

    res.json({
      success: true,
      message: 'Payment verified successfully',
      transaction,
    });
  } catch (error) {
    console.error('verifyPayment Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc Redeem eco-points into wallet balance
 * @route POST /api/payments/redeem
 * @access Private
 */
exports.redeemPoints = async (req, res) => {
  try {
    const { points } = req.body;
    const user = await User.findById(req.user._id);

    if (!points || points <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid point value' });
    }
    if (user.ecoPoints < points) {
      return res.status(400).json({ success: false, message: 'Insufficient eco points' });
    }

    const conversionRate = 0.1; // 1 point = ₹0.10
    const amount = +(points * conversionRate).toFixed(2);

    user.ecoPoints -= points;
    user.walletBalance += amount;
    await user.save();

    await Transaction.create({
      userId: user._id,
      type: 'eco-points-redeemed',
      amount,
      ecoPoints: -points,
      description: `Redeemed ${points} eco-points for ₹${amount}`,
      status: 'completed',
      paymentMethod: 'wallet',
    });

    res.json({
      success: true,
      message: 'Points redeemed successfully',
      redeemedAmount: amount,
      walletBalance: user.walletBalance,
      remainingPoints: user.ecoPoints,
    });
  } catch (error) {
    console.error('redeemPoints Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc Get user’s wallet transactions (with pagination)
 * @route GET /api/payments/transactions
 * @access Private
 */
exports.getTransactions = async (req, res) => {
  try {
    const { page = 1, limit = 20, type } = req.query;

    const filter = { userId: req.user._id };
    if (type) filter.type = type;

    const [transactions, count] = await Promise.all([
      Transaction.find(filter)
        .sort('-createdAt')
        .limit(parseInt(limit))
        .skip((page - 1) * limit)
        .lean(),
      Transaction.countDocuments(filter),
    ]);

    res.json({
      success: true,
      transactions,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      total: count,
    });
  } catch (error) {
    console.error('getTransactions Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc Get wallet summary (eco-points + balance)
 * @route GET /api/payments/wallet
 * @access Private
 */
exports.getWallet = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('ecoPoints walletBalance');

    res.json({
      success: true,
      wallet: {
        ecoPoints: user.ecoPoints,
        walletBalance: user.walletBalance,
      },
    });
  } catch (error) {
    console.error('getWallet Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc Create a withdraw request (manual payout)
 * @route POST /api/payments/withdraw
 * @access Private
 *
 * Notes:
 * - This creates a withdrawal transaction and immediately deducts the amount from wallet balance.
 * - Actual payout processing is out of scope; admins/operators can later complete/refund externally.
 */
exports.requestWithdraw = async (req, res) => {
  try {
    const { amount, method, bankDetails, upiId, note } = req.body || {};

    const numericAmount = Number(amount);
    if (!numericAmount || Number.isNaN(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({ success: false, message: "Invalid amount" });
    }

    // Basic method validation
    const payoutMethod = String(method || "").trim().toLowerCase();
    const allowedMethods = new Set(["bank", "upi"]);
    if (!allowedMethods.has(payoutMethod)) {
      return res.status(400).json({
        success: false,
        message: "Invalid withdrawal method. Use 'bank' or 'upi'.",
      });
    }

    if (payoutMethod === "upi") {
      const normalizedUpi = String(upiId || "").trim();
      if (!normalizedUpi) {
        return res.status(400).json({
          success: false,
          message: "UPI ID is required for UPI withdrawals.",
        });
      }
    }

    if (payoutMethod === "bank") {
      const bd = bankDetails || {};
      const accountName = String(bd.accountName || "").trim();
      const accountNumber = String(bd.accountNumber || "").trim();
      const ifsc = String(bd.ifsc || "").trim().toUpperCase();

      if (!accountName || !accountNumber || !ifsc) {
        return res.status(400).json({
          success: false,
          message:
            "Bank details are incomplete. Please provide account name, account number, and IFSC.",
        });
      }
    }

    const user = await User.findById(req.user._id).select("walletBalance");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (user.walletBalance < numericAmount) {
      return res.status(400).json({
        success: false,
        message: "Insufficient wallet balance",
      });
    }

    // Deduct balance immediately to prevent double-withdrawal
    user.walletBalance = +(user.walletBalance - numericAmount).toFixed(2);
    await user.save();

    const tx = await Transaction.create({
      userId: req.user._id,
      type: "wallet-withdrawal",
      amount: numericAmount,
      ecoPoints: 0,
      category: "payment",
      paymentMethod: "wallet",
      status: "pending",
      description: `Withdrawal request (INR ${numericAmount})`,
      metadata: {
        method: payoutMethod,
        bankDetails: payoutMethod === "bank" ? bankDetails : undefined,
        upiId: payoutMethod === "upi" ? upiId : undefined,
        note: note ? String(note).slice(0, 500) : undefined,
      },
    });

    return res.status(201).json({
      success: true,
      message:
        "Withdrawal request submitted successfully. It will be processed shortly.",
      walletBalance: user.walletBalance,
      transaction: tx,
    });
  } catch (error) {
    console.error("requestWithdraw Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
