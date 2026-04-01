require("dotenv").config();
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const connectDB = require("./config/db");
const upload = require("./middleware/upload.middleware");

/* -------------------------------------------------------------------------- */
/*                                 🔗 INIT APP                                 */
/* -------------------------------------------------------------------------- */
const app = express();

/* -------------------------------------------------------------------------- */
/*                    ✅ REQUIRED IF USING PROXY / VERCEL / NGINX              */
/* -------------------------------------------------------------------------- */
app.set("trust proxy", 1);

/* -------------------------------------------------------------------------- */
/*                             🧩 CONNECT TO DATABASE                          */
/* -------------------------------------------------------------------------- */
connectDB();

/* -------------------------------------------------------------------------- */
/*                              🔐 SECURITY HEADERS                            */
/* -------------------------------------------------------------------------- */
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

/* -------------------------------------------------------------------------- */
/*                               🌍 CORS CONFIG                                */
/* -------------------------------------------------------------------------- */
app.use(
  cors({
    origin: [
      process.env.FRONTEND_URL || "http://localhost:3000",
      "http://127.0.0.1:3000",
    ],
    credentials: true,
    methods: "GET,POST,PUT,PATCH,DELETE",
    allowedHeaders: "Content-Type,Authorization",
  })
);

/* -------------------------------------------------------------------------- */
/*                          📦 REQUEST BODY PARSING FIX                        */
/* -------------------------------------------------------------------------- */
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));

/* -------------------------------------------------------------------------- */
/*                        ⚠️ MULTER UPLOAD ERROR HANDLER                       */
/* -------------------------------------------------------------------------- */
app.use(upload.handleErrors);

/* -------------------------------------------------------------------------- */
/*                          ⚡ PERFORMANCE MIDDLEWARES                          */
/* -------------------------------------------------------------------------- */
app.use(compression());
app.use(morgan("dev"));

/* -------------------------------------------------------------------------- */
/*                      🛡️ GLOBAL API RATE LIMIT — PROD ONLY                   */
/* -------------------------------------------------------------------------- */
if (process.env.NODE_ENV === "production") {
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 mins
    max: 2000, // generous for dashboard/API usage
    message: {
      success: false,
      message: "Too many requests. Please try again later.",
    },
    standardHeaders: true,
    legacyHeaders: false,
  });

  app.use("/api/", apiLimiter);
}

/* -------------------------------------------------------------------------- */
/*                                   🧭 ROUTES                                 */
/* -------------------------------------------------------------------------- */
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/users", require("./routes/user.routes"));
app.use("/api/waste", require("./routes/waste.routes"));
app.use("/api/workers", require("./routes/worker.routes"));
app.use("/api/admin", require("./routes/admin.routes"));
app.use("/api/payments", require("./routes/payment.routes"));
app.use("/api/training", require("./routes/training.routes"));
app.use("/api/ai", require("./routes/ai.routes"));
app.use("/api/notifications", require("./routes/notification.routes"));
app.use("/api/champion", require("./routes/champion.routes"));

/* -------------------------------------------------------------------------- */
/*                                 ❤️ HEALTH CHECK                             */
/* -------------------------------------------------------------------------- */
app.get("/health", (req, res) => {
  res.json({
    success: true,
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

/* -------------------------------------------------------------------------- */
/*                                 ❌ 404 HANDLER                               */
/* -------------------------------------------------------------------------- */
app.all("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found.`,
  });
});

/* -------------------------------------------------------------------------- */
/*                          🛑 GLOBAL ERROR HANDLER                            */
/* -------------------------------------------------------------------------- */
app.use((err, req, res, next) => {
  console.error("❌ Global Error:", err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

/* -------------------------------------------------------------------------- */
/*                           🚀 START EXPRESS SERVER                           */
/* -------------------------------------------------------------------------- */
const PORT = process.env.PORT || 5000;
const MODE = process.env.NODE_ENV || "development";

app.listen(PORT, () => {
  console.log(`🚀 EcoTrack Server running in ${MODE} mode on port ${PORT}`);
});

/* -------------------------------------------------------------------------- */
/*                           🧹 GRACEFUL SHUTDOWN HANDLER                      */
/* -------------------------------------------------------------------------- */
process.on("SIGINT", async () => {
  console.log("\n🛑 Gracefully shutting down...");
  const mongoose = require("mongoose");
  await mongoose.connection.close();
  console.log("🔒 MongoDB disconnected");
  process.exit(0);
});
