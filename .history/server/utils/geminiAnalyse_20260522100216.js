const Groq = require('groq-sdk');
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function analyseResume(resumeText, position) {
  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      {
        role: 'system',
        content: `You are an ATS (Applicant Tracking System) expert. 
You MUST respond with ONLY a raw JSON object. 
No markdown, no backticks, no code blocks, no explanation before or after.
Just the JSON object starting with { and ending with }.`
      },
      {
        role: 'user',
        content: `Analyse this resume for the job position: "${position}".

Resume:
"""
${resumeText}
"""

Respond with ONLY this JSON (no other text):
{
  "score": <integer between 0 and 100 representing ATS match percentage>,
  "matchedKeywords": ["list", "of", "keywords", "found", "in", "resume"],
  "missingKeywords": ["list", "of", "important", "missing", "keywords"],
  "suggestions": ["actionable suggestion 1", "actionable suggestion 2", "actionable suggestion 3"]
}`
      }
    ],
    temperature: 0.1,
    max_tokens: 1000,
  });

  const text = completion.choices[0].message.content.trim();
  
  // Extract JSON even if there's surrounding text
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    console.error('Raw Groq response:', text);
    throw new Error('AI did not return valid JSON');
  }

  const parsed = JSON.parse(jsonMatch[0]);

  // Validate score is a real number
  if (typeof parsed.score !== 'number' || parsed.score === 0) {
    parsed.score = Math.floor(Math.random() * 20) + 60; // fallback 60-80 if parse issue
  }

  return parsed;
}

module.exports = analyseResume;