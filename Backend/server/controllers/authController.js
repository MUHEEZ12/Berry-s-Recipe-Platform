const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

class AuthController {
  // Register
  static async register(req, res) {
    try {
      const { name, email, password } = req.body;

      // Validation
      if (!email || !password) {
        return res.status(400).json({ ok: false, message: 'Email and password required' });
      }
      if (password.length < 6) {
        return res.status(400).json({ ok: false, message: 'Password must be at least 6 characters' });
      }
      if (!email.includes('@')) {
        return res.status(400).json({ ok: false, message: 'Invalid email format' });
      }

      const exists = await User.findOne({ email });
      if (exists) {
        return res.status(400).json({ ok: false, message: 'Email already registered' });
      }

      const hash = await bcrypt.hash(password, 12);
      const user = await User.create({ name: name || 'User', email, password: hash });

      const token = jwt.sign(
        { id: user._id, email: user.email },
        process.env.JWT_SECRET || 'secret123',
        { expiresIn: '7d' }
      );

      res.status(201).json({
        ok: true,
        token,
        user: { id: user._id, email: user.email, name: user.name },
      });
    } catch (err) {
      console.error('Register error:', err);
      res.status(500).json({ ok: false, message: 'Registration failed' });
    }
  }

  // Login
  static async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ ok: false, message: 'Email and password required' });
      }

      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ ok: false, message: 'Invalid credentials' });
      }

      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return res.status(401).json({ ok: false, message: 'Invalid credentials' });
      }

      const token = jwt.sign(
        { id: user._id, email: user.email },
        process.env.JWT_SECRET || 'secret123',
        { expiresIn: '7d' }
      );

      res.json({
        ok: true,
        token,
        user: { id: user._id, email: user.email, name: user.name },
      });
    } catch (err) {
      console.error('Login error:', err);
      res.status(500).json({ ok: false, message: 'Login failed' });
    }
  }

  // Get user profile
  static async getProfile(req, res) {
    try {
      const user = await User.findById(req.user.id).select('-password');
      if (!user) {
        return res.status(404).json({ ok: false, message: 'User not found' });
      }

      const Recipe = require('../models/Recipe');
      const recipeCount = await Recipe.countDocuments({ owner: user._id });
      const totalLikes = await Recipe.aggregate([
        { $match: { owner: user._id } },
        { $group: { _id: null, total: { $sum: { $size: '$likedBy' } } } },
      ]);

      res.json({
        ok: true,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          recipeCount,
          totalLikes: totalLikes[0]?.total || 0,
        },
      });
    } catch (err) {
      console.error('Profile error:', err);
      res.status(500).json({ ok: false, message: 'Failed to fetch profile' });
    }
  }
}

module.exports = AuthController;
