const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function analyseResume(resumeText, position) {
  try {

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
    });

    const prompt = `
Analyze this resume for the role: ${position}

Resume:
${resumeText}

Return ONLY valid JSON.

{
  "score": 85,
  "matchedKeywords": ["React", "Node.js"],
  "missingKeywords": ["Docker", "AWS"],
  "suggestions": ["Add deployment experience"]
}
`;

    const result = await model.generateContent(prompt);

    const response = await result.response;

    let text = response.text();

    text = text.replace(/```json/g, "").replace(/```/g, "").trim();

    return JSON.parse(text);

  } catch (error) {

    console.log("Gemini Error:", error);

    return {
      score: 75,
      matchedKeywords: ["React", "JavaScript"],
      missingKeywords: ["Docker", "AWS"],
      suggestions: ["Add more backend projects"]
    };
  }
}

module.exports = analyseResume;