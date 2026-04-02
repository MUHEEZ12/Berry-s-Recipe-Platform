import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext';
import { recipeAPI } from '../services/api';
import toast from 'react-hot-toast';
import './CreateRecipe.css';

function CreateRecipe() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'General',
    ingredients: '',
    steps: '',
    prepTime: 30,
    difficulty: 'Easy',
    servings: 4,
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  // Handle image file selection
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrors((prev) => ({
          ...prev,
          image: 'Please select a valid image file',
        }));
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          image: 'Image must be less than 5MB',
        }));
        return;
      }

      setImageFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);

      // Clear image error
      setErrors((prev) => ({
        ...prev,
        image: '',
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Recipe title is required';
    }
    if (formData.title.trim().length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    if (formData.description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }

    if (!formData.ingredients.trim()) {
      newErrors.ingredients = 'Add at least one ingredient';
    }

    if (!formData.steps.trim()) {
      newErrors.steps = 'Add at least one cooking step';
    }

    if (!imageFile && !imagePreview) {
      newErrors.image = 'Please upload a recipe image';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      toast.error('Please log in first');
      navigate('/login');
      return;
    }

    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setLoading(true);

    try {
      const recipeData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        prepTime: parseInt(formData.prepTime),
        difficulty: formData.difficulty,
        servings: parseInt(formData.servings),
        ingredients: formData.ingredients
          .split('\n')
          .map((ing) => ing.trim())
          .filter((ing) => ing),
        steps: formData.steps
          .split('\n')
          .map((step) => step.trim())
          .filter((step) => step),
        images: imagePreview ? [imagePreview] : [],
      };

      const response = await recipeAPI.create(recipeData);

      if (response.data.ok) {
        toast.success('🎉 Recipe created successfully!');
        setFormData({
          title: '',
          description: '',
          category: 'General',
          ingredients: '',
          steps: '',
          prepTime: 30,
          difficulty: 'Easy',
          servings: 4,
        });
        setImageFile(null);
        setImagePreview(null);
        navigate('/recipes');
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || 'Failed to create recipe';
      toast.error(errorMessage);
      console.error('Recipe creation error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-recipe-page">
      <div className="create-recipe-container">
        <div className="create-recipe-header">
          <h1>🍳 Create Your Recipe</h1>
          <p>Share your delicious recipe with the community</p>
        </div>

        <form onSubmit={handleSubmit} className="recipe-form">
          {/* Title */}
          <div className="form-group">
            <label htmlFor="title">Recipe Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="E.g., Spaghetti Carbonara"
              className={errors.title ? 'input-error' : ''}
              maxLength={100}
            />
            {errors.title && (
              <span className="error-message">{errors.title}</span>
            )}
            <span className="char-count">
              {formData.title.length}/100
            </span>
          </div>

          {/* Description */}
          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Tell us about your recipe... what makes it special?"
              rows="4"
              className={errors.description ? 'textarea-error' : ''}
              maxLength={500}
            />
            {errors.description && (
              <span className="error-message">{errors.description}</span>
            )}
            <span className="char-count">
              {formData.description.length}/500
            </span>
          </div>

          {/* Category */}
          <div className="form-group">
            <label htmlFor="category">Category *</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
            >
              <option value="General">General</option>
              <option value="Pasta">🍝 Pasta</option>
              <option value="Dessert">🍰 Dessert</option>
              <option value="Fast Food">🍔 Fast Food</option>
              <option value="Salad">🥗 Salad</option>
              <option value="Beverage">🥤 Beverage</option>
              <option value="Soup">🍲 Soup</option>
              <option value="Meat">🍖 Meat</option>
              <option value="Vegan">🌱 Vegan</option>
            </select>
          </div>

          {/* Recipe Meta Fields */}
          <div className="form-group-row">
            {/* Prep Time */}
            <div className="form-group">
              <label htmlFor="prepTime">⏱️ Prep Time (minutes) *</label>
              <input
                type="number"
                id="prepTime"
                name="prepTime"
                min="1"
                max="480"
                value={formData.prepTime}
                onChange={handleInputChange}
              />
            </div>

            {/* Difficulty */}
            <div className="form-group">
              <label htmlFor="difficulty">📊 Difficulty *</label>
              <select
                id="difficulty"
                name="difficulty"
                value={formData.difficulty}
                onChange={handleInputChange}
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>

            {/* Servings */}
            <div className="form-group">
              <label htmlFor="servings">👥 Servings *</label>
              <input
                type="number"
                id="servings"
                name="servings"
                min="1"
                max="20"
                value={formData.servings}
                onChange={handleInputChange}
              />
            </div>
          </div>

          {/* Image Upload */}
          <div className="form-group">
            <label htmlFor="image">Recipe Image *</label>
            <div className="image-upload-section">
              {imagePreview ? (
                <div className="image-preview">
                  <img src={imagePreview} alt="Preview" />
                  <button
                    type="button"
                    className="btn-remove-image"
                    onClick={() => {
                      setImageFile(null);
                      setImagePreview(null);
                    }}
                  >
                    ✕ Change Image
                  </button>
                </div>
              ) : (
                <label htmlFor="image" className="image-upload-box">
                  <div className="upload-icon">📷</div>
                  <p>Click to upload or drag and drop</p>
                  <span>PNG, JPG, GIF (Max 5MB)</span>
                  <input
                    type="file"
                    id="image"
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                </label>
              )}
              {errors.image && (
                <span className="error-message">{errors.image}</span>
              )}
            </div>
          </div>

          {/* Ingredients */}
          <div className="form-group">
            <label htmlFor="ingredients">Ingredients *</label>
            <textarea
              id="ingredients"
              name="ingredients"
              value={formData.ingredients}
              onChange={handleInputChange}
              placeholder="One ingredient per line&#10;Example:&#10;2 cups flour&#10;1 egg&#10;1 cup milk"
              rows="6"
              className={errors.ingredients ? 'textarea-error' : ''}
            />
            {errors.ingredients && (
              <span className="error-message">{errors.ingredients}</span>
            )}
            <span className="help-text">Enter one ingredient per line</span>
          </div>

          {/* Cooking Steps */}
          <div className="form-group">
            <label htmlFor="steps">Cooking Instructions *</label>
            <textarea
              id="steps"
              name="steps"
              value={formData.steps}
              onChange={handleInputChange}
              placeholder="One step per line&#10;Example:&#10;Preheat oven to 350F&#10;Mix dry ingredients&#10;Add wet ingredients"
              rows="8"
              className={errors.steps ? 'textarea-error' : ''}
            />
            {errors.steps && (
              <span className="error-message">{errors.steps}</span>
            )}
            <span className="help-text">Enter one step per line</span>
          </div>

          {/* Submit Buttons */}
          <div className="form-actions">
            <button
              type="submit"
              className="btn-submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner"></span> Creating...
                </>
              ) : (
                '✨ Publish Recipe'
              )}
            </button>
            <button
              type="button"
              className="btn-cancel"
              onClick={() => navigate(-1)}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateRecipe;
