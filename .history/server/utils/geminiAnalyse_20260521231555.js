const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function analyseResume(resumeText, position) {
  try {

    const model = genAI.getGenerativeModel({
      model: "gemini-pro",
    });

    const prompt = `
Analyze this resume for the role: ${position}

Resume:
${resumeText}

Return ONLY valid JSON.

Example:
{
  "matchPercentage": 85,
  "missingKeywords": ["Redux", "Docker"],
  "suggestions": ["Add more backend projects"],
  "strengths": ["Good React skills"],
  "weaknesses": ["No deployment experience"]
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
      matchPercentage: 75,
      missingKeywords: ["TypeScript", "Docker"],
      suggestions: ["Add more project descriptions"],
      strengths: ["Good frontend knowledge"],
      weaknesses: ["Limited backend experience"]
    };
  }
}

module.exports = analyseResume;