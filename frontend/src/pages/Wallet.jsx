// src/pages/Wallet.jsx
import React, { useState, useEffect } from "react";
import { 
  Award, DollarSign, ArrowDownRight, CreditCard, TrendingUp, 
  ArrowUpRight, Loader, AlertCircle, CheckCircle, Inbox
} from "lucide-react";
import { paymentService } from "../api/services";
import AppLoader from "../components/Loader"; // Using AppLoader to avoid naming conflict with Loader icon

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
      setError(err.response?.data?.message || "Failed to load wallet data");
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
      setMessage({ type: "success", content: `Successfully redeemed ${points} points for ₹${response.data.amount}!` });
      setRedeemAmount("");
      fetchData(); // Refetch all data to update balances
    } catch (err) {
      setMessage({ type: "error", content: err.response?.data?.message || "Redemption failed." });
    } finally {
      setActionLoading(false); // Stop action loading
    }
  };
  
  // --- 2. Placeholder functions for dead buttons ---
  const handleWithdraw = () => {
    // This would typically open a modal to enter bank details
    alert("Withdraw functionality coming soon!");
  };
  
  const handleTopUp = async () => {
    // This would call createOrder and open the Razorpay modal
    // const response = await paymentService.createOrder({ amount: 100 });
    // ... logic to open Razorpay ...
    alert("Top-up functionality coming soon!");
  };


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
                onClick={handleWithdraw}
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
              onClick={handleTopUp}
              className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg hover:shadow-xl transition text-center flex items-center justify-center space-x-2 transform hover:scale-105"
            >
              <CreditCard className="w-6 h-6 text-blue-500" />
              <span className="font-semibold text-gray-900 dark:text-white">Top Up Wallet</span>
            </button>
            <button 
              onClick={() => alert("Stats page coming soon!")}
              className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg hover:shadow-xl transition text-center flex items-center justify-center space-x-2 transform hover:scale-105"
            >
              <TrendingUp className="w-6 h-6 text-purple-500" />
              <span className="font-semibold text-gray-900 dark:text-white">View Stats</span>
            </button>
        </AnimatedBlock>

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