const mongoose = require('mongoose');

const AnalysisSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  position: String,
  resumeText: String,
  score: Number,
  matchedKeywords: [String],
  missingKeywords: [String],
  suggestions: [String],
  createdAt: { type: Date, default: Date.now }
});


module.exports = mongoose.model('Analysis', AnalysisSchema);