import React, { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useRecipes } from "../Context/RecipeContext";
import { useAuth } from "../Context/AuthContext";
import { recipeAPI } from "../services/api";
import { showToast } from "../utils/helpers";
import "./Home.css";

const sliderImages = [
  "https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=1600",
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1600",
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1600",
];

// Minimal fallback - will use real recipesList from backend when available
const sampleRecipes = [];

function Home() {
  const { recipes, category, loading } = useRecipes();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);
  const [openId, setOpenId] = useState(null);
  const [recipesList, setRecipesList] = useState(recipes);

  // Update recipes when they change
  useEffect(() => {
    setRecipesList(recipes);
  }, [recipes]);

  // Filter recipes by category
  const filteredRecipes = useMemo(() => {
    // Use recipesList which is the updated state, not recipes from context
    let allRecipes = recipesList && recipesList.length > 0 ? recipesList : sampleRecipes;
    
    if (!Array.isArray(allRecipes)) {
      return sampleRecipes.slice(0, 12);
    }

    // Filter out test/CI recipes by common patterns (case-insensitive)
    const testPattern = /\b(test|ci|automated testing|created by ci)\b|recipe\s*\d{5,}/i;

    const visible = allRecipes.filter(r => {
      const combined = `${r.title || ''} ${r.description || ''}`;
      return !testPattern.test(combined);
    });

    // If filtering removes everything, fall back to curated sample recipes
    if ((!visible || visible.length === 0)) {
      return sampleRecipes.slice(0, 12);
    }

    if (category === 'all' || !category) {
      return visible.slice(0, 12);
    }

    const byCategory = visible.filter(r => r.category === category);
    return (byCategory.length ? byCategory.slice(0, 12) : sampleRecipes.slice(0, 12));
  }, [recipesList, category]);

  /* SLIDER */
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) =>
        prev === sliderImages.length - 1 ? 0 : prev + 1
      );
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const handleLike = async (id) => {
    if (!user) {
      showToast('Please log in to like recipes', 'info');
      navigate("/login");
      return;
    }
    
    try {
      const response = await recipeAPI.like(id);
      
      if (response.data?.ok) {
        // Update optimistically first
        setRecipesList(prev => prev.map(recipe => {
          if ((recipe.id === id || recipe._id === id)) {
            const isNowLiked = response.data.liked;
            return {
              ...recipe,
              likesCount: response.data.likesCount || recipe.likesCount,
              likedBy: isNowLiked 
                ? [...(recipe.likedBy || []), user.id]
                : (recipe.likedBy || []).filter(uid => String(uid) !== String(user.id))
            };
          }
          return recipe;
        }));
        showToast(response.data.message || 'Updated successfully!', 'success');
      } else {
        showToast(response.data?.message || 'Failed to like recipe', 'error');
      }
    } catch (err) {
      console.error('Like error:', err);
      
      if (err.response?.status === 401) {
        showToast('Your session expired. Please log in again.', 'error');
        navigate("/login");
      } else {
        const message = err.response?.data?.message || err.message || 'Failed to like recipe';
        showToast(message, 'error');
      }
    }
  };

  const handleFavorite = async (id) => {
    if (!user) {
      showToast('Please log in to save recipes', 'info');
      navigate("/login");
      return;
    }
    
    try {
      const response = await recipeAPI.favorite(id);
      
      if (response.data?.ok) {
        // Update optimistically first
        setRecipesList(prev => prev.map(recipe => {
          if ((recipe.id === id || recipe._id === id)) {
            const isNowFavorited = response.data.favorited;
            return {
              ...recipe,
              favoritedBy: isNowFavorited 
                ? [...(recipe.favoritedBy || []), user.id]
                : (recipe.favoritedBy || []).filter(uid => String(uid) !== String(user.id))
            };
          }
          return recipe;
        }));
        showToast(response.data.message || 'Updated successfully!', 'success');
      } else {
        showToast(response.data?.message || 'Failed to save recipe', 'error');
      }
    } catch (err) {
      console.error('Favorite error:', err);
      
      if (err.response?.status === 401) {
        showToast('Your session expired. Please log in again.', 'error');
        navigate("/login");
      } else {
        const message = err.response?.data?.message || err.message || 'Failed to save recipe';
        showToast(message, 'error');
      }
    }
  };

  return (
    <div className="home">
      {/* SLIDER */}
      <div className="slider">
        {sliderImages.map((img, index) => (
          <img
            key={index}
            src={img}
            className={index === current ? "slide active" : "slide"}
          />
        ))}
        <div className="slider-text">
          <h1>Berry’s Recipe Platform</h1>
          <p>Discover • Cook • Share</p>
          <Link to="/create-recipe" className="cta-btn">Share Your Recipe</Link>
        </div>
      </div>

      {/* FEATURED RECIPE SECTION */}
      <section className="featured-section">
        <div className="featured-content">
          <div className="featured-text">
            <span className="featured-badge">⭐ FEATURED RECIPE</span>
            <h2>{filteredRecipes[0]?.title || "Strawberry Lemon Dessert Salad"}</h2>
            <p>{filteredRecipes[0]?.description || "Fresh strawberries, lemon zest, and a hint of mint tossed with honey-yogurt dressing — light, bright, and perfect for summer."}</p>
            <div className="featured-meta">
              <span>⏱️ {filteredRecipes[0]?.prepTime || 30} mins</span>
              <span>👥 {filteredRecipes[0]?.servings || 4} servings</span>
              <span>📊 {filteredRecipes[0]?.difficulty || 'Easy'}</span>
            </div>
            <Link to="/recipes" className="featured-button">Explore Now →</Link>
          </div>
          <div className="featured-image">
            <img src={filteredRecipes[0]?.image || filteredRecipes[0]?.images?.[0] || "https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=800&h=600&fit=crop"} alt="Featured Recipe" />
          </div>
        </div>
      </section>

      {/* STATISTICS SECTION */}
      <section className="stats-section">
        <div className="stats-container">
          <div className="stat-card">
            <div className="stat-number">10K+</div>
            <div className="stat-label">Recipes</div>
            <div className="stat-description">Delicious dishes</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">50K+</div>
            <div className="stat-label">Users</div>
            <div className="stat-description">Active community</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">4.8★</div>
            <div className="stat-label">Rating</div>
            <div className="stat-description">User satisfaction</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">100K+</div>
            <div className="stat-label">Reviews</div>
            <div className="stat-description">Community feedback</div>
          </div>
        </div>
      </section>

      {/* RECIPES */}
      <section className="recipe-section">
        <h2>Recipes</h2>

        <div className="recipe-grid">
          {!loading && filteredRecipes.length === 0 && (
            <p className="empty-text">No recipes found. Be the first to create one! 🍳</p>
          )}

          {loading && (
            <p className="empty-text">Loading recipes... ⏳</p>
          )}

          {filteredRecipes.map((recipe) => (
            <div
              key={recipe.id}
              className="recipe-card"
              onClick={() =>
                setOpenId(openId === recipe.id ? null : recipe.id)
              }
            >
              <img src={recipe.image || recipe.images?.[0] || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="200"%3E%3Crect fill="%23e5e7eb" width="300" height="200"/%3E%3Ctext x="150" y="100" font-size="16" text-anchor="middle" dominant-baseline="middle" fill="%239ca3af"%3ENo Image%3C/text%3E%3C/svg%3E'} alt={recipe.title} onError={(e) => { e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="200"%3E%3Crect fill="%23e5e7eb" width="300" height="200"/%3E%3Ctext x="150" y="100" font-size="16" text-anchor="middle" dominant-baseline="middle" fill="%239ca3af"%3ENo Image%3C/text%3E%3C/svg%3E'; }} />

              <div className="card-content">
                <h3>
                  {recipe.title}
                  {recipe.createdAt && (Date.now() - new Date(recipe.createdAt).getTime()) < 86400000 && (
                    <span className="badge">✨ New</span>
                  )}
                </h3>
                <p>{recipe.description || 'No description'}</p>
                
                {/* Card Metadata */}
                <div className="card-meta">
                  <div className="card-meta-item">
                    <span className={`difficulty-badge difficulty-${recipe.difficulty || 'easy'}`}>
                      {recipe.difficulty ? recipe.difficulty.charAt(0).toUpperCase() + recipe.difficulty.slice(1) : 'Easy'}
                    </span>
                  </div>
                  <div className="card-meta-item rating">
                    <span className="star">★</span>
                    <span>{recipe.rating || '4.8'}</span>
                  </div>
                  <div className="card-meta-item">
                    ⏱️ {recipe.prepTime || '15 min'}
                  </div>
                  <div className="card-meta-item">
                    👥 {recipe.servings || '4'}
                  </div>
                </div>
                
                <div style={{ fontSize: '0.85rem', color: '#888', marginTop: '8px', display: 'flex', gap: '16px' }}>
                  <span>👁 {recipe.viewCount || 0}</span>
                  <span>❤️ {recipe.likesCount || 0}</span>
                  <span>⭐ {recipe.favoritedBy?.length || 0}</span>
                </div>

                <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                  {user && (
                    <>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLike(recipe.id || recipe._id);
                        }}
                        style={{
                          padding: '8px 12px',
                          background: recipe.likedBy?.includes(user.id) ? '#ff6b6b' : '#f0f0f0',
                          color: recipe.likedBy?.includes(user.id) ? 'white' : '#666',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '0.85rem',
                          fontWeight: '600',
                          transition: 'all 0.3s'
                        }}
                        title={recipe.likedBy?.includes(user.id) ? 'Unlike' : 'Like'}
                      >
                        {recipe.likedBy?.includes(user.id) ? '❤️ Liked' : '🤍 Like'}
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFavorite(recipe.id || recipe._id);
                        }}
                        style={{
                          padding: '8px 12px',
                          background: recipe.favoritedBy?.includes(user.id) ? '#f39c12' : '#f0f0f0',
                          color: recipe.favoritedBy?.includes(user.id) ? 'white' : '#666',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '0.85rem',
                          fontWeight: '600',
                          transition: 'all 0.3s'
                        }}
                        title={recipe.favoritedBy?.includes(user.id) ? 'Remove from favorites' : 'Add to favorites'}
                      >
                        {recipe.favoritedBy?.includes(user.id) ? '⭐ Saved' : '☆ Save'}
                      </button>
                    </>
                  )}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/recipes/${recipe.id || recipe._id}`);
                    }}
                    style={{
                      padding: '8px 12px',
                      background: '#27ae60',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      fontWeight: '600',
                      transition: 'all 0.3s',
                      marginLeft: 'auto'
                    }}
                    title="View recipe details"
                  >
                    👁️ View
                  </button>
                </div>
              </div>

              {openId === recipe.id && (
                <div className="recipe-expanded">
                  <h4>📝 Ingredients ({recipe.ingredients?.length || 0})</h4>
                  <ul>
                    {Array.isArray(recipe.ingredients) && recipe.ingredients.length > 0 ? (
                      recipe.ingredients.map((i, idx) => (
                        <li key={idx}>{i}</li>
                      ))
                    ) : (
                      <li>No ingredients listed</li>
                    )}
                  </ul>

                  <h4>👨‍🍳 Cooking Steps ({recipe.steps?.length || 0})</h4>
                  <ol>
                    {Array.isArray(recipe.steps) && recipe.steps.length > 0 ? (
                      recipe.steps.map((s, idx) => (
                        <li key={idx}>{s}</li>
                      ))
                    ) : (
                      <li>No steps listed</li>
                    )}
                  </ol>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Recommended Recipes Section */}
      <section style={{ padding: '80px 20px', background: 'linear-gradient(135deg, #f8f9ff 0%, #f5f7fa 100%)' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: '2.8rem',
            color: '#1a1a1a',
            marginBottom: '60px',
            textAlign: 'center',
            fontWeight: '900',
            background: 'linear-gradient(135deg, #ff6b6b 0%, #4ecdc4 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            🍳 Chef's Recommendations
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '24px'
          }}>
            {recipesList && recipesList.length > 0 ? (
              recipesList.slice(0, 6).map((rec) => (
                <div
                  key={rec.id || rec._id}
                  style={{
                    background: 'white',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.08)',
                    transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                    cursor: 'pointer',
                    position: 'relative'
                  }}
                  onClick={() => navigate(`/recipes/${rec.id || rec._id}`)}
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
                      src={rec.image || rec.images?.[0] || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="200"%3E%3Crect fill="%23e5e7eb" width="300" height="200"/%3E%3Ctext x="150" y="100" font-size="14" text-anchor="middle" dominant-baseline="middle" fill="%239ca3af"%3ENo Image%3C/text%3E%3C/svg%3E'}
                      alt={rec.title}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.5s'
                      }}
                      onMouseEnter={(e) => e.target.style.transform = 'scale(1.12)'}
                      onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                      onError={(e) => { e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="200"%3E%3Crect fill="%23e5e7eb" width="300" height="200"/%3E%3Ctext x="150" y="100" font-size="14" text-anchor="middle" dominant-baseline="middle" fill="%239ca3af"%3EImage Failed%3C/text%3E%3C/svg%3E'; }}
                    />
                  </div>
                  <div style={{ padding: '16px' }}>
                    <h4 style={{
                      margin: '0 0 8px 0',
                      fontSize: '1.1rem',
                      fontWeight: '600',
                      color: '#1a1a1a'
                    }} title={rec.title}>
                      {rec.title.substring(0, 40)}...
                    </h4>
                    <p style={{
                      margin: '8px 0',
                      fontSize: '0.9rem',
                      color: '#666',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      minHeight: '2.4em'
                    }}>
                      {rec.description || 'No description'}
                    </p>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginTop: '12px',
                      fontSize: '0.85rem',
                      color: '#888'
                    }}>
                      <span>⭐ {rec.rating || '4.8'}</span>
                      <span>❤️ {rec.likesCount || 0}</span>
                      <span>👁 {rec.viewCount || 0}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px', color: '#999' }}>
                <p>No recipes yet. Create one to get started! 👨‍🍳</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
