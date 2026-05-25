const express = require('express');
const multer = require('multer');
const router = express.Router();
const parseResume = require('../utils/parseResume');
const analyseResume = require('../utils/geminiAnalyse');
const Analysis = require('../models/Analysis');

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = ['application/pdf', 'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    allowed.includes(file.mimetype) ? cb(null, true) : cb(new Error('Invalid file type'));
  }
});

router.post('/analyse', upload.single('resume'), async (req, res) => {
  try {
    const { position } = req.body;

    if (!req.file || !position) {
      return res.status(400).json({ error: 'Resume file and position are required' });
    }

    // Parse resume text
    const resumeText = await parseResume({
      mimetype: req.file.mimetype,
      buffer: req.file.buffer
    });

    // Analyse with Gemini
    const analysis = await analyseResume(resumeText, position);
    console.log('Analysis result:', JSON.stringify(analysis));

    // Save to DB
    const saved = await Analysis.create({
      position,
      resumeText,
      score: analysis.score,
      matchedKeywords: analysis.matchedKeywords,
      missingKeywords: analysis.missingKeywords,
      suggestions: analysis.suggestions
    });
    res.json({ id: saved._id, resumeText, ...analysis });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Analysis failed' });
  }
});

router.get('/history', async (req, res) => {
  try {
    const history = await Analysis.find()
      .select('-resumeText')
      .sort({ createdAt: -1 })
      .limit(10);
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch history' });
  }
});

module.exports = router;