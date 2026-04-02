import { useState } from "react";
import { Link } from "react-router-dom";
import "./RecipeList.css";

const recipesData = [
  {
    id: "1",
    title: "Spaghetti Bolognese",
    image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b",
  },
  {
    id: "2",
    title: "Chicken Shawarma",
    image: "https://images.unsplash.com/photo-1604908177225-6c5b3b1b3c57",
  },
  {
    id: "3",
    title: "Chocolate Cake",
    image: "https://images.unsplash.com/photo-1542826438-8b2b6b1c1c1a",
  },
  {
    id: "4",
    title: "Fruit Smoothie",
    image: "https://images.unsplash.com/photo-1572441710534-6809db2fdb3b",
  },
];

function RecipeList() {
  const [search, setSearch] = useState("");

  const filteredRecipes = recipesData.filter((recipe) =>
    recipe.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="recipes-container">
      <h1>Discover Recipes</h1>

      <input
        className="search-input"
        type="text"
        placeholder="Search recipes..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="recipes-grid">
        {filteredRecipes.map((recipe) => (
          <Link
            to={`/recipes/${recipe.id}`}
            className="recipe-card-link"
            key={recipe.id}
          >
            <div className="recipe-card">
              <img src={recipe.image} alt={recipe.title} />
              <h3>{recipe.title}</h3>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default RecipeList;
