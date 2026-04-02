const mongoose = require('mongoose');

const RecipeSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  images: [{ type: String }],
  ingredients: [{ type: String, required: true }],
  steps: [{ type: String, required: true }],
  category: { type: String, default: 'General' },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  // Engagement metrics
  likesCount: { type: Number, default: 0 },
  likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  favoritedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  viewCount: { type: Number, default: 0 },
  
  // Ratings and Reviews
  averageRating: { type: Number, default: 0, min: 0, max: 5 },
  totalRatings: { type: Number, default: 0 },
  reviews: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      userName: { type: String, required: true },
      rating: { type: Number, required: true, min: 1, max: 5 },
      comment: { type: String },
      createdAt: { type: Date, default: Date.now },
      helpful: { type: Number, default: 0 },
      unhelpful: { type: Number, default: 0 },
      helpfulBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
      unhelpfulBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
    }
  ],
  
  // Recipe metadata
  prepTime: { type: Number, default: 30 }, // in minutes
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Easy' },
  servings: { type: Number, default: 2 },
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Pre-save hook to update rating when a review is added/modified
RecipeSchema.pre('save', function(next) {
  if (this.reviews && this.reviews.length > 0) {
    const totalRating = this.reviews.reduce((sum, review) => sum + review.rating, 0);
    this.totalRatings = this.reviews.length;
    this.averageRating = (totalRating / this.reviews.length).toFixed(1);
  }
  next();
});

// Index for faster queries
RecipeSchema.index({ title: 'text', description: 'text' });
RecipeSchema.index({ owner: 1 });
RecipeSchema.index({ category: 1 });
RecipeSchema.index({ likesCount: -1 });
RecipeSchema.index({ viewCount: -1 });
RecipeSchema.index({ averageRating: -1 });

module.exports = mongoose.model('Recipe', RecipeSchema);
