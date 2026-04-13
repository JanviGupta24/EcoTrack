/* =============================================================================
 * AI Controller (Gemini)
 * =============================================================================
 * Purpose:
 *   Provide AI-backed endpoints for:
 *   - EcoBot chatbot responses (text generation)
 *   - Waste image classification (vision model)
 *   - Admin insights generation (text analytics summary)
 *   - Quiz generation (structured JSON output)
 *
 * Behavior:
 *   - Uses `GEMINI_API_KEY` to initialize the Gemini SDK lazily.
 *   - If the API key is missing, endpoints return HTTP 503 with a clear message
 *     (no server crash).
 *
 * Exports:
 *   - chatbot(req,res)
 *   - classifyWaste(req,res)
 *   - generateInsights(req,res)
 *   - generateQuiz(req,res)
 *
 * Env Vars:
 *   - GEMINI_API_KEY
 * ============================================================================= */
const { GoogleGenerativeAI } = require("@google/generative-ai");

function getGenAI() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;
  return new GoogleGenerativeAI(key);
}

function getTextModel() {
  const g = getGenAI();
  if (!g) return null;
  return g.getGenerativeModel({ model: "gemini-1.0-pro" });
}

function getVisionModel() {
  const g = getGenAI();
  if (!g) return null;
  return g.getGenerativeModel({ model: "gemini-1.0-pro-vision" });
}

function aiNotConfigured(res) {
  return res.status(503).json({
    success: false,
    message:
      "AI service is not configured. Add GEMINI_API_KEY to the backend .env file.",
  });
}

/* -------------------------------------------------------------------------- */
/*                           🤖 AI CHATBOT (EcoBot)                           */
/* -------------------------------------------------------------------------- */
exports.chatbot = async (req, res) => {
  try {
    const textModel = getTextModel();
    if (!textModel) return aiNotConfigured(res);

    const { message, conversationHistory = [] } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: "Message is required",
      });
    }

    const systemPrompt = `
      You are EcoBot 🌱 — a friendly assistant for waste management.
      Help users with segregation, recycling, composting and sustainability.
      Reply clearly and politely.
    `;

    const fullPrompt =
      `SYSTEM: ${systemPrompt}\n` +
      conversationHistory
        .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
        .join("\n") +
      `\nUSER: ${message}`;

    const result = await textModel.generateContent(fullPrompt);
    const reply = result.response.text().trim();

    return res.json({
      success: true,
      reply,
      conversationHistory: [
        ...conversationHistory,
        { role: "user", content: message },
        { role: "assistant", content: reply },
      ],
    });
  } catch (error) {
    console.error("❌ chatbot error:", error);
    return res.status(500).json({
      success: false,
      message: "Chatbot error",
      error: error.message,
    });
  }
};

/* -------------------------------------------------------------------------- */
/*                     🧩 WASTE IMAGE CLASSIFICATION (VISION)                 */
/* -------------------------------------------------------------------------- */
exports.classifyWaste = async (req, res) => {
  try {
    const visionModel = getVisionModel();
    if (!visionModel) return aiNotConfigured(res);

    const { imageUrl } = req.body;

    if (!imageUrl) {
      return res.status(400).json({
        success: false,
        message: "Image URL is required",
      });
    }

    const prompt = `
      Analyze this waste image and return STRICT JSON ONLY:
      {
        "wasteType": "plastic|metal|organic|e-waste|glass|paper|mixed|hazardous",
        "confidence": number (0-1),
        "detectedItems": [string],
        "recyclingTips": string
      }
    `;

    const result = await visionModel.generateContent([
      { text: prompt },
      { image_url: imageUrl },
    ]);

    const content = result.response.text();
    const jsonString = content.match(/\{[\s\S]*\}/)?.[0];

    if (!jsonString) throw new Error("Invalid JSON from Gemini");

    const parsed = JSON.parse(jsonString);

    return res.json({ success: true, classification: parsed });
  } catch (error) {
    console.error("❌ classifyWaste error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to classify waste",
      error: error.message,
    });
  }
};

/* -------------------------------------------------------------------------- */
/*                        📊 AI DATA INSIGHT GENERATOR                        */
/* -------------------------------------------------------------------------- */
exports.generateInsights = async (req, res) => {
  try {
    const textModel = getTextModel();
    if (!textModel) return aiNotConfigured(res);

    const { data, analysisType } = req.body;

    if (data === undefined || data === null || !analysisType) {
      return res.status(400).json({
        success: false,
        message: "Data and analysisType are required",
      });
    }

    const prompt = `
      Analyze this ${analysisType} dataset and provide:
      - Key patterns
      - Trends
      - Problems
      - Recommendations

      DATA:
      ${JSON.stringify(data, null, 2)}
    `;

    const result = await textModel.generateContent(prompt);
    const insights = result.response.text().trim();

    return res.json({ success: true, insights });
  } catch (error) {
    console.error("❌ generateInsights error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to generate insights",
      error: error.message,
    });
  }
};

/* -------------------------------------------------------------------------- */
/*                           🧠 AI QUIZ GENERATOR                             */
/* -------------------------------------------------------------------------- */
exports.generateQuiz = async (req, res) => {
  try {
    const textModel = getTextModel();
    if (!textModel) return aiNotConfigured(res);

    const { topic, difficulty = "medium", questionCount = 5 } = req.body;

    if (!topic) {
      return res.status(400).json({
        success: false,
        message: "Topic is required",
      });
    }

    const prompt = `
      Generate ${questionCount} ${difficulty}-level quiz questions about "${topic}".
      Return STRICT JSON ONLY:
      [
        {
          "question": string,
          "options": [string, string, string, string],
          "correctAnswer": number (0-3),
          "explanation": string
        }
      ]
    `;

    const result = await textModel.generateContent(prompt);
    const text = result.response.text();

    const jsonString = text.match(/\[.*\]/s)?.[0];
    if (!jsonString) throw new Error("Invalid quiz JSON");

    const quiz = JSON.parse(jsonString);

    return res.json({ success: true, quiz });
  } catch (error) {
    console.error("❌ generateQuiz error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to generate quiz",
      error: error.message,
    });
  }
};
