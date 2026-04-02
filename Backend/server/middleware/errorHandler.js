// Error handling middleware
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err.message);

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      ok: false,
      message: 'Validation error',
      details: Object.values(err.errors).map((e) => e.message),
    });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({
      ok: false,
      message: 'Invalid ID format',
    });
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(400).json({
      ok: false,
      message: `${field} already exists`,
    });
  }

  res.status(err.status || 500).json({
    ok: false,
    message: err.message || 'Internal server error',
  });
};

module.exports = errorHandler;
