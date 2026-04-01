// utils/sms.js
const twilio = require("twilio");

/* -------------------------------------------------------------------------- */
/*                              📱 TWILIO CLIENT                               */
/* -------------------------------------------------------------------------- */
let client = null;

try {
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
    console.log("✅ Twilio client initialized");
  } else {
    console.warn("⚠️ Twilio credentials missing — SMS sending disabled");
  }
} catch (err) {
  console.error("❌ Twilio initialization failed:", err.message);
}

/* -------------------------------------------------------------------------- */
/*                          🔢 PHONE NORMALIZATION                             */
/* -------------------------------------------------------------------------- */
const normalizePhone = (phone) => {
  if (!phone) return null;

  let cleaned = phone.toString().replace(/\D/g, "");

  // If user passes international numbers like +14155552671
  if (phone.startsWith("+")) return phone;

  // If number starts with country code (10–14 digits)
  if (cleaned.length > 10) return `+${cleaned}`;

  // Country fallback: Use INDIA if no env set
  const countryCode = process.env.DEFAULT_COUNTRY_CODE || "+91";

  return `${countryCode}${cleaned}`;
};

/* -------------------------------------------------------------------------- */
/*                              ✉️ SEND SMS FUNCTION                           */
/* -------------------------------------------------------------------------- */
exports.sendSMS = async (phone, message) => {
  try {
    if (!client) {
      console.warn("⚠️ Twilio not initialized. SMS skipped.");
      return { success: false, skipped: true };
    }

    if (!phone || !message) {
      return { success: false, message: "Phone or message missing" };
    }

    // Normalize
    const to = normalizePhone(phone);

    if (!to || to.length < 10) {
      return { success: false, message: "Invalid phone number format" };
    }

    // Create SMS
    const sms = await client.messages.create({
      body: message.trim(),
      from: process.env.TWILIO_PHONE_NUMBER,
      to,
    });

    console.log(`📤 SMS sent to ${to} (SID: ${sms.sid})`);
    return { success: true };
  } catch (error) {
    console.error(`❌ SMS sending failed to ${phone}:`, error.message);

    // Retry ONLY if Twilio rate-limited (20429)
    if (error.code === 20429) {
      console.log("🔁 Retrying SMS after rate limit...");

      try {
        await new Promise((r) => setTimeout(r, 1000)); // wait 1 second
        const retrySms = await client.messages.create({
          body: message.trim(),
          from: process.env.TWILIO_PHONE_NUMBER,
          to: normalizePhone(phone),
        });

        console.log(`✅ SMS retry success (SID: ${retrySms.sid})`);
        return { success: true };
      } catch (retryError) {
        return { success: false, message: retryError.message };
      }
    }

    return { success: false, message: error.message };
  }
};
