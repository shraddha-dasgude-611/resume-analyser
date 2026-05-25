const Groq = require('groq-sdk');
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function analyseResume(resumeText, position) {
  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      {
        role: 'system',
        content: `You are a strict ATS (Applicant Tracking System) expert.
You MUST respond with ONLY a raw JSON object.
No markdown, no backticks, no code blocks, no explanation before or after.
Just the JSON object starting with { and ending with }.`
      },
      {
        role: 'user',
        content: `Analyse this resume STRICTLY for the job position: "${position}".

Resume:
"""
${resumeText}
"""

STRICT SCORING RULES:
- Score ONLY based on direct, explicit skill matches for "${position}"
- Do NOT give credit for adjacent, transferable, or loosely related skills
- A resume for a completely different field should score below 25%
- Example: Data Analyst resume for Frontend Developer = 10-20% max
- Example: Frontend Developer resume for Frontend Developer = 80-95%
- matchedKeywords: ONLY skills/tools explicitly in the resume AND directly needed for "${position}"
- missingKeywords: the most critical skills for "${position}" that are completely absent from the resume

Respond with ONLY this JSON (no other text):
{
  "score": <strict integer 0-100, be harsh and accurate>,
  "matchedKeywords": ["only directly relevant matched keywords for this exact role"],
  "missingKeywords": ["critical missing keywords for this exact position"],
  "suggestions": ["actionable suggestion 1", "actionable suggestion 2", "actionable suggestion 3"]
}`
      }
    ],
    temperature: 0.1,
    max_tokens: 1000,
  });

  const text = completion.choices[0].message.content.trim();

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    console.error('Raw Groq response:', text);
    throw new Error('AI did not return valid JSON');
  }

  const parsed = JSON.parse(jsonMatch[0]);

  // Remove the random fallback — it was causing inflated scores
  // Only fallback if score is genuinely missing (not 0)
  if (typeof parsed.score !== 'number') {
    parsed.score = 0;
  }

  // Clamp between 0 and 100
  parsed.score = Math.min(100, Math.max(0, parsed.score));

  return parsed;
}

module.exports = analyseResume;