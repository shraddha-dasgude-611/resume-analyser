const express = require('express');
const router = express.Router();
const Groq = require('groq-sdk');
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Generate interview questions
router.post('/generate', async (req, res) => {
  const { position, resumeText, type = 'both' } = req.body;

  if (!position) return res.status(400).json({ error: 'Position is required' });

  const typePrompt =
    type === 'technical'
      ? 'Only technical/coding/domain-specific questions.'
      : type === 'hr'
      ? 'Only HR and behavioral questions.'
      : 'Mix of technical and HR/behavioral questions.';

  const prompt = `You are an expert interviewer for the position of "${position}".
${resumeText ? `Candidate resume summary: ${resumeText.substring(0, 1500)}` : ''}

Generate exactly 7 interview questions. ${typePrompt}

Respond ONLY in this JSON format with no extra text:
{
  "questions": [
    { "id": 1, "question": "...", "type": "technical" },
    { "id": 2, "question": "...", "type": "hr" }
  ]
}`;

  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: 'You are an expert interviewer. Respond only with valid JSON, no markdown.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.5,
      max_tokens: 1000,
    });

    const text = completion.choices[0].message.content.trim();
    const json = text.match(/\{[\s\S]*\}/);
    if (!json) throw new Error('Invalid AI response');
    res.json(JSON.parse(json[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to generate questions' });
  }
});

// Evaluate a single answer
router.post('/evaluate', async (req, res) => {
  const { question, answer, position } = req.body;

  if (!question || !answer) return res.status(400).json({ error: 'Question and answer required' });

  const prompt = `You are evaluating a candidate's interview answer for the position of "${position}".

Question: "${question}"
Candidate's Answer: "${answer}"

Respond ONLY in this JSON format with no extra text:
{
  "score": <number 0-10>,
  "feedback": "2-3 sentences of specific feedback",
  "idealAnswer": "A brief ideal answer in 2-3 sentences"
}`;

  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: 'You are an expert interview evaluator. Respond only with valid JSON, no markdown.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 500,
    });

    const text = completion.choices[0].message.content.trim();
    const json = text.match(/\{[\s\S]*\}/);
    if (!json) throw new Error('Invalid AI response');
    res.json(JSON.parse(json[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to evaluate answer' });
  }
});

module.exports = router;