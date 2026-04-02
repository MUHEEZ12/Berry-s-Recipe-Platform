import React, { useState, useEffect } from 'react';
import { useAuth } from '../Context/AuthContext';
import { useRecipes } from '../Context/RecipeContext';
import { Button } from '../components/shared/Button';
import { RecipeCard } from '../components/shared/Card';
import { Modal } from '../components/shared/Modal';
import { useFetchRecipes } from '../hooks/useFetchRecipes';
import { useRecipeActions } from '../hooks/useRecipeActions';
import './RecipesPage.css';

export default function RecipesPage() {
  const { user } = useAuth();
  const { category, setCategory } = useRecipes();
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(1);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [showSortModal, setShowSortModal] = useState(false);

  const { recipes, loading, pagination, refetch } = useFetchRecipes(page, 12, search, category, sortBy);
  const { deleteRecipe, toggleLike, toggleFavorite } = useRecipeActions();

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this recipe?')) return;
    const result = await deleteRecipe(id);
    if (result.ok) {
      refetch();
    }
  };

  const handleLike = async (id) => {
    await toggleLike(id);
    refetch();
  };

  const handleFavorite = async (id) => {
    await toggleFavorite(id);
    refetch();
  };

  const categories = ['all', 'Pasta', 'Dessert', 'Fast Food', 'Salad', 'Beverage'];

  return (
    <div className="recipes-page">
      {/* Hero Section */}
      <div className="recipes-hero">
        <h1>Discover & Share Recipes</h1>
        <p>Explore thousands of recipes from around the world</p>
      </div>

      {/* Search & Filter Controls */}
      <div className="recipes-controls-wrapper">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search recipes by name, ingredient, or cuisine..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
          <span className="search-icon">🔍</span>
        </div>

        <div className="filters-row">
          {/* Category Pills */}
          <div className="category-filters">
            <span className="filter-label">Category:</span>
            <div className="category-pills">
              {categories.map((cat) => (
                <button
                  key={cat}
                  className={`pill ${category === cat ? 'active' : ''}`}
                  onClick={() => {
                    setCategory(cat);
                    setPage(1);
                  }}
                >
                  {cat === 'all' ? '🍓 All' : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Sort button - opens modal */}
          <button 
            className="sort-button"
            onClick={() => setShowSortModal(true)}
          >
            <span>📊</span>
            <span>
              {sortBy === 'newest' ? 'Newest' : sortBy === 'trending' ? 'Trending' : sortBy === 'mostLiked' ? 'Most Liked' : 'Oldest'}
            </span>
            <span>▼</span>
          </button>

          {/* Sort Modal */}
          {showSortModal && (
            <>
              <div className="modal-overlay" onClick={() => setShowSortModal(false)} />
              <div className="sort-modal">
                <div className="sort-modal-header">Sort by</div>
                <div className="sort-options">
                  {[
                    { value: 'newest', label: '📅 Newest First' },
                    { value: 'trending', label: '🔥 Trending' },
                    { value: 'mostLiked', label: '❤️ Most Liked' },
                    { value: 'oldest', label: '📆 Oldest First' }
                  ].map(option => (
                    <button
                      key={option.value}
                      className={`sort-option ${sortBy === option.value ? 'active' : ''}`}
                      onClick={() => {
                        setSortBy(option.value);
                        setShowSortModal(false);
                      }}
                    >
                      {option.label}
                      {sortBy === option.value && <span className="checkmark">✓</span>}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Results count */}
        <div className="results-info">
          <span className="recipe-count">
            {pagination.total || recipes.length} 
            {pagination.total === 1 ? ' recipe' : ' recipes'} found
          </span>
        </div>
      </div>

      {/* Recipes Grid */}
      {loading ? (
        <div className="recipes-skeleton">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="recipe-skeleton">
              <div className="skeleton" style={{ height: '200px' }}></div>
              <div className="skeleton-content">
                <div className="skeleton" style={{ height: '20px', marginBottom: '10px' }}></div>
                <div className="skeleton" style={{ height: '16px' }}></div>
              </div>
            </div>
          ))}
        </div>
      ) : recipes.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🍴</div>
          <h3>No recipes found</h3>
          <p>Try adjusting your search or filters</p>
        </div>
      ) : (
        <>
          <div className="recipes-list">
            {recipes.map((recipe) => (
              <div key={recipe._id || recipe.id} className="recipe-row-card">
                {/* Image Section - Left */}
                <div className="row-image">
                  <img 
                    src={recipe.image || recipe.images?.[0] || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="220"%3E%3Crect fill="%23e5e7eb" width="300" height="220"/%3E%3Ctext x="150" y="110" font-size="14" text-anchor="middle" dominant-baseline="middle" fill="%239ca3af"%3ENo Image%3C/text%3E%3C/svg%3E'} 
                    alt={recipe.title}
                    onError={(e) => { e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="220"%3E%3Crect fill="%23e5e7eb" width="300" height="220"/%3E%3Ctext x="150" y="110" font-size="14" text-anchor="middle" dominant-baseline="middle" fill="%239ca3af"%3ENo Image%3C/text%3E%3C/svg%3E'; }}
                  />
                  {recipe.category && <span className="row-category-badge">{recipe.category}</span>}
                </div>

                {/* Content Section - Right */}
                <div className="row-content">
                  <h3 className="row-title">{recipe.title}</h3>
                  <p className="row-description">{recipe.description || 'No description available'}</p>

                  {/* Metadata Row */}
                  <div className="row-metadata">
                    {recipe.difficulty && <span className={`difficulty-badge difficulty-${recipe.difficulty}`}>{recipe.difficulty}</span>}
                    {recipe.rating && <span className="rating">⭐ {recipe.rating}</span>}
                    {recipe.prepTime && <span>⏱️ {recipe.prepTime}</span>}
                    {recipe.servings && <span>👥 {recipe.servings} servings</span>}
                  </div>

                  {/* Stats Row */}
                  <div className="row-stats">
                    <span>👁 {recipe.viewCount || 0} views</span>
                    <span>❤️ {recipe.likesCount || 0} likes</span>
                    <span>⭐ {recipe.favoritedBy?.length || 0} favorites</span>
                  </div>

                  {/* Action Buttons */}
                  <div className="row-actions">
                    {user && (
                      <>
                        <button 
                          className={`row-btn like-btn ${recipe.likedBy?.includes(user.id) ? 'liked' : ''}`}
                          onClick={() => handleLike(recipe._id || recipe.id)}
                        >
                          {recipe.likedBy?.includes(user.id) ? '❤️ Liked' : '🤍 Like'}
                        </button>
                        <button 
                          className={`row-btn save-btn ${recipe.favoritedBy?.includes(user.id) ? 'saved' : ''}`}
                          onClick={() => handleFavorite(recipe._id || recipe.id)}
                        >
                          {recipe.favoritedBy?.includes(user.id) ? '⭐ Saved' : '☆ Save'}
                        </button>
                      </>
                    )}
                    {user && user.id === recipe.owner?._id && (
                      <button 
                        className="row-btn delete-btn"
                        onClick={() => handleDelete(recipe._id || recipe.id)}
                      >
                        🗑️ Delete
                      </button>
                    )}
                    <button 
                      className="row-btn view-btn"
                      onClick={() => setSelectedRecipe(recipe)}
                    >
                      👁️ View Recipe
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="pagination">
              <Button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                variant="secondary"
              >
                ← Previous
              </Button>
              <span>
                Page {page} of {pagination.pages}
              </span>
              <Button
                onClick={() => setPage(Math.min(pagination.pages, page + 1))}
                disabled={page === pagination.pages}
                variant="secondary"
              >
                Next →
              </Button>
            </div>
          )}
        </>
      )}

      {/* Recipe Details Modal */}
      {selectedRecipe && (
        <Modal isOpen={true} onClose={() => setSelectedRecipe(null)} title={selectedRecipe.title}>
          <div className="modal-recipe-detail">
            <img src={selectedRecipe.images?.[0]} alt={selectedRecipe.title} />
            <h3>{selectedRecipe.title}</h3>
            <p>{selectedRecipe.description}</p>

            <h4>Ingredients:</h4>
            <ul>
              {selectedRecipe.ingredients?.map((ing, i) => (
                <li key={i}>{ing}</li>
              ))}
            </ul>

            <h4>Steps:</h4>
            <ol>
              {selectedRecipe.steps?.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
          </div>
        </Modal>
      )}
    </div>
  );
}
