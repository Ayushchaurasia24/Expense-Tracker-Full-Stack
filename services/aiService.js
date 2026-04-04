const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize Gemini with API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.getCategoryFromAI = async (description) => {
  try {
    console.log("👉 Calling AI with:", description);

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash"   // ✅ correct model (Cloud API)
    });

    const prompt = `
You are an AI that categorizes expenses.

Choose ONLY one category from:
Food, Travel, Shopping, Entertainment, Bills, Other

Examples:
- "Dominos pizza" → Food
- "Uber ride" → Travel
- "Amazon shopping" → Shopping

Now categorize:
"${description}"

Return ONLY the category name.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text().trim();

    console.log("👉 AI RAW:", text);

    // 🔥 Normalize response
    text = text.toLowerCase();

    if (text.includes("food")) return "Food";
    if (text.includes("travel")) return "Travel";
    if (text.includes("shopping")) return "Shopping";
    if (text.includes("entertainment")) return "Entertainment";
    if (text.includes("bill")) return "Bills";

    return "Other";

  } catch (err) {
    console.log("❌ AI ERROR:", err.message);

    // 🔥 fallback (important safety)
    const desc = description.toLowerCase();

    if (desc.includes("pizza") || desc.includes("food")) return "Food";
    if (desc.includes("uber") || desc.includes("ola")) return "Travel";
    if (desc.includes("amazon")) return "Shopping";

    return "Other";
  }
};