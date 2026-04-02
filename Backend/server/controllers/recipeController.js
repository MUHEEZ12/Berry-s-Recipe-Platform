const Recipe = require('../models/Recipe');
const Comment = require('../models/Comment');
const mongoose = require('mongoose');

class RecipeController {
  // Get all recipes with pagination and search
  static async getAll(req, res) {
    try {
      const { page = 1, limit = 12, search = '', category = '', sortBy = 'newest' } = req.query;

      const skip = (page - 1) * limit;
      let query = {};

      // Search
      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
        ];
      }

      // Filter by category
      if (category && category !== 'all') {
        query.category = category;
      }

      // Sorting
      let sort = { createdAt: -1 };
      if (sortBy === 'trending') {
        sort = { likesCount: -1, viewCount: -1 };
      } else if (sortBy === 'mostLiked') {
        sort = { likesCount: -1 };
      } else if (sortBy === 'oldest') {
        sort = { createdAt: 1 };
      }

      const recipes = await Recipe.find(query)
        .populate('owner', 'name email')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit));

      const total = await Recipe.countDocuments(query);

      res.json({
        ok: true,
        data: recipes,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      });
    } catch (err) {
      console.error('Get recipes error:', err);
      res.status(500).json({ ok: false, message: 'Failed to fetch recipes' });
    }
  }

  // Get single recipe with view tracking
  static async getById(req, res) {
    try {
      // Validate MongoDB ObjectID format
      if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({ ok: false, message: 'Invalid recipe ID format' });
      }

      const recipe = await Recipe.findByIdAndUpdate(
        req.params.id,
        { $inc: { viewCount: 1 } },
        { new: true }
      ).populate('owner', 'name email');

      if (!recipe) {
        return res.status(404).json({ ok: false, message: 'Recipe not found' });
      }

      // Get comments
      const comments = await Comment.find({ recipe: recipe._id })
        .populate('author', 'name email')
        .sort({ createdAt: -1 });

      res.json({
        ok: true,
        data: {
          ...recipe.toObject(),
          comments,
          isLiked: req.user ? recipe.likedBy.some(id => String(id) === String(req.user.id)) : false,
          isFavorited: req.user ? recipe.favoritedBy.some(id => String(id) === String(req.user.id)) : false,
        },
      });
    } catch (err) {
      console.error('Get recipe error:', err);
      res.status(500).json({ ok: false, message: 'Failed to fetch recipe' });
    }
  }

  // Create recipe
  static async create(req, res) {
    try {
      const { title, description, images, ingredients, steps, category } = req.body;

      if (!title || !description) {
        return res.status(400).json({ ok: false, message: 'Title and description required' });
      }

      if (!Array.isArray(ingredients) || !Array.isArray(steps)) {
        return res.status(400).json({ ok: false, message: 'Ingredients and steps must be arrays' });
      }

      const recipe = await Recipe.create({
        title,
        description,
        images: images || [],
        ingredients,
        steps,
        category: category || 'General',
        owner: req.user.id,
      });

      await recipe.populate('owner', 'name email');

      res.status(201).json({
        ok: true,
        message: 'Recipe created successfully',
        data: recipe,
      });
    } catch (err) {
      console.error('Create recipe error:', err);
      res.status(500).json({ ok: false, message: 'Failed to create recipe' });
    }
  }

  // Update recipe
  static async update(req, res) {
    try {
      const recipe = await Recipe.findById(req.params.id);

      if (!recipe) {
        return res.status(404).json({ ok: false, message: 'Recipe not found' });
      }

      if (String(recipe.owner) !== String(req.user.id)) {
        return res.status(403).json({ ok: false, message: 'Unauthorized' });
      }

      const { title, description, images, ingredients, steps, category } = req.body;

      if (title) recipe.title = title;
      if (description) recipe.description = description;
      if (images) recipe.images = images;
      if (ingredients) recipe.ingredients = ingredients;
      if (steps) recipe.steps = steps;
      if (category) recipe.category = category;

      await recipe.save();
      await recipe.populate('owner', 'name email');

      res.json({
        ok: true,
        message: 'Recipe updated successfully',
        data: recipe,
      });
    } catch (err) {
      console.error('Update recipe error:', err);
      res.status(500).json({ ok: false, message: 'Failed to update recipe' });
    }
  }

  // Delete recipe
  static async delete(req, res) {
    try {
      const recipe = await Recipe.findById(req.params.id);

      if (!recipe) {
        return res.status(404).json({ ok: false, message: 'Recipe not found' });
      }

      if (String(recipe.owner) !== String(req.user.id)) {
        return res.status(403).json({ ok: false, message: 'Unauthorized' });
      }

      await Recipe.deleteOne({ _id: req.params.id });
      await Comment.deleteMany({ recipe: req.params.id });

      res.json({ ok: true, message: 'Recipe deleted successfully' });
    } catch (err) {
      console.error('Delete recipe error:', err);
      res.status(500).json({ ok: false, message: 'Failed to delete recipe' });
    }
  }

  // Like/Unlike recipe
  static async toggleLike(req, res) {
    try {
      const recipe = await Recipe.findById(req.params.id);

      if (!recipe) {
        return res.status(404).json({ ok: false, message: 'Recipe not found' });
      }

      const userId = req.user.id;
      const isLiked = recipe.likedBy.some(id => String(id) === String(userId));

      if (isLiked) {
        recipe.likedBy = recipe.likedBy.filter((id) => String(id) !== String(userId));
        recipe.likesCount = Math.max(0, recipe.likesCount - 1);
      } else {
        recipe.likedBy.push(userId);
        recipe.likesCount += 1;
      }

      await recipe.save();

      res.json({
        ok: true,
        message: isLiked ? 'Like removed' : 'Recipe liked',
        liked: !isLiked,
        likesCount: recipe.likesCount,
      });
    } catch (err) {
      console.error('Toggle like error:', err);
      res.status(500).json({ ok: false, message: 'Failed to like recipe' });
    }
  }

  // Favorite/Unfavorite recipe
  static async toggleFavorite(req, res) {
    try {
      const recipe = await Recipe.findById(req.params.id);

      if (!recipe) {
        return res.status(404).json({ ok: false, message: 'Recipe not found' });
      }

      const userId = req.user.id;
      const isFavorited = recipe.favoritedBy.some(id => String(id) === String(userId));

      if (isFavorited) {
        recipe.favoritedBy = recipe.favoritedBy.filter((id) => String(id) !== String(userId));
      } else {
        recipe.favoritedBy.push(userId);
      }

      await recipe.save();

      res.json({
        ok: true,
        message: isFavorited ? 'Removed from favorites' : 'Added to favorites',
        favorited: !isFavorited,
      });
    } catch (err) {
      console.error('Toggle favorite error:', err);
      res.status(500).json({ ok: false, message: 'Failed to favorite recipe' });
    }
  }

  // Get trending recipes
  static async getTrending(req, res) {
    try {
      const recipes = await Recipe.find()
        .populate('owner', 'name email')
        .sort({ likesCount: -1, viewCount: -1 })
        .limit(10);

      res.json({ ok: true, data: recipes });
    } catch (err) {
      console.error('Trending error:', err);
      res.status(500).json({ ok: false, message: 'Failed to fetch trending' });
    }
  }

  // Get user's favorites
  static async getFavorites(req, res) {
    try {
      const recipes = await Recipe.find({ favoritedBy: req.user.id })
        .populate('owner', 'name email');

      res.json({ ok: true, data: recipes });
    } catch (err) {
      console.error('Favorites error:', err);
      res.status(500).json({ ok: false, message: 'Failed to fetch favorites' });
    }
  }

  // Add or update review/rating
  static async addReview(req, res) {
    try {
      const { rating, comment } = req.body;
      const recipeId = req.params.id;
      const userId = req.user.id;
      const userName = req.user.name || 'Anonymous';

      // Validate rating
      if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({ ok: false, message: 'Rating must be between 1 and 5' });
      }

      const recipe = await Recipe.findById(recipeId);
      if (!recipe) {
        return res.status(404).json({ ok: false, message: 'Recipe not found' });
      }

      // Check if user already reviewed
      const existingReviewIndex = recipe.reviews.findIndex(
        (r) => String(r.userId) === String(userId)
      );

      if (existingReviewIndex > -1) {
        // Update existing review
        recipe.reviews[existingReviewIndex] = {
          ...recipe.reviews[existingReviewIndex],
          rating,
          comment,
          createdAt: new Date(),
        };
      } else {
        // Add new review
        recipe.reviews.push({
          userId,
          userName,
          rating,
          comment,
          createdAt: new Date(),
          helpful: 0,
          unhelpful: 0,
          helpfulBy: [],
          unhelpfulBy: [],
        });
      }

      // Recalculate average rating
      const totalRating = recipe.reviews.reduce((sum, r) => sum + r.rating, 0);
      recipe.totalRatings = recipe.reviews.length;
      recipe.averageRating = (totalRating / recipe.reviews.length).toFixed(1);

      await recipe.save();

      res.json({
        ok: true,
        message: existingReviewIndex > -1 ? 'Review updated' : 'Review added',
        data: {
          averageRating: recipe.averageRating,
          totalRatings: recipe.totalRatings,
          reviews: recipe.reviews,
        },
      });
    } catch (err) {
      console.error('Add review error:', err);
      res.status(500).json({ ok: false, message: 'Failed to add review' });
    }
  }

  // Delete review
  static async deleteReview(req, res) {
    try {
      const { recipeId, reviewId } = req.params;
      const userId = req.user.id;

      const recipe = await Recipe.findById(recipeId);
      if (!recipe) {
        return res.status(404).json({ ok: false, message: 'Recipe not found' });
      }

      // Find review index
      const reviewIndex = recipe.reviews.findIndex((r) => String(r._id) === reviewId);
      if (reviewIndex === -1) {
        return res.status(404).json({ ok: false, message: 'Review not found' });
      }

      // Check if user is owner of review
      if (String(recipe.reviews[reviewIndex].userId) !== String(userId)) {
        return res.status(403).json({ ok: false, message: 'Not authorized to delete this review' });
      }

      recipe.reviews.splice(reviewIndex, 1);

      // Recalculate average rating
      if (recipe.reviews.length > 0) {
        const totalRating = recipe.reviews.reduce((sum, r) => sum + r.rating, 0);
        recipe.totalRatings = recipe.reviews.length;
        recipe.averageRating = (totalRating / recipe.reviews.length).toFixed(1);
      } else {
        recipe.totalRatings = 0;
        recipe.averageRating = 0;
      }

      await recipe.save();

      res.json({
        ok: true,
        message: 'Review deleted',
        data: {
          averageRating: recipe.averageRating,
          totalRatings: recipe.totalRatings,
        },
      });
    } catch (err) {
      console.error('Delete review error:', err);
      res.status(500).json({ ok: false, message: 'Failed to delete review' });
    }
  }

  // Mark review as helpful
  static async markHelpful(req, res) {
    try {
      const { recipeId, reviewId } = req.params;
      const userId = req.user.id;

      const recipe = await Recipe.findById(recipeId);
      if (!recipe) {
        return res.status(404).json({ ok: false, message: 'Recipe not found' });
      }

      const review = recipe.reviews.find((r) => String(r._id) === reviewId);
      if (!review) {
        return res.status(404).json({ ok: false, message: 'Review not found' });
      }

      // Check if already marked as helpful
      const isHelpful = review.helpfulBy.includes(userId);
      if (isHelpful) {
        review.helpfulBy = review.helpfulBy.filter((id) => String(id) !== String(userId));
        review.helpful = Math.max(0, review.helpful - 1);
      } else {
        review.helpfulBy.push(userId);
        review.helpful += 1;
        // Remove from unhelpful if marked there
        if (review.unhelpfulBy.includes(userId)) {
          review.unhelpfulBy = review.unhelpfulBy.filter((id) => String(id) !== String(userId));
          review.unhelpful = Math.max(0, review.unhelpful - 1);
        }
      }

      await recipe.save();

      res.json({
        ok: true,
        message: isHelpful ? 'Helpful removed' : 'Marked as helpful',
        data: {
          helpful: review.helpful,
          unhelpful: review.unhelpful,
        },
      });
    } catch (err) {
      console.error('Mark helpful error:', err);
      res.status(500).json({ ok: false, message: 'Failed to mark as helpful' });
    }
  }

  // Mark review as unhelpful
  static async markUnhelpful(req, res) {
    try {
      const { recipeId, reviewId } = req.params;
      const userId = req.user.id;

      const recipe = await Recipe.findById(recipeId);
      if (!recipe) {
        return res.status(404).json({ ok: false, message: 'Recipe not found' });
      }

      const review = recipe.reviews.find((r) => String(r._id) === reviewId);
      if (!review) {
        return res.status(404).json({ ok: false, message: 'Review not found' });
      }

      // Check if already marked as unhelpful
      const isUnhelpful = review.unhelpfulBy.includes(userId);
      if (isUnhelpful) {
        review.unhelpfulBy = review.unhelpfulBy.filter((id) => String(id) !== String(userId));
        review.unhelpful = Math.max(0, review.unhelpful - 1);
      } else {
        review.unhelpfulBy.push(userId);
        review.unhelpful += 1;
        // Remove from helpful if marked there
        if (review.helpfulBy.includes(userId)) {
          review.helpfulBy = review.helpfulBy.filter((id) => String(id) !== String(userId));
          review.helpful = Math.max(0, review.helpful - 1);
        }
      }

      await recipe.save();

      res.json({
        ok: true,
        message: isUnhelpful ? 'Unhelpful removed' : 'Marked as unhelpful',
        data: {
          helpful: review.helpful,
          unhelpful: review.unhelpful,
        },
      });
    } catch (err) {
      console.error('Mark unhelpful error:', err);
      res.status(500).json({ ok: false, message: 'Failed to mark as unhelpful' });
    }
  }

  // Get all reviews by current user
  static async getUserReviews(req, res) {
    try {
      const userId = req.user.id;
      const allRecipes = await Recipe.find({});
      
      const userReviews = [];
      for (const recipe of allRecipes) {
        const userRecipeReviews = recipe.reviews.filter(
          (r) => String(r.userId) === String(userId)
        );
        userRecipeReviews.forEach((review) => {
          userReviews.push({
            _id: review._id,
            recipeId: recipe._id,
            recipeName: recipe.title,
            recipeImage: recipe.images?.[0],
            rating: review.rating,
            comment: review.comment,
            createdAt: review.createdAt,
            helpful: review.helpful,
            unhelpful: review.unhelpful,
          });
        });
      }

      // Sort by date (newest first)
      userReviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      res.json({
        ok: true,
        data: userReviews,
      });
    } catch (err) {
      console.error('Get user reviews error:', err);
      res.status(500).json({ ok: false, message: 'Failed to fetch user reviews' });
    }
  }
}

module.exports = RecipeController;
