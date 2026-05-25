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

module.exports = router;