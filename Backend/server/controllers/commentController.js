const Comment = require('../models/Comment');

class CommentController {
  // Get comments for a recipe
  static async getByRecipe(req, res) {
    try {
      const comments = await Comment.find({ recipe: req.params.recipeId })
        .populate('author', 'name email')
        .sort({ createdAt: -1 });

      res.json({ ok: true, data: comments });
    } catch (err) {
      console.error('Get comments error:', err);
      res.status(500).json({ ok: false, message: 'Failed to fetch comments' });
    }
  }

  // Create comment
  static async create(req, res) {
    try {
      const { text } = req.body;

      if (!text || text.trim().length === 0) {
        return res.status(400).json({ ok: false, message: 'Comment text required' });
      }

      if (text.length > 500) {
        return res.status(400).json({ ok: false, message: 'Comment must be less than 500 characters' });
      }

      const comment = await Comment.create({
        text,
        author: req.user.id,
        recipe: req.params.recipeId,
      });

      await comment.populate('author', 'name email');

      res.status(201).json({
        ok: true,
        message: 'Comment created successfully',
        data: comment,
      });
    } catch (err) {
      console.error('Create comment error:', err);
      res.status(500).json({ ok: false, message: 'Failed to create comment' });
    }
  }

  // Delete comment
  static async delete(req, res) {
    try {
      const comment = await Comment.findById(req.params.commentId);

      if (!comment) {
        return res.status(404).json({ ok: false, message: 'Comment not found' });
      }

      if (String(comment.author) !== String(req.user.id)) {
        return res.status(403).json({ ok: false, message: 'Unauthorized' });
      }

      await Comment.deleteOne({ _id: req.params.commentId });

      res.json({ ok: true, message: 'Comment deleted successfully' });
    } catch (err) {
      console.error('Delete comment error:', err);
      res.status(500).json({ ok: false, message: 'Failed to delete comment' });
    }
  }
}

module.exports = CommentController;
