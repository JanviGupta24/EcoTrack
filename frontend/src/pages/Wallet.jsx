// src/pages/Wallet.jsx
/* =============================================================================
 * Wallet Page
 * =============================================================================
 * Purpose:
 *   Display a user's wallet summary (eco points + wallet balance) and provide
 *   actions such as redeeming eco points into wallet currency.
 *
 * Data:
 *   - `paymentService.getWallet()` for balances
 *   - `paymentService.getTransactions()` for transaction history
 * ============================================================================= */

import React, { useState, useEffect } from "react";
import { 
  Award, DollarSign, ArrowDownRight, CreditCard, TrendingUp, 
  ArrowUpRight, Loader, AlertCircle, CheckCircle, Inbox, X, ShieldCheck
} from "lucide-react";
import { paymentService } from "../api/services";
import AppLoader from "../components/Loader"; // Using AppLoader to avoid naming conflict with Loader icon
import { getApiErrorMessage } from "../utils/errors";

// We assume the keyframes 'animate-slideInUp' are defined globally 
// in App.js or index.css, as established in previous files.

// --- 1. Modern Animation Wrapper ---
const AnimatedBlock = ({ children, delay = 0, className = "" }) => (
  <div 
    className={`animate-slideInUp ${className}`}
    style={{ animationDelay: `${delay}ms` }}
  >
    {children}
  </div>
);

