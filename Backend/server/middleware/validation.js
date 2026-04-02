const { body, validationResult } = require('express-validator');

// 🔒 Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ ok: false, errors: errors.array() });
  }
  next();
};

// 🔒 Sanitization chains for common input fields
const sanitizeText = (fieldName) => 
  body(fieldName)
    .trim()
    .escape()
    .isLength({ min: 1, max: 5000 })
    .withMessage(`${fieldName} must be between 1 and 5000 characters`);

const sanitizeEmail = (fieldName = 'email') =>
  body(fieldName)
    .trim()
    .toLowerCase()
    .isEmail()
    .withMessage('Invalid email format')
    .normalizeEmail();

const sanitizePassword = (fieldName = 'password') =>
  body(fieldName)
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
    .matches(/^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]*$/)
    .withMessage('Password contains invalid characters');

const sanitizeRecipeTitle = () =>
  body('title')
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Recipe title must be between 3 and 200 characters')
    .escape();

const sanitizeRecipeDescription = () =>
  body('description')
    .trim()
    .isLength({ min: 10, max: 5000 })
    .withMessage('Description must be between 10 and 5000 characters')
    .escape();

const sanitizeComment = () =>
  body('text')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Comment must be between 1 and 1000 characters')
    .escape();

// 🔒 Validation chains for auth routes
const validateRegister = [
  sanitizeEmail(),
  sanitizePassword(),
  body('name').trim().isLength({ min: 2, max: 100 }).escape(),
  handleValidationErrors
];

const validateLogin = [
  sanitizeEmail(),
  sanitizePassword(),
  handleValidationErrors
];

// 🔒 Validation chains for recipe routes
const validateRecipeCreate = [
  sanitizeRecipeTitle(),
  sanitizeRecipeDescription(),
  body('category').trim().escape(),
  body('difficulty').isIn(['Easy', 'Medium', 'Hard']).withMessage('Invalid difficulty level'),
  body('prepTime').isInt({ min: 0, max: 1440 }).withMessage('Invalid prep time'),
  body('servings').isInt({ min: 1, max: 100 }).withMessage('Invalid servings'),
  handleValidationErrors
];

const validateComment = [
  sanitizeComment(),
  handleValidationErrors
];

// 🔒 Validate MongoDB ObjectId
const validateObjectId = (paramName = 'id') => 
  async (req, res, next) => {
    const id = req.params[paramName];
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ ok: false, message: 'Invalid ID format' });
    }
    next();
  };

module.exports = {
  handleValidationErrors,
  sanitizeText,
  sanitizeEmail,
  sanitizePassword,
  sanitizeRecipeTitle,
  sanitizeRecipeDescription,
  sanitizeComment,
  validateRegister,
  validateLogin,
  validateRecipeCreate,
  validateComment,
  validateObjectId,
};
