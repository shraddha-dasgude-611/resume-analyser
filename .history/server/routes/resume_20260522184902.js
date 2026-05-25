const express = require('express');
const multer = require('multer');
const router = express.Router();
const parseResume = require('../utils/parseResume');
const analyseResume = require('../utils/geminiAnalyse');
const Analysis = require('../models/Analysis');
const auth = require('../middleware/auth');

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    allowed.includes(file.mimetype) ? cb(null, true) : cb(new Error('Invalid file type'));
  }
});

// Analyse resume (protected)
router.post('/analyse', auth, upload.single('resume'), async (req, res) => {
  try {
    const { position } = req.body;
    if (!req.file || !position)
      return res.status(400).json({ error: 'Resume file and position are required' });

    const resumeText = await parseResume({
      mimetype: req.file.mimetype,
      buffer: req.file.buffer
    });

    const analysis = await analyseResume(resumeText, position);
    console.log('Analysis result:', JSON.stringify(analysis));

    const saved = await Analysis.create({
      userId: req.user.id,
      position,
      resumeText,
      score: analysis.score,
      matchedKeywords: analysis.matchedKeywords,
      missingKeywords: analysis.missingKeywords,
      suggestions: analysis.suggestions
    });
    res.json({ id: saved._id, resumeText, position, ...analysis });
    res.json({ id: saved._id, resumeText, ...analysis });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Analysis failed' });
  }
});

// Get history (protected)
router.get('/history', auth, async (req, res) => {
  try {
    const history = await Analysis.find({ userId: req.user.id })
      .select('-resumeText')
      .sort({ createdAt: -1 })
      .limit(20);
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch history' });
  }
});
// Build resume route
router.post('/build', auth, async (req, res) => {
  try {
    const { resumeText, position, missingKeywords, score } = req.body;

    if (!resumeText || !position)
      return res.status(400).json({ error: 'resumeText and position are required' });

    const Groq = require('groq-sdk');
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: `You are an expert ATS resume writer.
Respond with ONLY a raw JSON object. No markdown, no backticks, no explanation.
Just the JSON starting with { and ending with }.`
        },
        {
          role: 'user',
          content: `Rebuild this resume to better match the job position: "${position}".

ORIGINAL RESUME:
"""
${resumeText}
"""

MISSING KEYWORDS TO ADD NATURALLY: ${(missingKeywords || []).join(', ')}
CURRENT MATCH SCORE: ${score}%

STRICT RULES:
- Never fabricate experience, companies, degrees or skills
- Only rephrase and strengthen what already exists
- Naturally weave in missing keywords where they genuinely fit
- Strengthen bullet points with strong action verbs
- Return ONLY this JSON structure:

{
  "name": "",
  "email": "",
  "phone": "",
  "linkedin": "",
  "summary": "",
  "skills": [""],
  "experience": [
    {
      "company": "",
      "role": "",
      "duration": "",
      "bullets": ["", ""]
    }
  ],
  "education": [
    {
      "degree": "",
      "institution": "",
      "year": ""
    }
  ],
  "projects": [
    {
      "name": "",
      "description": ""
    }
  ],
  "improvements": ["what changed and why"]
}`
        }
      ],
      temperature: 0.1,
      max_tokens: 2000,
    });

    const text = completion.choices[0].message.content.trim();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('AI did not return valid JSON');

    const builtResume = JSON.parse(jsonMatch[0]);
    res.json({ success: true, builtResume });

  } catch (err) {
    console.error('Build resume error:', err);
    res.status(500).json({ error: err.message || 'Failed to build resume' });
  }
});
module.exports = router;