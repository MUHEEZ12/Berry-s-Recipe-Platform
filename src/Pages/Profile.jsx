import React, { useState, useEffect } from 'react';
import { useAuth } from '../Context/AuthContext';
import { useRecipes } from '../Context/RecipeContext';
import { useNavigate } from 'react-router-dom';
import { showToast } from '../utils/helpers';
import './Profile.css';

function Profile() {
  const { user } = useAuth();
  const { recipes } = useRecipes();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('stats');
  const [profileImage, setProfileImage] = useState(() => {
    try {
      return localStorage.getItem(`profileImage_${user?.id}`) || null;
    } catch {
      return null;
    }
  });
  const [uploading, setUploading] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [loadingFavorites, setLoadingFavorites] = useState(false);

  // Load favorites on mount for stats display
  useEffect(() => {
    if (user) {
      fetchFavorites();
    }
  }, [user]);

  // Also fetch favorites when switching to favorites tab
  useEffect(() => {
    if (activeTab === 'favorites' && user) {
      fetchFavorites();
    }
  }, [activeTab, user]);

  const fetchFavorites = async () => {
    try {
      setLoadingFavorites(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/recipes/user/favorites`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.ok) {
        setFavorites(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch favorites:', error);
      showToast('❌ Failed to load favorites', 'error');
    } finally {
      setLoadingFavorites(false);
    }
  };

  // Handle profile picture upload
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showToast('❌ Please upload an image file', 'error');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showToast('❌ File size must be less than 5MB', 'error');
      return;
    }

    try {
      setUploading(true);
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageData = event.target?.result;
        setProfileImage(imageData);
        localStorage.setItem(`profileImage_${user?.id}`, imageData);
        showToast('✅ Profile picture updated!', 'success');
      };
      reader.readAsDataURL(file);
    } catch (error) {
      showToast('❌ Failed to upload image', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setProfileImage(null);
    localStorage.removeItem(`profileImage_${user?.id}`);
    showToast('🗑️ Profile picture removed', 'success');
  };

  if (!user) {
    return (
      <div className="profile-page">
        <div className="profile-container">
          <p>Please log in to view your profile.</p>
          <button onClick={() => navigate('/login')} className="btn-primary">
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // Get user's recipes
  const userRecipes = recipes.filter((r) => String(r.owner) === String(user.id) || (r.owner && String(r.owner._id) === String(user.id))) || [];
  const totalLikes = userRecipes.reduce((sum, r) => sum + (r.likesCount || 0), 0);
  const totalViews = userRecipes.reduce((sum, r) => sum + (r.viewCount || 0), 0);

  return (
    <div className="profile-page">
      <div className="profile-container">
        {/* Profile Header */}
        <div className="profile-header">
          <div className="profile-cover"></div>
          <div className="profile-info">
            <div className="profile-avatar-container">
              <div className="profile-avatar-lg">
                {profileImage ? (
                  <img src={profileImage} alt={user.name} className="profile-avatar-img" />
                ) : (
                  user.name?.charAt(0).toUpperCase() || 'U'
                )}
              </div>
              <div className="avatar-upload-overlay">
                <label className="upload-label">
                  📷 Change Photo
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploading}
                    style={{ display: 'none' }}
                  />
                </label>
                {profileImage && (
                  <button
                    className="remove-photo-btn"
                    onClick={handleRemoveImage}
                    title="Remove profile picture"
                  >
                    🗑️
                  </button>
                )}
              </div>
            </div>
            <div className="profile-details">
              <h1 className="profile-name">{user.name || 'User'}</h1>
              <p className="profile-email">{user.email}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="profile-tabs">
          <button 
            className={`tab-btn ${activeTab === 'stats' ? 'active' : ''}`}
            onClick={() => setActiveTab('stats')}
          >
            📊 Statistics
          </button>
          <button 
            className={`tab-btn ${activeTab === 'recipes' ? 'active' : ''}`}
            onClick={() => setActiveTab('recipes')}
          >
            📝 My Recipes
          </button>
          <button 
            className={`tab-btn ${activeTab === 'favorites' ? 'active' : ''}`}
            onClick={() => setActiveTab('favorites')}
          >
            ⭐ Favorites
          </button>
        </div>

        {/* Stats Tab */}
        {activeTab === 'stats' && (
          <div className="profile-stats">
            <div className="stat-card">
              <div className="stat-icon">📝</div>
              <div className="stat-content">
                <p className="stat-number">{userRecipes.length}</p>
                <p className="stat-label">Recipes</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">❤️</div>
              <div className="stat-content">
                <p className="stat-number">{totalLikes}</p>
                <p className="stat-label">Likes</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">⭐</div>
              <div className="stat-content">
                <p className="stat-number">{favorites.length}</p>
                <p className="stat-label">Favorites</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">👁️</div>
              <div className="stat-content">
                <p className="stat-number">{totalViews}</p>
                <p className="stat-label">Views</p>
              </div>
            </div>
          </div>
        )}

        {/* Recipes Tab */}
        {activeTab === 'recipes' && (
          <div className="profile-recipes">
            {userRecipes.length === 0 ? (
              <div className="empty-state">
                <p>No recipes yet. Create your first recipe!</p>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <button 
                    onClick={() => navigate('/create-recipe')}
                    className="btn-primary"
                  >
                    ➕ Create Recipe
                  </button>
                  <button 
                    onClick={() => navigate('/recipes')}
                    className="btn-primary"
                    style={{ background: '#f39c12' }}
                  >
                    🔍 Browse All Recipes
                  </button>
                </div>
              </div>
            ) : (
              <div className="recipes-list">
                {userRecipes.map((recipe) => (
                  <div key={recipe.id} className="recipe-item">
                    <img 
                      src={recipe.images?.[0] || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23e5e7eb" width="100" height="100"/%3E%3Ctext x="50" y="50" font-size="14" text-anchor="middle" dominant-baseline="middle" fill="%239ca3af"%3ENo Image%3C/text%3E%3C/svg%3E'} 
                      alt={recipe.title}
                      className="recipe-thumbnail"
                    />
                    <div className="recipe-info">
                      <h3>{recipe.title}</h3>
                      <p>{recipe.description}</p>
                      <div className="recipe-stats">
                        <span>❤️ {recipe.likesCount || 0}</span>
                        <span>👁️ {recipe.viewCount || 0}</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => navigate(`/recipes/${recipe.id}`)}
                      className="btn-view"
                    >
                      View
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Favorites Tab */}
        {activeTab === 'favorites' && (
          <div className="profile-favorites">
            {loadingFavorites ? (
              <div className="empty-state">
                <p>Loading favorites...</p>
              </div>
            ) : favorites.length === 0 ? (
              <div className="empty-state">
                <p>No favorites yet. Mark recipes as favorites to see them here!</p>
                <button 
                  onClick={() => navigate('/recipes')}
                  className="btn-primary"
                  style={{ background: '#f39c12' }}
                >
                  🔍 Browse & Save Favorites
                </button>
              </div>
            ) : (
              <div className="recipes-list">
                {favorites.map((recipe) => (
                  <div key={recipe._id || recipe.id} className="recipe-item">
                    <img 
                      src={recipe.images?.[0] || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23e5e7eb" width="100" height="100"/%3E%3Ctext x="50" y="50" font-size="14" text-anchor="middle" dominant-baseline="middle" fill="%239ca3af"%3ENo Image%3C/text%3E%3C/svg%3E'} 
                      alt={recipe.title}
                      className="recipe-thumbnail"
                    />
                    <div className="recipe-info">
                      <h3>{recipe.title}</h3>
                      <p>{recipe.description}</p>
                      <div className="recipe-stats">
                        <span>❤️ {recipe.likesCount || 0}</span>
                        <span>👁️ {recipe.viewCount || 0}</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => navigate(`/recipes/${recipe._id || recipe.id}`)}
                      className="btn-view"
                    >
                      View
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;
