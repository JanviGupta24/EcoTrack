// middleware/upload.middleware.js
const multer = require("multer");
const path = require("path");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

/* -------------------------------------------------------------------------- */
/*                        ☁️ CLOUDINARY STORAGE (SAFE)                         */
/* -------------------------------------------------------------------------- */
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "ecotrack/uploads",
    allowed_formats: ["jpg", "jpeg", "png", "gif"],
    transformation: [{ width: 1000, height: 1000, crop: "limit" }],
  },
});

/* -------------------------------------------------------------------------- */
/*                              🧩 FILE FILTER                                 */
/* -------------------------------------------------------------------------- */
const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif/;
  const extValid = allowed.test(path.extname(file.originalname).toLowerCase());
  const mimeValid = allowed.test(file.mimetype);

  if (extValid && mimeValid) cb(null, true);
  else cb(new Error("Invalid file type. Only JPG, JPEG, PNG & GIF allowed."));
};

/* -------------------------------------------------------------------------- */
/*                             ⚙️ MULTER CONFIG                               */
/* -------------------------------------------------------------------------- */
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 5,
  },
  fileFilter,
});

/* -------------------------------------------------------------------------- */
/*                        🔥 CLOUDINARY URL NORMALIZER                         */
/* -------------------------------------------------------------------------- */
// Converts Cloudinary file objects → secure URL strings
function normalizeCloudinaryFiles(files) {
  if (!files || files.length === 0) return [];
  return files.map((file) => file.path || file.secure_url);
}

/* -------------------------------------------------------------------------- */
/*                        🛡️ GLOBAL FILE UPLOAD HANDLER                       */
/* -------------------------------------------------------------------------- */
const handleUploadErrors = (err, req, res, next) => {
  // Multer internal errors
  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      success: false,
      message: `Upload error: ${err.message}`,
    });
  }

  // Custom / Cloudinary errors
  if (err) {
    return res.status(400).json({
      success: false,
      message: err.message || "File upload failed",
    });
  }

  next();
};

/* -------------------------------------------------------------------------- */
/*                 🔗 MERGE INTO MIDDLEWARE EXPORT (IMPORTANT)                 */
/* -------------------------------------------------------------------------- */
upload.normalizeFiles = normalizeCloudinaryFiles;
upload.handleErrors = handleUploadErrors;

module.exports = upload;
