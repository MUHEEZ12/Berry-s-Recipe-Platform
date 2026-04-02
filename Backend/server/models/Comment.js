const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
  text: { type: String, required: true, maxlength: 500 },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  recipe: { type: mongoose.Schema.Types.ObjectId, ref: 'Recipe', required: true },
}, { timestamps: true });

module.exports = mongoose.model('Comment', CommentSchema);
