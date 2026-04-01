const User = require("../models/User");
const OTP = require("../models/OTP");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const { sendEmail } = require("../utils/email");
const { sendSMS } = require("../utils/sms");
const crypto = require("crypto");

// Google OAuth Client
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/* --------------------------------------------------------------------------
      TOKEN HELPERS
---------------------------------------------------------------------------- */
const generateTokens = (userId) => {
  const accessToken = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });

  const refreshToken = jwt.sign(
    { id: userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "30d" }
  );

  return { accessToken, refreshToken };
};

const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

/* ==========================================================================
    1️⃣ REGISTER
=========================================================================== */
exports.register = async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;

    const existing = await User.findOne({ email });
    if (existing)
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });

    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: role || "user",
      location: {
        type: "Point",
        coordinates: [0, 0],
      },
    });

    // Clear previous verification OTPs
    await OTP.deleteMany({ email, purpose: "verification" });

    const otp = generateOTP();
    await OTP.create({
      email,
      otp,
      type: "email",
      purpose: "verification",
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });

    await sendEmail(
      email,
      "Verify Your EcoTrack Account",
      `Your OTP is: ${otp}. Valid for 10 minutes.`
    );

    const tokens = generateTokens(user._id);
    user.refreshToken = tokens.refreshToken;
    await user.save();

    res.status(201).json({
      success: true,
      message: "User registered successfully. Please verify your email.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
      },
      ...tokens,
    });
  } catch (err) {
    console.error("REGISTER ERROR:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ==========================================================================
    2️⃣ LOGIN
=========================================================================== */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");
    if (!user)
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });

    const isMatch = await user.comparePassword(password);
    if (!isMatch)
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });

    user.lastLogin = new Date();

    const tokens = generateTokens(user._id);
    user.refreshToken = tokens.refreshToken;
    await user.save();

    res.json({
      success: true,
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        ecoPoints: user.ecoPoints,
        walletBalance: user.walletBalance,
        isVerified: user.isVerified,
      },
      ...tokens,
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ==========================================================================
    3️⃣ GOOGLE LOGIN
=========================================================================== */
exports.googleLogin = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token)
      return res
        .status(400)
        .json({ success: false, message: "Google token missing" });

    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { sub, email, name, picture } = ticket.getPayload();

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        name,
        email,
        googleId: sub,
        avatar: picture,
        isVerified: true,
        emailVerified: true,
        password: crypto.randomBytes(16).toString("hex"),
        location: { type: "Point", coordinates: [0, 0] },
      });
    } else {
      user.googleId = user.googleId || sub;
      user.avatar = picture;
      user.emailVerified = true;
      user.isVerified = true;
      await user.save();
    }

    user.lastLogin = new Date();

    const tokens = generateTokens(user._id);
    user.refreshToken = tokens.refreshToken;
    await user.save();

    res.json({
      success: true,
      message: "Google login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        ecoPoints: user.ecoPoints,
        walletBalance: user.walletBalance,
        isVerified: user.isVerified,
      },
      ...tokens,
    });
  } catch (err) {
    console.error("GOOGLE LOGIN ERROR:", err);
    res.status(500).json({ success: false, message: "Google login failed" });
  }
};

/* ==========================================================================
    4️⃣ REFRESH TOKEN
=========================================================================== */
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken)
      return res.status(400).json({
        success: false,
        message: "Refresh token missing",
      });

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    const user = await User.findById(decoded.id);
    if (!user || user.refreshToken !== refreshToken) {
      return res.status(403).json({
        success: false,
        message: "Invalid refresh token",
      });
    }

    const tokens = generateTokens(user._id);
    user.refreshToken = tokens.refreshToken;
    await user.save();

    res.json({
      success: true,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    });
  } catch (err) {
    console.error("REFRESH TOKEN ERROR:", err);
    res
      .status(401)
      .json({ success: false, message: "Invalid or expired refresh token" });
  }
};

