const { GoogleGenerativeAI } = require("@google/generative-ai");

// ================= INIT GEMINI =================
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ================= CONSTANTS =================
const VALID_CATEGORIES = [
  "Food",
  "Travel",
  "Shopping",
  "Entertainment",
  "Bills",
  "Other"
];

// ================= KEYWORD ENGINE =================
const KEYWORD_RULES = {
  Food: [
    // Indian food
    "chai", "tea", "coffee", "milk", "lassi", "juice",
    "paratha", "roti", "chapati", "dal", "sabzi", "paneer",
    "biryani", "rice", "thali", "idli", "dosa", "vada",
    "poha", "upma", "samosa", "kachori", "pani puri",
    "golgappa", "bhel", "pakoda", "jalebi", "laddu",
    "sweet", "mithai",

    // general
    "pizza", "burger", "food", "restaurant", "cafe",
    "snacks", "breakfast", "lunch", "dinner",
    "zomato", "swiggy"
  ],

  Travel: [
    "uber", "ola", "rapido", "taxi", "auto", "rickshaw",
    "bus", "train", "metro", "flight", "airport",
    "ticket", "travel", "petrol", "diesel", "fuel",
    "toll", "parking"
  ],

  Shopping: [
    // platforms
    "amazon", "flipkart", "myntra", "meesho", "ajio",

    // general
    "shopping", "order", "purchase", "buy", "bought",

    // electronics
    "phone", "mobile", "laptop", "mouse", "keyboard",
    "electronics", "charger", "headphones", "earbuds",
    "tv", "tablet", "watch",

    // clothing
    "shirt", "tshirt", "jeans", "pants", "kurta",
    "saree", "dress", "shoes", "slippers",
    "grocery", "groceries", "vegetables", "fruits",
    "milk", "bread", "eggs"
  ],

  Entertainment: [
    "movie", "cinema", "netflix", "prime", "hotstar",
    "youtube", "spotify", "game", "gaming", "concert",
    "match", "cricket", "ipl"
  ],

  Bills: [
    "electricity", "bill", "water", "rent", "wifi",
    "broadband", "recharge", "mobile recharge",
    "dth", "subscription", "insurance", "emi",
    "loan", "fees"
  ]
};

function isLikelyShopping(text) {
  const productWords = [
    "bag", "shoes", "lipstick", "cream", "makeup",
    "watch", "perfume", "jacket", "dress"
  ];

  for (let word of productWords) {
    if (text.includes(word)) return true;
  }

  return false;
}


function detectByKeywords(description) {
  const text = description.toLowerCase();

  let bestMatch = { category: null, score: 0 };

  for (let category in KEYWORD_RULES) {
    let score = 0;

    for (let keyword of KEYWORD_RULES[category]) {
      if (text.includes(keyword)) {
        score++;
      }
    }

    if (score > bestMatch.score) {
      bestMatch = { category, score };
    }
  }

  // 🔥 EXTRA LOGIC (VERY IMPORTANT)
  if (bestMatch.score === 0 && isLikelyShopping(text)) {
    return {
      category: "Shopping",
      confidence: 0.8
    };
  }

  if (bestMatch.score > 0) {
    return {
      category: bestMatch.category,
      confidence: Math.min(0.7 + bestMatch.score * 0.1, 0.95)
    };
  }

  return null;
}
// ================= KEYWORD DETECTION =================
function detectByKeywords(description) {
  const text = description.toLowerCase();

  let bestMatch = { category: null, score: 0 };

  for (let category in KEYWORD_RULES) {
    let score = 0;

    for (let keyword of KEYWORD_RULES[category]) {
      if (text.includes(keyword)) {
        score++;
      }
    }

    if (score > bestMatch.score) {
      bestMatch = { category, score };
    }
  }

  if (bestMatch.score > 0) {
    return {
      category: bestMatch.category,
      confidence: Math.min(0.7 + bestMatch.score * 0.1, 0.95)
    };
  }

  return null;
}
// ================= NORMALIZATION =================
function normalizeCategory(raw) {
  if (!raw) return "Other";

  const text = raw.toLowerCase().trim();

  // 🔥 DIRECT CATEGORY MATCH
  if (text === "food") return "Food";
  if (text === "travel") return "Travel";
  if (text === "shopping") return "Shopping";
  if (text === "entertainment") return "Entertainment";
  if (text === "bills") return "Bills";

  // 🔥 HANDLE AI VARIANTS (IMPORTANT)
  if (
    text.includes("food") ||
    text.includes("dining") ||
    text.includes("beverage")
  ) return "Food";

  if (
    text.includes("travel") ||
    text.includes("transport")
  ) return "Travel";

  if (
    text.includes("shop") ||
    text.includes("purchase") ||
    text.includes("electronics") ||   // ✅ FIX
    text.includes("gadget") ||
    text.includes("product")
  ) return "Shopping";

  if (
    text.includes("entertain") ||
    text.includes("movie")
  ) return "Entertainment";

  if (
    text.includes("bill") ||
    text.includes("utility")
  ) return "Bills";

  return "Other";
}

// ================= MAIN FUNCTION =================
exports.getCategoryFromAI = async (description) => {
  try {
    console.log("👉 Input:", description);

    // 🔥 STEP 1: KEYWORD ENGINE (FAST + ACCURATE)
    const keywordResult = detectByKeywords(description);
    if (keywordResult) {
      console.log("⚡ Keyword Match:", keywordResult);
      return keywordResult;
    }

    // 🔥 STEP 2: GEMINI AI
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash"
    });

    const prompt = `
You are an expense categorization AI.

Return ONLY valid JSON:
{"category": "Food", "confidence": 0.8}

Allowed categories:
Food, Travel, Shopping, Entertainment, Bills, Other

Rules:
- No explanation
- No extra text
- Always return JSON
- Confidence between 0 and 1

Expense: "${description}"
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text().trim();

    console.log("🤖 AI RAW:", text);

    let category = "Other";
    let confidence = 0.5;

    // 🔥 SAFE JSON PARSE
    try {
      const parsed = JSON.parse(text);
      category = parsed.category;
      confidence = parsed.confidence || 0.5;
    } catch (err) {
      console.log("⚠️ JSON parse failed, using raw text");
      category = text;
    }

    // 🔥 NORMALIZE CATEGORY
    const finalCategory = normalizeCategory(category);

    console.log("✅ Final:", finalCategory, "| Confidence:", confidence);

    return {
      category: finalCategory,
      confidence
    };

  } catch (err) {
    console.log("❌ AI ERROR:", err.message);

    // 🔥 FALLBACK LOGIC (NO AI DEPENDENCY)
    const desc = description.toLowerCase();

    if (
      desc.includes("chai") ||
      desc.includes("tea") ||
      desc.includes("coffee") ||
      desc.includes("food") ||
      desc.includes("pizza")
    ) {
      return { category: "Food", confidence: 0.8 };
    }

    if (
      desc.includes("uber") ||
      desc.includes("ola") ||
      desc.includes("travel")
    ) {
      return { category: "Travel", confidence: 0.8 };
    }

    if (
      desc.includes("amazon") ||
      desc.includes("shopping")
    ) {
      return { category: "Shopping", confidence: 0.8 };
    }

    if (
      desc.includes("movie") ||
      desc.includes("netflix")
    ) {
      return { category: "Entertainment", confidence: 0.8 };
    }

    if (
      desc.includes("bill") ||
      desc.includes("electricity") ||
      desc.includes("rent")
    ) {
      return { category: "Bills", confidence: 0.8 };
    }

    return { category: "Other", confidence: 0.3 };
  }
};