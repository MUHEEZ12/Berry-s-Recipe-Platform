import { useState, useEffect, useCallback } from 'react';
import { recipeAPI } from '../services/api';

export const useFetchRecipes = (page = 1, limit = 12, search = '', category = '', sortBy = 'newest') => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 1,
  });

  const fetchRecipes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await recipeAPI.getAll({
        page,
        limit,
        search,
        category,
        sortBy,
      });
      setRecipes(response.data.data);
      setPagination(response.data.pagination);
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to fetch recipes';
      setError(message);
      console.error('Fetch recipes error:', err);
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, category, sortBy]);

  useEffect(() => {
    fetchRecipes();
  }, [fetchRecipes]);

  return {
    recipes,
    loading,
    error,
    pagination,
    refetch: fetchRecipes,
  };
};

export const useFetchTrending = () => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const response = await recipeAPI.getTrending();
        setRecipes(response.data.data);
      } catch (err) {
        console.error('Fetch trending error:', err);
        setError(err.response?.data?.message || 'Failed to fetch');
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, []);

  return { recipes, loading, error };
};