const Wallet = () => {
  const [wallet, setWallet] = useState({ ecoPoints: 0, walletBalance: 0 });
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true); // For initial page load
  const [actionLoading, setActionLoading] = useState(false); // For redeem button
  const [error, setError] = useState(null);
  
  const [redeemAmount, setRedeemAmount] = useState("");
  const [message, setMessage] = useState({ type: "", content: "" }); // Renamed for clarity

  const [topUpOpen, setTopUpOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [statsOpen, setStatsOpen] = useState(false);

  const [topUpAmount, setTopUpAmount] = useState("");
  const [topUpLoading, setTopUpLoading] = useState(false);

  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawMethod, setWithdrawMethod] = useState("upi"); // upi | bank
  const [withdrawUpi, setWithdrawUpi] = useState("");
  const [withdrawBank, setWithdrawBank] = useState({
    accountName: "",
    accountNumber: "",
    ifsc: "",
  });

  const razorpayKeyId = process.env.REACT_APP_RAZORPAY_KEY_ID?.trim();

  // Fetch all wallet data on mount
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [walletRes, transactionsRes] = await Promise.all([
        paymentService.getWallet(),
        paymentService.getTransactions()
      ]);

      setWallet(walletRes.data.wallet);
      setTransactions(transactionsRes.data.transactions);
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to load wallet data. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Implement redeem points functionality
  const handleRedeem = async (e) => {
    e.preventDefault();
    const points = parseInt(redeemAmount);
    if (!points || points <= 0) {
      setMessage({ type: "error", content: "Please enter a valid amount of points." });
      return;
    }
    if (points > wallet.ecoPoints) {
      setMessage({ type: "error", content: "You do not have enough points to redeem." });
      return;
    }

    setActionLoading(true); // Use action-specific loading
    setMessage({ type: "", content: "" });

    try {
      const response = await paymentService.redeemPoints({ points });
      
      // Refresh data after successful redemption
      setMessage({
        type: "success",
        content: `Successfully redeemed ${points} points for ₹${response.data.redeemedAmount ?? 0}!`,
      });
      setRedeemAmount("");
      fetchData(); // Refetch all data to update balances
    } catch (err) {
      setMessage({
        type: "error",
        content: getApiErrorMessage(err, "Redemption failed. Please try again."),
      });
    } finally {
      setActionLoading(false); // Stop action loading
    }
  };

  const loadRazorpay = () =>
    new Promise((resolve, reject) => {
      if (window.Razorpay) return resolve(true);
      const existing = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
      if (existing) {
        existing.addEventListener("load", () => resolve(true));
        existing.addEventListener("error", () => reject(new Error("Failed to load Razorpay SDK")));
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => reject(new Error("Failed to load Razorpay SDK"));
      document.body.appendChild(script);
    });

  const openTopUp = () => {
    setMessage({ type: "", content: "" });
    setTopUpAmount("");
    setTopUpOpen(true);
  };

  const startTopUp = async (e) => {
    e?.preventDefault?.();
    setMessage({ type: "", content: "" });

    const amount = Number(topUpAmount);
    if (!amount || Number.isNaN(amount) || amount <= 0) {
      setMessage({ type: "error", content: "Please enter a valid top-up amount." });
      return;
    }

    if (!razorpayKeyId) {
      setMessage({
        type: "error",
        content:
          "Razorpay is not configured in the frontend. Set REACT_APP_RAZORPAY_KEY_ID and restart the frontend.",
      });
      return;
    }

    setTopUpLoading(true);
    try {
      await loadRazorpay();

      const { data } = await paymentService.createOrder({ amount });
      const order = data?.order;
      if (!order?.id) {
        throw new Error("Failed to create payment order.");
      }

      const options = {
        key: razorpayKeyId,
        amount: order.amount,
        currency: order.currency,
        name: "EcoTrack",
        description: "Wallet top-up",
        order_id: order.id,
        handler: async function (response) {
          try {
            await paymentService.verifyPayment({
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
            });

            setMessage({
              type: "success",
              content: "Top-up successful. Your wallet balance has been updated.",
            });
            setTopUpOpen(false);
            await fetchData();
          } catch (verifyErr) {
            setMessage({
              type: "error",
              content: getApiErrorMessage(
                verifyErr,
                "Payment captured, but verification failed. Please contact support."
              ),
            });
          }
        },
        modal: {
          ondismiss: function () {
            // user cancelled the payment popup
          },
        },
        theme: { color: "#2563eb" },
      };

      const rz = new window.Razorpay(options);
      rz.on("payment.failed", function (resp) {
        setMessage({
          type: "error",
          content:
            resp?.error?.description ||
            resp?.error?.reason ||
            "Payment failed. Please try again.",
        });
      });
      rz.open();
    } catch (err) {
      setMessage({ type: "error", content: getApiErrorMessage(err, "Top-up failed. Please try again.") });
    } finally {
      setTopUpLoading(false);
    }
  };

  const openWithdraw = () => {
    setMessage({ type: "", content: "" });
    setWithdrawAmount("");
    setWithdrawMethod("upi");
    setWithdrawUpi("");
    setWithdrawBank({ accountName: "", accountNumber: "", ifsc: "" });
    setWithdrawOpen(true);
  };

  const submitWithdraw = async (e) => {
    e?.preventDefault?.();
    setMessage({ type: "", content: "" });

    const amount = Number(withdrawAmount);
    if (!amount || Number.isNaN(amount) || amount <= 0) {
      setMessage({ type: "error", content: "Please enter a valid withdrawal amount." });
      return;
    }
    if (amount > wallet.walletBalance) {
      setMessage({ type: "error", content: "Insufficient wallet balance for this withdrawal." });
      return;
    }

    if (withdrawMethod === "upi" && !withdrawUpi.trim()) {
      setMessage({ type: "error", content: "Please enter a valid UPI ID." });
      return;
    }
    if (withdrawMethod === "bank") {
      const { accountName, accountNumber, ifsc } = withdrawBank;
      if (!accountName.trim() || !accountNumber.trim() || !ifsc.trim()) {
        setMessage({
          type: "error",
          content: "Please provide complete bank details (name, account number, IFSC).",
        });
        return;
      }
    }

    setWithdrawLoading(true);
    try {
      const payload =
        withdrawMethod === "upi"
          ? { amount, method: "upi", upiId: withdrawUpi.trim() }
          : { amount, method: "bank", bankDetails: { ...withdrawBank, ifsc: withdrawBank.ifsc.trim().toUpperCase() } };

      const { data } = await paymentService.requestWithdraw(payload);
      setMessage({ type: "success", content: data?.message || "Withdrawal request submitted." });
      setWithdrawOpen(false);
      await fetchData();
    } catch (err) {
      setMessage({ type: "error", content: getApiErrorMessage(err, "Withdrawal request failed. Please try again.") });
    } finally {
      setWithdrawLoading(false);
    }
  };

  const walletStats = React.useMemo(() => {
    const stats = {
      topUps: 0,
      redeemed: 0,
      withdrawals: 0,
      pendingWithdrawals: 0,
      completedCount: 0,
      pendingCount: 0,
    };
    for (const t of transactions || []) {
      if (t.status === "completed") stats.completedCount += 1;
      if (t.status === "pending") stats.pendingCount += 1;

      if (t.type === "wallet-topup" && t.status === "completed") stats.topUps += Number(t.amount || 0);
      if (t.type === "eco-points-redeemed" && t.status === "completed") stats.redeemed += Number(t.amount || 0);
      if (t.type === "wallet-withdrawal") {
        if (t.status === "pending") stats.pendingWithdrawals += Number(t.amount || 0);
        if (t.status === "completed" || t.status === "pending") stats.withdrawals += Number(t.amount || 0);
      }
    }
    stats.topUps = +stats.topUps.toFixed(2);
    stats.redeemed = +stats.redeemed.toFixed(2);
    stats.withdrawals = +stats.withdrawals.toFixed(2);
    stats.pendingWithdrawals = +stats.pendingWithdrawals.toFixed(2);
    return stats;
  }, [transactions]);


  if (loading && transactions.length === 0) {
    return <AppLoader />;
  }

  return (
    // pt-20 removed, App.js handles layout padding
    <div className="bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        
        <AnimatedBlock delay={0}>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8 pt-8">My Wallet</h1>
        </AnimatedBlock>

        {error && (
          <AnimatedBlock delay={100} className="mb-4 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded-lg">
            <div className="flex items-center"><AlertCircle className="w-6 h-6 mr-3" /> <span className="font-medium">{error}</span></div>
          </AnimatedBlock>
        )}

        {/* Dynamic balances with animations */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <AnimatedBlock delay={200}>
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-8 shadow-lg text-white transform hover:scale-105 transition-transform duration-300">
              <Award className="w-10 h-10 mb-4" />
              <div className="text-sm opacity-90 mb-2">Eco Points Balance</div>
              <div className="text-4xl font-bold mb-2">{wallet.ecoPoints.toLocaleString()}</div>
              <div className="text-sm opacity-75">≈ ₹{(wallet.ecoPoints * 0.1).toFixed(2)} value</div>
            </div>
          </AnimatedBlock>
          <AnimatedBlock delay={300}>
            <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl p-8 shadow-lg text-white transform hover:scale-105 transition-transform duration-300">
              <DollarSign className="w-10 h-10 mb-4" />
              <div className="text-sm opacity-90 mb-2">Wallet Balance</div>
              <div className="text-4xl font-bold mb-2">₹{wallet.walletBalance.toFixed(2)}</div>
              <button 
                onClick={openWithdraw}
                className="mt-4 bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold hover:shadow-lg hover:bg-gray-100 transition"
              >
                Withdraw
              </button>
            </div>
          </AnimatedBlock>
        </div>

        {/* 3. Quick Actions (now separated from Redeem form) */}
        <AnimatedBlock delay={400} className="grid md:grid-cols-2 gap-4 mb-8">
            <button 
              onClick={openTopUp}
              className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg hover:shadow-xl transition text-center flex items-center justify-center space-x-2 transform hover:scale-105"
            >
              <CreditCard className="w-6 h-6 text-blue-500" />
              <span className="font-semibold text-gray-900 dark:text-white">Top Up Wallet</span>
            </button>
            <button 
              onClick={() => setStatsOpen(true)}
              className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg hover:shadow-xl transition text-center flex items-center justify-center space-x-2 transform hover:scale-105"
            >
              <TrendingUp className="w-6 h-6 text-purple-500" />
              <span className="font-semibold text-gray-900 dark:text-white">View Stats</span>
            </button>
        </AnimatedBlock>

        {/* ------------------------------------------------------------------ */}
        {/*                               MODALS                               */}
        {/* ------------------------------------------------------------------ */}
        {topUpOpen && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fadeIn">
            <div className="w-full max-w-lg bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden">
              <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Top up wallet</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Pay securely via Razorpay.</p>
                </div>
                <button
                  onClick={() => setTopUpOpen(false)}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                  aria-label="Close"
                >
                  <X className="w-5 h-5 text-gray-700 dark:text-gray-200" />
                </button>
              </div>

              <form onSubmit={startTopUp} className="p-5 space-y-4">
                <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-200 text-sm flex items-start gap-2">
                  <ShieldCheck className="w-5 h-5 mt-0.5" />
                  <div>
                    <div className="font-semibold">Secure payment</div>
                    <div className="opacity-90">
                      Your card/UPI details are handled by Razorpay. EcoTrack never stores them.
                    </div>
                  </div>
                </div>

                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Amount (₹)
                </label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={topUpAmount}
                  onChange={(e) => setTopUpAmount(e.target.value)}
                  placeholder="e.g. 100"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                />

                <button
                  type="submit"
                  disabled={topUpLoading}
                  className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-semibold hover:shadow-lg transition flex items-center justify-center disabled:opacity-50"
                >
                  {topUpLoading ? (
                    <>
                      <Loader className="w-5 h-5 mr-2 animate-spin" /> Starting payment...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5 mr-2" /> Pay & Top up
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}

        {withdrawOpen && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fadeIn">
            <div className="w-full max-w-lg bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden">
              <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Withdraw funds</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Submit a withdrawal request for manual processing.
                  </p>
                </div>
                <button
                  onClick={() => setWithdrawOpen(false)}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                  aria-label="Close"
                >
                  <X className="w-5 h-5 text-gray-700 dark:text-gray-200" />
                </button>
              </div>

              <form onSubmit={submitWithdraw} className="p-5 space-y-4">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Available balance: <span className="font-semibold">₹{wallet.walletBalance.toFixed(2)}</span>
                </div>

                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Amount (₹)
                </label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="e.g. 250"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Payout method
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setWithdrawMethod("upi")}
                      className={`flex-1 px-4 py-2 rounded-lg border font-semibold transition ${
                        withdrawMethod === "upi"
                          ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-200"
                          : "border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                      }`}
                    >
                      UPI
                    </button>
                    <button
                      type="button"
                      onClick={() => setWithdrawMethod("bank")}
                      className={`flex-1 px-4 py-2 rounded-lg border font-semibold transition ${
                        withdrawMethod === "bank"
                          ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-200"
                          : "border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                      }`}
                    >
                      Bank
                    </button>
                  </div>
                </div>

                {withdrawMethod === "upi" ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      UPI ID
                    </label>
                    <input
                      type="text"
                      value={withdrawUpi}
                      onChange={(e) => setWithdrawUpi(e.target.value)}
                      placeholder="yourname@bank"
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Account holder name
                      </label>
                      <input
                        type="text"
                        value={withdrawBank.accountName}
                        onChange={(e) =>
                          setWithdrawBank((p) => ({ ...p, accountName: e.target.value }))
                        }
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Account number
                      </label>
                      <input
                        type="text"
                        value={withdrawBank.accountNumber}
                        onChange={(e) =>
                          setWithdrawBank((p) => ({ ...p, accountNumber: e.target.value }))
                        }
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        IFSC
                      </label>
                      <input
                        type="text"
                        value={withdrawBank.ifsc}
                        onChange={(e) => setWithdrawBank((p) => ({ ...p, ifsc: e.target.value }))}
                        placeholder="e.g. HDFC0000123"
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={withdrawLoading}
                  className="w-full px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-semibold hover:shadow-lg transition flex items-center justify-center disabled:opacity-50"
                >
                  {withdrawLoading ? (
                    <>
                      <Loader className="w-5 h-5 mr-2 animate-spin" /> Submitting...
                    </>
                  ) : (
                    "Submit withdrawal request"
                  )}
                </button>
              </form>
            </div>
          </div>
        )}

        {statsOpen && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fadeIn">
            <div className="w-full max-w-lg bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden">
              <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Wallet stats</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Summary from your transactions.</p>
                </div>
                <button
                  onClick={() => setStatsOpen(false)}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                  aria-label="Close"
                >
                  <X className="w-5 h-5 text-gray-700 dark:text-gray-200" />
                </button>
              </div>
              <div className="p-5 grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20">
                  <div className="text-sm text-gray-600 dark:text-gray-300">Top-ups (completed)</div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">₹{walletStats.topUps.toFixed(2)}</div>
                </div>
                <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20">
                  <div className="text-sm text-gray-600 dark:text-gray-300">Redeemed value</div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">₹{walletStats.redeemed.toFixed(2)}</div>
                </div>
                <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-900/20">
                  <div className="text-sm text-gray-600 dark:text-gray-300">Withdrawals (total)</div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">₹{walletStats.withdrawals.toFixed(2)}</div>
                </div>
                <div className="p-4 rounded-xl bg-yellow-50 dark:bg-yellow-900/20">
                  <div className="text-sm text-gray-600 dark:text-gray-300">Pending withdrawals</div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">₹{walletStats.pendingWithdrawals.toFixed(2)}</div>
                </div>
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900/30">
                  <div className="text-sm text-gray-600 dark:text-gray-300">Transactions (completed)</div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{walletStats.completedCount}</div>
                </div>
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900/30">
                  <div className="text-sm text-gray-600 dark:text-gray-300">Transactions (pending)</div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{walletStats.pendingCount}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Redeem Points Form */}
        <AnimatedBlock delay={500} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Redeem Eco Points</h2>
          
          {message.content && (
            <div className={`mb-4 p-3 rounded-lg text-sm flex items-center ${
              message.type === 'success' 
                ? 'bg-green-100 border-l-4 border-green-500 text-green-700' 
                : 'bg-red-100 border-l-4 border-red-500 text-red-700'
            }`}>
              {message.type === 'success' ? <CheckCircle className="w-5 h-5 mr-3" /> : <AlertCircle className="w-5 h-5 mr-3" />}
              <span className="font-medium">{message.content}</span>
            </div>
          )}
          
          <form onSubmit={handleRedeem} className="flex flex-col md:flex-row gap-3">
            <input 
              type="number"
              value={redeemAmount}
              onChange={(e) => setRedeemAmount(e.target.value)}
              placeholder={`Enter points (e.g., 100). You have ${wallet.ecoPoints}`}
              className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={actionLoading}
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-lg font-semibold hover:shadow-lg transition flex items-center justify-center disabled:opacity-50"
            >
              {actionLoading ? <Loader className="w-5 h-5 animate-spin" /> : <ArrowDownRight className="w-5 h-5 mr-2" />}
              Redeem Now
            </button>
          </form>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">100 points = ₹10 (Conversion rate is 0.1)</p>
        </AnimatedBlock>

        {/* Dynamic transactions */}
        <AnimatedBlock delay={600} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Transaction History</h2>
          <div className="space-y-3">
            {transactions.length === 0 ? (
              // 4. Modern Empty State
              <div className="text-center text-gray-500 dark:text-gray-400 py-12">
                <Inbox className="w-12 h-12 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">No transactions yet</h3>
                <p>Your earned and redeemed points will appear here.</p>
              </div>
            ) : (
              transactions.map((txn) => (
                <div key={txn._id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg transition-colors hover:bg-gray-50 dark:hover:bg-gray-700">
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      txn.ecoPoints >= 0 ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'
                    }`}>
                      {txn.ecoPoints >= 0 ? <ArrowUpRight className="w-5 h-5 text-green-600" /> : <ArrowDownRight className="w-5 h-5 text-red-600" />}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white">{txn.description}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">{new Date(txn.createdAt).toLocaleString()}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-bold text-lg ${
                      txn.ecoPoints >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {txn.ecoPoints > 0 ? '+' : ''}{txn.ecoPoints}
                    </div>
                    {txn.amount > 0 && <div className="text-sm text-gray-600 dark:text-gray-400">₹{txn.amount.toFixed(2)}</div>}
                  </div>
                </div>
              ))
            )}
          </div>
        </AnimatedBlock>
      </div>
    </div>
  );
};

export default Wallet;