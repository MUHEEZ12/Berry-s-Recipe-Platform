import { useParams, useNavigate, Link } from "react-router-dom";
import { useRecipes } from "../Context/RecipeContext";
import { useAuth } from "../Context/AuthContext";
import { useState, useEffect } from "react";
import { commentAPI, recipeAPI } from "../services/api";
import "./Recipedetails.css";

function RecipeDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getRecipeById, deleteRecipe } = useRecipes();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [recipe, setRecipe] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [servingScale, setServingScale] = useState(1);
  const [shareMenuOpen, setShareMenuOpen] = useState(false);

  // Scale ingredient quantities
  const scaleIngredient = (ingredient) => {
    if (servingScale === 1) return ingredient;
    
    // Try to extract quantity from ingredient string
    const quantityMatch = ingredient.match(/^([\d.\/\s]+)\s*(.*)$/);
    if (!quantityMatch) return ingredient;
    
    const quantityStr = quantityMatch[1].trim();
    const rest = quantityMatch[2];
    
    // Parse fraction or decimal
    let quantity = 0;
    if (quantityStr.includes('/')) {
      const [num, den] = quantityStr.split('/').map(Number);
      quantity = num / den;
    } else {
      quantity = parseFloat(quantityStr);
    }
    
    if (isNaN(quantity)) return ingredient;
    
    const scaled = quantity * servingScale;
    const scaledStr = scaled % 1 === 0 ? scaled.toFixed(0) : scaled.toFixed(1);
    
    return `${scaledStr} ${rest}`;
  };

  // Load recipe and comments
  useEffect(() => {
    const loadRecipe = async () => {
      try {
        setLoading(true);
        setError("");
        
        // First try local context
        const localRecipe = getRecipeById(id);
        if (localRecipe) {
          setRecipe(localRecipe);
          
          // Try to refresh from API in the background
          try {
            const response = await recipeAPI.getById(id);
            if (response.data?.data) {
              setRecipe(response.data.data);
              setComments(response.data.data.comments || []);
              setIsLiked(response.data.data.isLiked || false);
              setIsFavorited(response.data.data.isFavorited || false);
            }
          } catch (err) {
            // API fetch failed, continue with local recipe
            console.log("API fetch failed, using local recipe");
          }
        } else {
          // Try API if not in local context
          try {
            const response = await recipeAPI.getById(id);
            if (response.data?.data) {
              setRecipe(response.data.data);
              setComments(response.data.data.comments || []);
              setIsLiked(response.data.data.isLiked || false);
              setIsFavorited(response.data.data.isFavorited || false);
            } else {
              setError("Recipe not found");
            }
          } catch (apiErr) {
            console.error("API error:", apiErr);
            setError("Recipe not found or ID format invalid");
          }
        }
      } catch (err) {
        console.error("Load recipe error:", err);
        setError("Failed to load recipe");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadRecipe();
    }
  }, [id, getRecipeById]);

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !user) {
      setError("Please log in and enter a comment");
      return;
    }

    try {
      setCommentLoading(true);
      setError("");
      const response = await commentAPI.create(id, { text: newComment });
      setComments([response.data.data, ...comments]);
      setNewComment("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add comment");
    } finally {
      setCommentLoading(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) return;

    try {
      await commentAPI.delete(id, commentId);
      setComments(comments.filter((c) => c._id !== commentId));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete comment");
    }
  };

  const handleToggleLike = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    try {
      const response = await recipeAPI.like(id);
      setIsLiked(response.data.liked);
      if (recipe) {
        setRecipe({ ...recipe, likesCount: response.data.likesCount });
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to like recipe");
    }
  };

  const handleToggleFavorite = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    try {
      const response = await recipeAPI.favorite(id);
      setIsFavorited(response.data.favorited);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to favorite recipe");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this recipe?")) return;

    setLoading(true);
    setError("");
    const result = await deleteRecipe(recipe.id);
    if (result.ok) {
      navigate("/recipes");
    } else {
      setError(result.message || "Failed to delete");
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = (platform) => {
    const recipeUrl = window.location.href;
    const title = recipe.title;
    
    switch(platform) {
      case 'copy':
        navigator.clipboard.writeText(recipeUrl);
        alert('✅ Recipe link copied to clipboard!');
        setShareMenuOpen(false);
        break;
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(`Check out this recipe: ${title} ${recipeUrl}`)}`);
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Just found this amazing recipe: ${title}`)} ${encodeURIComponent(recipeUrl)}`);
        break;
      case 'email':
        window.location.href = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`Check out this recipe: ${recipeUrl}`)}`;
        break;
    }
  };

  const getDifficultyStars = (level) => {
    const levels = { easy: 1, medium: 2, hard: 3 };
    const stars = levels[level?.toLowerCase()] || 2;
    return '⭐'.repeat(stars);
  };

  if (loading && !recipe) {
    return <div className="recipe-details"><h2>Loading...</h2></div>;
  }

  if (!recipe) {
    return <h2 style={{ padding: "40px" }}>Recipe not found</h2>;
  }

  const isOwner = user && recipe.owner && String(user.id) === String(recipe.owner);

  return (
    <div className="recipe-details">
      {/* Hero Section */}
      <div className="recipe-hero">
        {recipe.images && recipe.images.length > 0 ? (
          <img src={recipe.images[0]} alt={recipe.title} className="recipe-hero-img" />
        ) : recipe.image ? (
          <img src={recipe.image} alt={recipe.title} className="recipe-hero-img" />
        ) : (
          <div className="recipe-hero-placeholder">No image</div>
        )}
      </div>

      <div className="recipe-container">
        {error && <div className="error-banner">{error}</div>}

        {/* Header */}
        <div className="recipe-header">
          <div className="recipe-title-section">
            <h1>{recipe.title}</h1>
            <p className="recipe-category">{recipe.category || 'General'}</p>
            <div style={{ marginTop: '8px', fontSize: '1.1rem' }}>
              {getDifficultyStars(recipe.difficulty)}
              <span style={{ marginLeft: '12px', fontSize: '0.9rem', color: '#666' }}>
                {recipe.difficulty ? recipe.difficulty.charAt(0).toUpperCase() + recipe.difficulty.slice(1) : 'Medium'} Difficulty
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            {user && (
              <>
                <button 
                  className={`action-btn like-btn ${isLiked ? 'active' : ''}`}
                  onClick={handleToggleLike}
                  title="Like this recipe"
                  style={{ padding: '10px 16px', fontSize: '1rem' }}
                >
                  ❤️ {recipe.likesCount || 0}
                </button>
                <button 
                  className={`action-btn fav-btn ${isFavorited ? 'active' : ''}`}
                  onClick={handleToggleFavorite}
                  title="Add to favorites"
                  style={{ padding: '10px 16px', fontSize: '1rem' }}
                >
                  ⭐ Save
                </button>
              </>
            )}
            
            <button 
              onClick={handlePrint}
              style={{
                padding: '10px 16px',
                background: '#3498db',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
              title="Print this recipe"
            >
              🖨️ Print
            </button>

            <div style={{ position: 'relative' }}>
              <button 
                onClick={() => setShareMenuOpen(!shareMenuOpen)}
                style={{
                  padding: '10px 16px',
                  background: '#2ecc71',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
                title="Share this recipe"
              >
                📤 Share
              </button>
              
              {shareMenuOpen && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  background: 'white',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  zIndex: 100,
                  minWidth: '150px',
                  marginTop: '4px'
                }}>
                  <button onClick={() => handleShare('copy')} style={{ width: '100%', padding: '10px', border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left', paddingLeft: '16px', borderBottom: '1px solid #eee', fontSize: '0.9rem' }}>📋 Copy Link</button>
                  <button onClick={() => handleShare('whatsapp')} style={{ width: '100%', padding: '10px', border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left', paddingLeft: '16px', borderBottom: '1px solid #eee', fontSize: '0.9rem' }}>💬 WhatsApp</button>
                  <button onClick={() => handleShare('twitter')} style={{ width: '100%', padding: '10px', border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left', paddingLeft: '16px', borderBottom: '1px solid #eee', fontSize: '0.9rem' }}>𝕏 Tweet</button>
                  <button onClick={() => handleShare('email')} style={{ width: '100%', padding: '10px', border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left', paddingLeft: '16px', fontSize: '0.9rem' }}>✉️ Email</button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="recipe-description">{recipe.description}</p>

        {/* Recipe Meta */}
        <div className="recipe-meta">
          <span>👁️ {recipe.viewCount || 0} views</span>
          <span>⏱️ Prep: {recipe.prepTime || 15} mins</span>
          <span>👨‍🍳 Cook: {recipe.cookTime || recipe.prepTime || 20} mins</span>
          <span>👥 Serves: {recipe.servings || 4}</span>
        </div>

        {/* Author Card */}
        {recipe.owner && (
          <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            padding: '20px',
            borderRadius: '12px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          }}>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '28px',
              fontWeight: 'bold'
            }}>
              {recipe.owner?.name?.charAt(0).toUpperCase() || '👨‍🍳'}
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.9 }}>By</p>
              <h3 style={{ margin: '4px 0 0 0', fontSize: '1.2rem' }}>{recipe.owner?.name || 'Chef'}</h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', opacity: 0.9 }}>
                🍳 Recipe Creator • 👥 {Math.floor(Math.random() * 500) + 100} followers
              </p>
            </div>
          </div>
        )}

        {/* Quick Tips */}
        {recipe.tips && recipe.tips.length > 0 && (
          <div style={{
            background: '#fff3cd',
            border: '1px solid #ffc107',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '24px'
          }}>
            <h3 style={{ margin: '0 0 12px 0', color: '#856404' }}>💡 Chef's Tips</h3>
            <ul style={{ margin: 0, paddingLeft: '20px', color: '#856404' }}>
              {recipe.tips.map((tip, idx) => (
                <li key={idx} style={{ marginBottom: '8px' }}>{tip}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Content */}
        <div className="recipe-content">
          {/* Serving Scaler */}
          <div className="serving-scaler">
            <div className="scaler-header">
              <h3>👥 Adjust Servings</h3>
              <p className="scaler-note">Change the number to scale ingredient quantities</p>
            </div>
            <div className="scaler-controls">
              <button 
                className="scaler-btn" 
                onClick={() => setServingScale(Math.max(0.5, servingScale - 0.5))}
              >
                −
              </button>
              <div className="scaler-display">
                <input 
                  type="number" 
                  min="0.5" 
                  step="0.5"
                  value={servingScale}
                  onChange={(e) => setServingScale(Math.max(0.5, parseFloat(e.target.value) || 1))}
                  className="scaler-input"
                />
                <span className="scaler-text">
                  {Math.round((recipe.servings || 4) * servingScale)} servings
                </span>
              </div>
              <button 
                className="scaler-btn" 
                onClick={() => setServingScale(servingScale + 0.5)}
              >
                +
              </button>
              <button 
                className="scaler-reset" 
                onClick={() => setServingScale(1)}
                title="Reset to original servings"
              >
                Reset
              </button>
            </div>
          </div>

          {/* Ingredients */}
          <section className="recipe-section">
            <h3>🥘 Ingredients</h3>
            <ul className="ingredients-list">
              {recipe.ingredients && recipe.ingredients.map((item, i) => (
                <li key={i}>
                  <span className="ingredient-check">✓</span>
                  {scaleIngredient(item)}
                </li>
              ))}
            </ul>
          </section>

          {/* Steps */}
          <section className="recipe-section">
            <h3>👨‍🍳 Cooking Steps</h3>
            <ol className="steps-list">
              {recipe.steps && recipe.steps.map((step, i) => (
                <li key={i}>
                  <span className="step-number">{i + 1}</span>
                  {step}
                </li>
              ))}
            </ol>
          </section>
        </div>

        {/* Owner Actions */}
        {isOwner && (
          <div className="owner-actions" style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
            <button 
              onClick={() => navigate(`/create-recipe?edit=${recipe.id}`)}
              style={{
                padding: '12px 20px',
                background: '#3498db',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '0.95rem'
              }}
            >
              ✏️ Edit Recipe
            </button>
            <button 
              onClick={handleDelete}
              disabled={loading}
              style={{
                padding: '12px 20px',
                background: '#e74c3c',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '0.95rem'
              }}
            >
              {loading ? "Deleting..." : "🗑️ Delete Recipe"}
            </button>
          </div>
        )}

        {/* Comments Section */}
        <section className="comments-section">
          <h3>💬 Comments ({comments.length})</h3>

          {user ? (
            <form onSubmit={handleAddComment} className="comment-form">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share your thoughts about this recipe..."
                rows="3"
                maxLength={500}
              ></textarea>
              <div className="comment-form-footer">
                <span className="char-count">{newComment.length}/500</span>
                <button 
                  type="submit"
                  disabled={commentLoading || !newComment.trim()}
                  className="btn-comment"
                >
                  {commentLoading ? "Posting..." : "Post Comment"}
                </button>
              </div>
            </form>
          ) : (
            <div className="comment-login-prompt">
              <p>Sign in to leave a comment</p>
              <Link to="/login" className="btn-login-comment">Login</Link>
            </div>
          )}

          <div className="comments-list">
            {comments.length === 0 ? (
              <p className="no-comments">No comments yet. Be the first to comment!</p>
            ) : (
              comments.map((comment) => (
                <div key={comment._id} className="comment-item">
                  <div className="comment-avatar">
                    {comment.author?.name?.charAt(0).toUpperCase() || '?'}
                  </div>
                  <div className="comment-content">
                    <div className="comment-header">
                      <p className="comment-author">{comment.author?.name || 'Anonymous'}</p>
                      <span className="comment-date">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="comment-text">{comment.text}</p>
                  </div>
                  {user && String(user.id) === String(comment.author?._id) && (
                    <button
                      onClick={() => handleDeleteComment(comment._id)}
                      className="btn-delete-comment"
                      title="Delete comment"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </section>

        {/* Recommended Recipes Section */}
        <section style={{ marginTop: '60px', paddingTop: '40px', borderTop: '3px solid #e0e0e0' }}>
          <h3 style={{ fontSize: '2rem', color: '#1a1a1a', marginBottom: '30px', fontWeight: 'bold' }}>
            🍳 More Delicious Recipes
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '24px'
          }}>
            {[
              {
                id: 'pasta-1',
                title: 'Creamy Pasta Carbonara',
                category: 'Pasta',
                difficulty: 'Medium',
                prepTime: 15,
                image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=500&h=400&fit=crop',
                description: 'Classic Italian pasta with creamy sauce',
                likesCount: 245,
                viewCount: 1890
              },
              {
                id: 'curry-1',
                title: 'Thai Green Curry',
                category: 'Asian',
                difficulty: 'Medium',
                prepTime: 20,
                image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=500&h=400&fit=crop',
                description: 'Spicy and aromatic Thai curry',
                likesCount: 312,
                viewCount: 2145
              },
              {
                id: 'chicken-1',
                title: 'Crispy Fried Chicken',
                category: 'Meat',
                difficulty: 'Easy',
                prepTime: 25,
                image: 'https://images.unsplash.com/photo-1521305916504-4a1121188589?w=500&h=400&fit=crop',
                description: 'Golden and crispy fried chicken',
                likesCount: 456,
                viewCount: 3201
              },
              {
                id: 'stir-fry-1',
                title: 'Vegetable Stir Fry',
                category: 'Vegan',
                difficulty: 'Easy',
                prepTime: 12,
                image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&h=400&fit=crop',
                description: 'Quick and healthy stir fry',
                likesCount: 189,
                viewCount: 1456
              },
              {
                id: 'pizza-1',
                title: 'Homemade Margherita Pizza',
                category: 'Italian',
                difficulty: 'Medium',
                prepTime: 30,
                image: 'https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=500&h=400&fit=crop',
                description: 'Fresh mozzarella and basil pizza',
                likesCount: 378,
                viewCount: 2890
              },
              {
                id: 'sushi-1',
                title: 'Rainbow Sushi Roll',
                category: 'Asian',
                difficulty: 'Hard',
                prepTime: 45,
                image: 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=500&h=400&fit=crop',
                description: 'Beautiful rainbow sushi roll',
                likesCount: 267,
                viewCount: 2210
              },
              {
                id: 'burger-1',
                title: 'Gourmet Beef Burger',
                category: 'Meat',
                difficulty: 'Easy',
                prepTime: 20,
                image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&h=400&fit=crop',
                description: 'Juicy beef burger with special sauce',
                likesCount: 423,
                viewCount: 2567
              },
              {
                id: 'salad-5',
                title: 'Chocolate Berry Salad',
                category: 'Dessert',
                difficulty: 'Easy',
                prepTime: 10,
                image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&h=400&fit=crop',
                description: 'Decadent chocolate and berries',
                likesCount: 334,
                viewCount: 1876
              }
            ].map((rec) => (
              <div
                key={rec.id}
                onClick={() => navigate(`/recipes/${rec.id}`)}
                style={{
                  background: 'white',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.08)',
                  transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                  cursor: 'pointer',
                  position: 'relative'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-12px) scale(1.02)';
                  e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.08)';
                }}
              >
                <div style={{ position: 'relative', height: '200px', overflow: 'hidden' }}>
                  <img
                    src={rec.image}
                    alt={rec.title}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transition: 'transform 0.5s'
                    }}
                    onMouseEnter={(e) => e.target.style.transform = 'scale(1.12)'}
                    onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                  />
                  <span style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    background: 'linear-gradient(135deg, #ff6b6b 0%, #ff8787 100%)',
                    color: 'white',
                    padding: '6px 14px',
                    borderRadius: '20px',
                    fontSize: '0.8rem',
                    fontWeight: '700'
                  }}>
                    {rec.category}
                  </span>
                </div>
                <div style={{ padding: '18px' }}>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#1a1a1a', margin: '0 0 8px 0' }}>
                    {rec.title}
                  </h4>
                  <p style={{ fontSize: '0.9rem', color: '#666', margin: '0 0 12px 0', lineHeight: 1.5 }}>
                    {rec.description}
                  </p>
                  <div style={{ display: 'flex', gap: '12px', fontSize: '0.85rem', color: '#888', marginBottom: '12px' }}>
                    <span>⏱️ {rec.prepTime}min</span>
                    <span>❤️ {rec.likesCount}</span>
                    <span>👁️ {rec.viewCount}</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/recipes/${rec.id}`);
                    }}
                    style={{
                      width: '100%',
                      padding: '10px 16px',
                      background: 'linear-gradient(135deg, #ff6b6b 0%, #ff8787 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: '600',
                      fontSize: '0.9rem',
                      transition: 'all 0.3s'
                    }}
                  >
                    👁️ View Recipe
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export default RecipeDetails;

