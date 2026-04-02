import './Card.css';

export const Card = ({ children, className = '', elevated = false, ...props }) => {
  return (
    <div className={`card ${elevated ? 'card-elevated' : ''} ${className}`} {...props}>
      {children}
    </div>
  );
};

export const RecipeCard = ({ recipe, onLike, onFavorite, onDelete, isOwner }) => {
  return (
    <div className="recipe-card">
      {/* Image */}
      <div className="recipe-card-image">
        <img src={recipe.images?.[0] || '/placeholder.jpg'} alt={recipe.title} />
      </div>

      {/* Content */}
      <div className="recipe-card-content">
        {recipe.category && <span className="recipe-card-category">{recipe.category}</span>}
        <h3 className="recipe-card-title">{recipe.title}</h3>
        
        {/* Action Row - Like, Save, Delete */}
        <div className="recipe-card-actions">
          <button 
            className="action-icon-btn like" 
            onClick={(e) => { e.stopPropagation(); onLike(); }}
            title="Like"
          >
            ♥
          </button>
          <button 
            className="action-icon-btn save" 
            onClick={(e) => { e.stopPropagation(); onFavorite(); }}
            title="Save"
          >
            ⭐
          </button>
          {isOwner && (
            <button 
              className="action-icon-btn delete" 
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              title="Delete"
            >
              🗑️
            </button>
          )}
        </div>

        {/* Stats */}
        <div className="recipe-card-stats">
          <span>{recipe.likesCount || 0}</span>
          <span>👁 {recipe.viewCount || 0}</span>
        </div>
      </div>
    </div>
  );
};
