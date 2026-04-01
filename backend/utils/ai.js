// utils/ai.js (Gemini Vision - OLD SDK CORRECTED)
const { GoogleGenerativeAI } = require("@google/generative-ai");

if (!process.env.GEMINI_API_KEY) {
  console.warn("⚠️ Missing GEMINI_API_KEY environment variable!");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ✅ CORRECT MODEL for old SDK (gemini-pro-vision DOES NOT EXIST)
const visionModel = genAI.getGenerativeModel({
  model: "gemini-1.0-pro-vision",
});

/**
 * Classify waste using Gemini Pro Vision API
 * @param {string} imageUrl
 * @returns {Promise<{ wasteType: string, confidence: number, detectedItems: string[] }>}
 */
exports.classifyWaste = async (imageUrl) => {
  try {
    if (!imageUrl || typeof imageUrl !== "string") {
      throw new Error("Invalid or missing image URL");
    }

    console.log("🔍 Gemini Vision Classification:", imageUrl);

    const prompt = `
      Analyze this waste image and return ONLY strict JSON:

      {
        "wasteType": "plastic|metal|organic|e-waste|glass|paper|mixed|hazardous",
        "confidence": number (0 to 1),
        "detectedItems": [ "item1", "item2" ],
        "recyclingTips": string
      }
    `;

    // OLD SDK expected structure (ARRAY with text + image)
    const result = await visionModel.generateContent([
      { text: prompt },
      { image_url: imageUrl },
    ]);

    const raw = result.response.text().trim();
    if (!raw) throw new Error("Empty Gemini response");

    /* ---------- JSON Parsing (Robust) ---------- */
    let parsed = null;

    try {
      parsed = JSON.parse(raw);
    } catch {
      console.warn("⚠ Extracting JSON from mixed output…");
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
    }

    if (!parsed) throw new Error("Invalid JSON from Gemini");

    /* ---------- Validation ---------- */
    const VALID_TYPES = [
      "plastic",
      "metal",
      "organic",
      "e-waste",
      "glass",
      "paper",
      "mixed",
      "hazardous",
    ];

    const wasteType = VALID_TYPES.includes(parsed.wasteType)
      ? parsed.wasteType
      : "mixed";

    const confidence =
      typeof parsed.confidence === "number"
        ? Math.min(Math.max(parsed.confidence, 0), 1)
        : 0;

    const detectedItems = Array.isArray(parsed.detectedItems)
      ? parsed.detectedItems
      : [];

    return { wasteType, confidence, detectedItems };
  } catch (error) {
    console.error("❌ Gemini Vision Error:", error.message);

    return {
      wasteType: "mixed",
      confidence: 0,
      detectedItems: [],
    };
  }
};
