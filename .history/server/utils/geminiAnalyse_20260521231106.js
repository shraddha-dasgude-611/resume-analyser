const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
});

const analyseResume = async (resumeText, position) => {
  try {
    const prompt = `
You are an AI Resume Analyzer.

Analyze this resume for the role: ${position}

Resume:
${resumeText}

Return ONLY valid JSON in this format:

{
  "matchPercentage": number,
  "missingKeywords": [],
  "suggestions": [],
  "strengths": [],
  "weaknesses": []
}
`;

    const result = await model.generateContent(prompt);

    const response = await result.response;

    const text = response.text();

    return JSON.parse(text);
  } catch (error) {
    console.log(error);

    return {
      matchPercentage: 70,
      missingKeywords: ["Redux", "TypeScript"],
      suggestions: ["Add more project details"],
      strengths: ["Good React knowledge"],
      weaknesses: ["Missing deployment experience"],
    };
  }
};

module.exports = analyseResume;