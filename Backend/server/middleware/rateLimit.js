// Simple rate limiter
const rateLimit = {};

const rateLimitMiddleware = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    const now = Date.now();

    if (!rateLimit[ip]) {
      rateLimit[ip] = [];
    }

    // Remove old requests
    rateLimit[ip] = rateLimit[ip].filter((time) => now - time < windowMs);

    if (rateLimit[ip].length >= maxRequests) {
      return res.status(429).json({
        ok: false,
        message: 'Too many requests. Try again later.',
      });
    }

    rateLimit[ip].push(now);
    next();
  };
};

module.exports = rateLimitMiddleware;
