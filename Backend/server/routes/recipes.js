const express = require('express');
const router = express.Router();
const Recipe = require('../models/Recipe');
const auth = require('../middleware/auth');

// Get all recipes
router.get('/', async (req, res) => {
  try {
    const recipes = await Recipe.find().populate('owner', 'email name');
    res.json(recipes);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create recipe (protected)
router.post('/', auth, async (req, res) => {
  try {
    const data = req.body;
    data.owner = req.user.id;
    const recipe = await Recipe.create(data);
    res.status(201).json(recipe);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete recipe (protected, owner only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ message: 'Not found' });
    if (String(recipe.owner) !== String(req.user.id)) return res.status(403).json({ message: 'Not allowed' });

    await recipe.deleteOne();
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
