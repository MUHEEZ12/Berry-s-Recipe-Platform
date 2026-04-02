import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { recipeAPI } from '../services/api';
import { useAuth } from './AuthContext';

const RecipeContext = createContext();

const defaultRecipes = [
  {
    id: '1',
    title: 'Spaghetti Bolognese',
    category: 'Pasta',
    description: 'Classic Italian meat sauce pasta',
    images: ['https://images.unsplash.com/photo-1603133872878-684f208fb84b'],
    ingredients: ['Spaghetti', 'Beef', 'Tomato sauce'],
    steps: ['Boil pasta', 'Cook beef', 'Mix sauce'],
    createdAt: new Date().toISOString(),
    likesCount: 5,
    viewCount: 42,
  },
  {
    id: '2',
    title: 'Chocolate Cake',
    category: 'Dessert',
    description: 'Rich and moist chocolate cake',
    images: ['https://images.unsplash.com/photo-1578985545062-69928b1d9587'],
    ingredients: ['Flour', 'Cocoa', 'Eggs'],
    steps: ['Mix', 'Bake'],
    createdAt: new Date().toISOString(),
    likesCount: 12,
    viewCount: 89,
  },
];

export function RecipeProvider({ children }) {
  const { token } = useAuth();
  const [recipes, setRecipes] = useState(() => {
    try {
      const saved = localStorage.getItem('recipes');
      return saved ? JSON.parse(saved) : defaultRecipes;
    } catch {
      return defaultRecipes;
    }
  });

  const [category, setCategory] = useState('all');
  const [loading, setLoading] = useState(false);

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem('recipes', JSON.stringify(recipes));
  }, [recipes]);

  // Fetch recipes from backend
  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        setLoading(true);
        const response = await recipeAPI.getAll({ limit: 100 });
        const normalized = (response.data.data || []).map((r) => ({
          id: r._id,
          title: r.title,
          description: r.description,
          images: r.images || [],
          ingredients: r.ingredients || [],
          steps: r.steps || [],
          category: r.category || 'General',
          prepTime: r.prepTime || 30,
          difficulty: r.difficulty || 'Easy',
          servings: r.servings || 4,
          owner: r.owner?._id || r.owner,
          createdAt: r.createdAt,
          likesCount: r.likesCount || 0,
          viewCount: r.viewCount || 0,
          likedBy: r.likedBy || [],
          favoritedBy: r.favoritedBy || [],
        }));
        if (normalized.length > 0) {
          setRecipes(normalized);
        }
      } catch (err) {
        // Failed to fetch recipes from API
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, []);

  // Add recipe
  const addRecipe = useCallback(
    async (recipeData) => {
      if (token) {
        try {
          const response = await recipeAPI.create(recipeData);
          const created = response.data.data;
          const newRecipe = {
            id: created._id,
            title: created.title,
            description: created.description,
            images: created.images || [],
            ingredients: created.ingredients || [],
            steps: created.steps || [],
            category: created.category || 'General',
            prepTime: created.prepTime || 30,
            difficulty: created.difficulty || 'Easy',
            servings: created.servings || 4,
            owner: created.owner,
            createdAt: created.createdAt,
            likesCount: 0,
            viewCount: 0,
          };
          setRecipes((prev) => [newRecipe, ...prev]);
          return { ok: true, data: newRecipe };
        } catch (err) {
          const message = err.response?.data?.message || err.message;
          return { ok: false, message };
        }
      }

      // Fallback: local storage
      const localRecipe = {
        ...recipeData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      };
      setRecipes((prev) => [localRecipe, ...prev]);
      return { ok: true, data: localRecipe };
    },
    [token]
  );

  // Delete recipe
  const deleteRecipe = useCallback(
    async (id) => {
      try {
        await recipeAPI.delete(id);
        setRecipes((prev) => prev.filter((r) => String(r.id) !== String(id)));
        return { ok: true };
      } catch (err) {
        const message = err.response?.data?.message || err.message;
        return { ok: false, message };
      }
    },
    []
  );

  // Get recipe by ID
  const getRecipeById = useCallback(
    (id) => recipes.find((r) => String(r.id) === String(id)),
    [recipes]
  );

  // Filtered recipes
  const filteredRecipes =
    category === 'all' ? recipes : recipes.filter((r) => r.category === category);

  return (
    <RecipeContext.Provider
      value={{
        recipes: filteredRecipes,
        allRecipes: recipes,
        addRecipe,
        deleteRecipe,
        getRecipeById,
        category,
        setCategory,
        loading,
      }}
    >
      {children}
    </RecipeContext.Provider>
  );
}

export function useRecipes() {
  const context = useContext(RecipeContext);
  if (!context) {
    throw new Error('useRecipes must be used within RecipeProvider');
  }
  return context;
}
