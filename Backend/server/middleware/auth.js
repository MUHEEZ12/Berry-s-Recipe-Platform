const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'] || req.headers['Authorization'];
    
    if (!authHeader) {
      return res.status(401).json({ ok: false, message: 'Missing Authorization header' });
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({ ok: false, message: 'Invalid Authorization format' });
    }

    const token = parts[1];
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET || 'secret123');
      req.user = payload; // { id, email }
      next();
    } catch (err) {
      return res.status(401).json({ ok: false, message: 'Invalid or expired token' });
    }
  } catch (err) {
    return res.status(401).json({ ok: false, message: 'Authentication failed' });
  }
};

module.exports = auth;

