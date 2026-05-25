const Groq = require('groq-sdk');
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function analyseResume(resumeText, position) {
  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      {
        role: 'system',
        content: 'You are an expert ATS system and career coach. Always respond with valid JSON only. No markdown, no explanation, no code blocks.'
      },
      {
        role: 'user',
        content: `Analyse this resume for the job position: "${position}".

Resume:
"""
${resumeText}
"""

Return ONLY this JSON:
{
  "score": <number 0-100>,
  "matchedKeywords": ["keyword1", "keyword2"],
  "missingKeywords": ["keyword1", "keyword2"],
  "suggestions": ["suggestion1", "suggestion2", "suggestion3"]
}`
      }
    ],
    temperature: 0.3,
    max_tokens: 1000,
  });

  const text = completion.choices[0].message.content;
  const cleaned = text.replace(/```json|```/g, '').trim();
  return JSON.parse(cleaned);
}

module.exports = analyseResume;