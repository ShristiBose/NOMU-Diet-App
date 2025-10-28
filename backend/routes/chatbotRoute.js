console.log("Groq API Key loaded:", !!process.env.GROQ_API_KEY);

const express = require("express");
const router = express.Router();
const axios = require("axios");

router.post("/chatbot", async (req, res) => {
  const { userMessage, predictedFood, selectedMeal } = req.body;

  try {
    // ✅ Ensure the predictedFood has the structured meals object
    let predictedMeals = {
      Breakfast: [],
      Lunch: [],
      Snacks: [],
      Dinner: [],
    };

    if (predictedFood && typeof predictedFood === "object") {
      predictedMeals = {
        ...predictedMeals,
        ...predictedFood,
      };
    }

    // ✅ Default meal type handling
    const mealType = selectedMeal
      ? selectedMeal.charAt(0).toUpperCase() + selectedMeal.slice(1).toLowerCase()
      : "Meal";

    // ✅ Get the foods for that meal
    const mealFoods = predictedMeals[mealType] || [];

    // 🧠 Build a context-aware prompt
    const prompt = `
You are a professional nutrition assistant in a diet recommendation app.

Here are the user's current predicted meals:
- Breakfast: ${predictedMeals.Breakfast.join(", ") || "Not specified"}
- Lunch: ${predictedMeals.Lunch.join(", ") || "Not specified"}
- Snacks: ${predictedMeals.Snacks.join(", ") || "Not specified"}
- Dinner: ${predictedMeals.Dinner.join(", ") || "Not specified"}

The user is asking about **${mealType}**.
The foods predicted for that meal are: ${mealFoods.join(", ") || "None"}.
User message: "${userMessage}"

Your task:
1. Suggest a **healthy alternative** only for the ${mealType} items mentioned.
2. Stay strictly within the same meal category (if dinner → suggest dinner-type foods).
3. Suggest 1 alternative item with a short reasoning (2–4 sentences max).
4. The suggestion should be Indian-inspired, realistic, and balanced.
5. Then, provide a **quick recipe** (3–5 short steps) for how to make the suggested dish at home.
6. Keep the recipe simple, using common Indian household ingredients.
`;

    // ✅ Call Groq API
    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.1-8b-instant", // or "llama3-70b-8192" for more detailed responses
        messages: [
          {
            role: "system",
            content:
              "You are a helpful and context-aware diet assistant that gives Indian-inspired healthy alternatives for the specified meal type only.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    // ✅ Extract chatbot reply
    const suggestion =
      response.data.choices?.[0]?.message?.content ||
      "Sorry, I couldn’t generate a suggestion right now.";

    res.json({ suggestion });
  } catch (err) {
    console.error("Error calling Groq API:", err.response?.data || err.message);
    res.status(500).json({ error: "Chatbot error" });
  }
});

module.exports = router;
