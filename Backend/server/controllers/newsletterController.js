const Newsletter = require('../models/Newsletter');

class NewsletterController {
  // Subscribe to newsletter
  static async subscribe(req, res) {
    try {
      const { email } = req.body;

      // Validation
      if (!email || !email.trim()) {
        return res.status(400).json({ ok: false, message: 'Email is required' });
      }

      // Email validation regex
      const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ ok: false, message: 'Please provide a valid email address' });
      }

      // Check if email already exists
      let subscriber = await Newsletter.findOne({ email: email.toLowerCase() });

      if (subscriber) {
        if (subscriber.active) {
          return res.status(400).json({ ok: false, message: 'This email is already subscribed' });
        } else {
          // Reactivate subscription
          subscriber.active = true;
          subscriber.unsubscribedAt = null;
          await subscriber.save();
          return res.json({ ok: true, message: 'Welcome back! You have been resubscribed' });
        }
      }

      // Create new subscription
      subscriber = new Newsletter({
        email: email.toLowerCase(),
        subscribedAt: new Date(),
        active: true,
      });

      await subscriber.save();

      res.status(201).json({
        ok: true,
        message: 'Successfully subscribed to newsletter!',
        data: {
          email: subscriber.email,
          subscribedAt: subscriber.subscribedAt,
        },
      });
    } catch (err) {
      console.error('Newsletter subscribe error:', err);
      
      // Handle duplicate key error
      if (err.code === 11000) {
        return res.status(400).json({ ok: false, message: 'This email is already subscribed' });
      }

      res.status(500).json({ ok: false, message: 'Failed to subscribe to newsletter' });
    }
  }

  // Unsubscribe from newsletter
  static async unsubscribe(req, res) {
    try {
      const { email } = req.body;

      if (!email || !email.trim()) {
        return res.status(400).json({ ok: false, message: 'Email is required' });
      }

      const subscriber = await Newsletter.findOne({ email: email.toLowerCase() });

      if (!subscriber) {
        return res.status(404).json({ ok: false, message: 'Email not found in newsletter' });
      }

      if (!subscriber.active) {
        return res.status(400).json({ ok: false, message: 'This email is already unsubscribed' });
      }

      subscriber.active = false;
      subscriber.unsubscribedAt = new Date();
      await subscriber.save();

      res.json({
        ok: true,
        message: 'Successfully unsubscribed from newsletter',
      });
    } catch (err) {
      console.error('Newsletter unsubscribe error:', err);
      res.status(500).json({ ok: false, message: 'Failed to unsubscribe from newsletter' });
    }
  }

  // Get all active subscribers (admin only - not implemented here)
  static async getSubscribers(req, res) {
    try {
      const subscribers = await Newsletter.find({ active: true })
        .select('email subscribedAt')
        .sort({ subscribedAt: -1 });

      res.json({
        ok: true,
        data: subscribers,
        count: subscribers.length,
      });
    } catch (err) {
      console.error('Get subscribers error:', err);
      res.status(500).json({ ok: false, message: 'Failed to fetch subscribers' });
    }
  }

  // Check if email is subscribed
  static async checkSubscription(req, res) {
    try {
      const { email } = req.query;

      if (!email) {
        return res.status(400).json({ ok: false, message: 'Email is required' });
      }

      const subscriber = await Newsletter.findOne({ email: email.toLowerCase() });

      res.json({
        ok: true,
        subscribed: subscriber ? subscriber.active : false,
      });
    } catch (err) {
      console.error('Check subscription error:', err);
      res.status(500).json({ ok: false, message: 'Failed to check subscription' });
    }
  }
}

module.exports = NewsletterController;
