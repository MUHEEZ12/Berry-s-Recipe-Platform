const express = require('express');
const router = express.Router({ mergeParams: true });
const CommentController = require('../controllers/commentController');
const auth = require('../middleware/auth');

router.get('/', CommentController.getByRecipe);
router.post('/', auth, CommentController.create);
router.delete('/:commentId', auth, CommentController.delete);

module.exports = router;
