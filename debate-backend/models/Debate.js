const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender:    { type: String, enum: ['human', 'ai'] },
  content:   { type: String },
  timestamp: { type: Date }
}, { _id: false });

const debateSchema = new mongoose.Schema({
  userId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  topic:      { type: String, required: true },
  winner:     { type: String, enum: ['human', 'ai', 'tie', 'none'] },
  humanScore: { type: Number, default: 0 },
  aiScore:    { type: Number, default: 0 },
  userLevel:  { type: String, enum: ['school', 'college', 'professional'] },
  debateMode: { type: String, enum: ['text', 'voice'] },
  messages:   [messageSchema],
  keyPoints:  [String],
  createdAt:  { type: Date, default: Date.now }
});

module.exports = mongoose.model('Debate', debateSchema);