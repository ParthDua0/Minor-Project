const mongoose = require('mongoose');

const assessmentSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  skill: { type: String, required: true, lowercase: true, trim: true },
  answers: [{ questionId: String, answer: String, correct: Boolean }],
  score: { type: Number, min: 0, max: 100, required: true },
  passed: { type: Boolean, required: true, default: false },
  level: { type: String, enum: ['Beginner', 'Developing', 'Proficient', 'Job ready'], required: true }
}, { timestamps: true });

assessmentSchema.index({ studentId: 1, skill: 1 }, { unique: true });
module.exports = mongoose.model('Assessment', assessmentSchema);
