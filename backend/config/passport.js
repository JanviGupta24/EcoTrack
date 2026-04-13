/* =============================================================================
 * Google OAuth / Passport Configuration
 * =============================================================================
 * Purpose:
 *   Provide helpers for Google ID token verification and (optionally) register
 *   a Passport.js JWT strategy.
 *
 * Notes:
 *   - The codebase currently uses manual JWT verification in
 *     `backend/middleware/auth.middleware.js`.
 *   - This file is still useful for Google token verification and future
 *     Passport integration.
 *
 * Env Vars:
 *   - GOOGLE_CLIENT_ID (required to enable Google verification)
 *   - JWT_SECRET (required only if Passport JWT strategy is enabled)
 * ============================================================================= */


const { OAuth2Client } = require("google-auth-library");

/* -------------------------------------------------------------------------- */
/*                          🔑 GOOGLE OAUTH CLIENT                             */
/* -------------------------------------------------------------------------- */
let googleClient = null;

if (process.env.GOOGLE_CLIENT_ID) {
  googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  console.log("✅ Google OAuth client initialized");
} else {
  console.warn(
    "⚠️  GOOGLE_CLIENT_ID missing — Google login will be disabled.\n" +
      "    Set GOOGLE_CLIENT_ID in your .env file."
  );
}

/* -------------------------------------------------------------------------- */
/*                      🛡️ VERIFY GOOGLE ID TOKEN HELPER                       */
/* -------------------------------------------------------------------------- */
/**
 * Verifies a Google ID token and returns the decoded payload.
 * @param {string} idToken   — token sent from the frontend via @react-oauth/google
 * @returns {Promise<Object>} decoded payload with sub, email, name, picture, etc.
 */
const verifyGoogleToken = async (idToken) => {
  if (!googleClient) {
    throw new Error("Google OAuth client is not initialized — check GOOGLE_CLIENT_ID");
  }

  const ticket = await googleClient.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  return ticket.getPayload(); // { sub, email, name, picture, email_verified, … }
};

/* -------------------------------------------------------------------------- */
/*                    ⚙️  PASSPORT JWT STRATEGY (Optional)                     */
/* -------------------------------------------------------------------------- */
// Only configured when 'passport' package is installed.
// Your current codebase uses manual JWT verification in auth.middleware.js,
// so this is provided for future extensibility.
let passport = null;

try {
  passport = require("passport");
  const { Strategy: JwtStrategy, ExtractJwt } = require("passport-jwt");
  const User = require("../models/User");

  const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey:    process.env.JWT_SECRET,
  };

  passport.use(
    new JwtStrategy(opts, async (payload, done) => {
      try {
        const user = await User.findById(payload.id).select("-password -refreshToken");
        if (!user) return done(null, false);
        return done(null, user);
      } catch (err) {
        return done(err, false);
      }
    })
  );

  console.log("✅ Passport JWT strategy registered");
} catch {
  // passport / passport-jwt not installed — skip silently
}

/* -------------------------------------------------------------------------- */
/*                                 EXPORTS                                      */
/* -------------------------------------------------------------------------- */
module.exports = {
  googleClient,
  verifyGoogleToken,
  passport,
};
