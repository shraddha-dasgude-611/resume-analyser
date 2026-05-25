const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function analyseResume(resumeText, position) {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const prompt = `
You are an expert ATS (Applicant Tracking System) and career coach.

Analyse the following resume for the job position: "${position}".

Resume:
"""
${resumeText}
"""

Respond ONLY in valid JSON (no markdown, no extra text) with this exact structure:
{
  "score": <number 0-100>,
  "matchedKeywords": ["keyword1", "keyword2", ...],
  "missingKeywords": ["keyword1", "keyword2", ...],
  "suggestions": ["suggestion1", "suggestion2", ...]
}

Rules:
- score: ATS match percentage based on skills, experience, keywords
- matchedKeywords: important keywords from the resume relevant to the position
- missingKeywords: critical keywords missing that would increase ATS score
- suggestions: 3-5 actionable tips to improve the resume for this position
`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  // Strip markdown code blocks if present
  const cleaned = text.replace(/```json|```/g, '').trim();
  return JSON.parse(cleaned);
}

module.exports = analyseResume;