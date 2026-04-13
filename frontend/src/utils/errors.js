/* =============================================================================
 * Error Message Normalizer (Frontend)
 * =============================================================================
 * Purpose:
 *   Provide a single, consistent way to translate API/axios errors into
 *   professional user-facing messages across all pages.
 *
 * Design goals:
 *   - Prefer backend-provided `message` when available.
 *   - Provide helpful fallbacks for network/CORS/offline cases.
 *   - Support common validation shapes (`errors[]`, `error`, etc.).
 * ============================================================================= */
export function getApiErrorMessage(err, fallback = "Something went wrong. Please try again.") {
  const data = err?.response?.data;

  // Backend-standard message
  if (typeof data?.message === "string" && data.message.trim()) {
    return data.message.trim();
  }

  // Alternate common shapes
  if (typeof data?.error === "string" && data.error.trim()) {
    return data.error.trim();
  }

  // express-validator style: { errors: [{ msg: "..." }, ...] }
  if (Array.isArray(data?.errors) && data.errors.length > 0) {
    const first = data.errors[0];
    if (typeof first === "string" && first.trim()) return first.trim();
    if (typeof first?.msg === "string" && first.msg.trim()) return first.msg.trim();
  }

  // Axios network error (no response received)
  if (!err?.response) {
    return "Cannot reach server. Please check your internet connection and ensure the backend is running.";
  }

  // HTTP status based fallback (when backend didn't send a message)
  const status = err.response?.status;
  if (status === 401) return "Your session has expired. Please log in again.";
  if (status === 403) return "You don’t have permission to perform this action.";
  if (status === 404) return "The requested resource was not found.";
  if (status === 429) return "Too many requests. Please wait a moment and try again.";

  return fallback;
}