/* ==========================================================================
    5️⃣ LOGOUT — SAFE, LOOP-FREE ✅
=========================================================================== */
exports.logout = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];

      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        await User.findByIdAndUpdate(decoded.id, {
          $unset: { refreshToken: "" },
        });
      } catch (err) {
        // Token invalid or expired — ignore safely
      }
    }

    return res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  } catch (err) {
    console.error("LOGOUT ERROR:", err);

    return res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  }
};

/* ==========================================================================
    6️⃣ GENERIC SEND OTP
=========================================================================== */
exports.sendOTP = async (req, res) => {
  try {
    const { email, phone, type, purpose } = req.body;

    await OTP.deleteMany({ $or: [{ email }, { phone }], purpose });

    const otp = generateOTP();

    await OTP.create({
      email,
      phone,
      otp,
      type,
      purpose,
      isUsed: false,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });

    if (type === "email") {
      await sendEmail(email, `Your OTP for ${purpose}`, `Your OTP is: ${otp}`);
    } else {
      await sendSMS(phone, `Your OTP is: ${otp}`);
    }

    res.json({
      success: true,
      message: `OTP sent to ${type === "email" ? email : phone}`,
    });
  } catch (err) {
    console.error("SEND OTP ERROR:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ==========================================================================
    7️⃣ GENERIC VERIFY OTP
=========================================================================== */
exports.verifyOTP = async (req, res) => {
  try {
    const { email, phone, otp, purpose } = req.body;

    const otpDoc = await OTP.findOne({
      $or: [{ email }, { phone }],
      isUsed: false,
      purpose,
      expiresAt: { $gt: new Date() },
    }).select("+otp");

    if (!otpDoc)
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired OTP" });

    const isValid = await otpDoc.compareOTP(otp);
    if (!isValid)
      return res.status(400).json({
        success: false,
        message: "Incorrect OTP",
      });

    otpDoc.isUsed = true;
    await otpDoc.save();

    const user = await User.findOne({ $or: [{ email }, { phone }] });

    if (user) {
      if (otpDoc.type === "email") user.emailVerified = true;
      if (otpDoc.type === "phone") user.phoneVerified = true;
      user.isVerified = user.emailVerified || user.phoneVerified;
      await user.save();
    }

    res.json({ success: true, message: "OTP verified successfully" });
  } catch (err) {
    console.error("VERIFY OTP ERROR:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ==========================================================================
    8️⃣ FORGOT PASSWORD (Send Reset OTP)
=========================================================================== */
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // SAFE RESPONSE (prevents email enumeration)
    const genericResponse = {
      success: true,
      message: "If an account exists, OTP has been sent to your email.",
    };

    const user = await User.findOne({ email });
    if (!user) return res.json(genericResponse);

    await OTP.deleteMany({ email, purpose: "reset-password" });

    const otp = generateOTP();

    await OTP.create({
      email,
      otp,
      type: "email",
      purpose: "reset-password",
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });

    await sendEmail(
      email,
      "Reset Your EcoTrack Password",
      `Your OTP for password reset is: ${otp}.`
    );

    res.json(genericResponse);
  } catch (err) {
    console.error("FORGOT PASSWORD ERROR:", err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/* ==========================================================================
    9️⃣ VERIFY RESET PASSWORD OTP
=========================================================================== */
exports.verifyResetOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const otpDoc = await OTP.findOne({
      email,
      purpose: "reset-password",
      isUsed: false,
      expiresAt: { $gt: new Date() },
    }).select("+otp");

    if (!otpDoc)
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP",
      });

    const valid = await otpDoc.compareOTP(otp);
    if (!valid)
      return res.status(400).json({
        success: false,
        message: "Incorrect OTP",
      });

    otpDoc.isUsed = true;
    await otpDoc.save();

    res.json({ success: true, message: "OTP verified" });
  } catch (err) {
    console.error("VERIFY RESET OTP ERROR:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ==========================================================================
    🔟 RESET PASSWORD
=========================================================================== */
exports.resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    user.password = newPassword; // hashed by User model pre-save
    await user.save();

    res.json({ success: true, message: "Password reset successful" });
  } catch (err) {
    console.error("RESET PASSWORD ERROR:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};
