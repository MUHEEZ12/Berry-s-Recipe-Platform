const express = require('express');
const router = express.Router();
const NewsletterController = require('../controllers/newsletterController');

// Public routes
router.post('/subscribe', NewsletterController.subscribe);
router.post('/unsubscribe', NewsletterController.unsubscribe);
router.get('/check', NewsletterController.checkSubscription);

// Admin routes (can be protected with auth middleware later)
router.get('/subscribers', NewsletterController.getSubscribers);

module.exports = router;
