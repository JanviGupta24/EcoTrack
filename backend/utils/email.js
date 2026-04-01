// utils/email.js
const nodemailer = require("nodemailer");

/* -------------------------------------------------------------------------- */
/*                                EMAIL TRANSPORTER                           */
/* -------------------------------------------------------------------------- */
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: process.env.EMAIL_PORT ? Number(process.env.EMAIL_PORT) : 587,
  secure: Number(process.env.EMAIL_PORT) === 465, // auto-determine secure mode
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false, // avoids shared-host SSL issues
  },
});

/* -------------------------------------------------------------------------- */
/*                                 SEND EMAIL                                 */
/* -------------------------------------------------------------------------- */
exports.sendEmail = async (to, subject, text, html) => {
  try {
    const wrappedHtml =
      html ||
      `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #10b981 0%, #3b82f6 100%);
                    padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0;">🌱 EcoTrack</h1>
        </div>
        <div style="padding: 24px; background: #ffffff; border: 1px solid #e5e7eb;">
          <p style="font-size: 16px; color: #374151;">${text}</p>
        </div>
        <div style="background: #f3f4f6; padding: 12px; text-align: center; 
                    font-size: 12px; color: #6b7280; border-radius: 0 0 8px 8px;">
          <p>© ${new Date().getFullYear()} EcoTrack – Smart Waste Management</p>
        </div>
      </div>
    `;

    const mailOptions = {
      from: `"EcoTrack" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html: wrappedHtml,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to ${to}: ${info.messageId}`);

    return { success: true };
  } catch (error) {
    console.error(`❌ Email failed for ${to}:`, error.message);

    // Only retry if it's a NETWORK failure, not auth failure
    if (
      error.code === "ECONNECTION" ||
      error.code === "ETIMEDOUT" ||
      error.code === "EAI_AGAIN"
    ) {
      try {
        console.log("🔁 Retrying email due to network issue...");

        await transporter.sendMail({
          from: `"EcoTrack" <${process.env.EMAIL_USER}>`,
          to,
          subject,
          text,
        });

        console.log("✅ Email sent successfully after retry");
        return { success: true };
      } catch (retryError) {
        console.error("⚠️ Retry failed:", retryError.message);
        return { success: false, message: retryError.message };
      }
    }

    return { success: false, message: error.message };
  }
};
