const mongoose = require("mongoose");

const ConfessionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  secretCode: {
    type: String,
    required: true,
    minlength: 4,
    maxlength: 64
  },
  reactions: {
    like: { type: Number, default: 0 },
    love: { type: Number, default: 0 },
    laugh: { type: Number, default: 0 }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  userId: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model("Confession", ConfessionSchema);
