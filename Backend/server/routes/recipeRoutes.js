const express = require('express');
const router = express.Router();
const RecipeController = require('../controllers/recipeController');
const auth = require('../middleware/auth');

// Public routes
router.get('/', RecipeController.getAll);
router.get('/trending', RecipeController.getTrending);
router.get('/:id', RecipeController.getById);

// Protected routes
router.post('/', auth, RecipeController.create);
router.put('/:id', auth, RecipeController.update);
router.delete('/:id', auth, RecipeController.delete);

// Engagement
router.post('/:id/like', auth, RecipeController.toggleLike);
router.post('/:id/favorite', auth, RecipeController.toggleFavorite);
router.get('/user/favorites', auth, RecipeController.getFavorites);
router.get('/user/reviews', auth, RecipeController.getUserReviews);

// Reviews and Ratings
router.post('/:id/reviews', auth, RecipeController.addReview);
router.delete('/:recipeId/reviews/:reviewId', auth, RecipeController.deleteReview);
router.post('/:recipeId/reviews/:reviewId/helpful', auth, RecipeController.markHelpful);
router.post('/:recipeId/reviews/:reviewId/unhelpful', auth, RecipeController.markUnhelpful);

module.exports = router;
