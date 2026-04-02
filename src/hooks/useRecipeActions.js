import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { recipeAPI } from '../services/api';
import { showToast } from '../utils/helpers';

export const useRecipeActions = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createRecipe = useCallback(async (recipeData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await recipeAPI.create(recipeData);
      showToast('Recipe created successfully!', 'success');
      return { ok: true, data: response.data.data };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to create recipe';
      setError(message);
      showToast(message, 'error');
      return { ok: false, message };
    } finally {
      setLoading(false);
    }
  }, []);

  const updateRecipe = useCallback(async (id, recipeData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await recipeAPI.update(id, recipeData);
      showToast('Recipe updated successfully!', 'success');
      return { ok: true, data: response.data.data };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to update recipe';
      setError(message);
      showToast(message, 'error');
      return { ok: false, message };
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteRecipe = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await recipeAPI.delete(id);
      showToast('Recipe deleted successfully!', 'success');
      return { ok: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to delete recipe';
      setError(message);
      showToast(message, 'error');
      return { ok: false, message };
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleLike = useCallback(async (id) => {
    try {
      const response = await recipeAPI.like(id);
      showToast(response.data.message, 'success');
      return { ok: true, liked: response.data.liked, count: response.data.likesCount };
    } catch (err) {
      if (err.response?.status === 401) {
        showToast('Your session expired. Please log in again.', 'error');
        navigate('/login');
      } else {
        const message = err.response?.data?.message || err.message || 'Failed to like recipe';
        showToast(message, 'error');
      }
      return { ok: false };
    }
  }, [navigate]);

  const toggleFavorite = useCallback(async (id) => {
    try {
      const response = await recipeAPI.favorite(id);
      showToast(response.data.message, 'success');
      return { ok: true, favorited: response.data.favorited };
    } catch (err) {
      if (err.response?.status === 401) {
        showToast('Your session expired. Please log in again.', 'error');
        navigate('/login');
      } else {
        const message = err.response?.data?.message || err.message || 'Failed to save recipe';
        showToast(message, 'error');
      }
      return { ok: false };
    }
  }, [navigate]);

  return {
    loading,
    error,
    createRecipe,
    updateRecipe,
    deleteRecipe,
    toggleLike,
    toggleFavorite,
  };
};
