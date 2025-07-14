import { useState, useEffect, useCallback, useRef } from 'react';
import { usersAPI } from '../utils/api';

export const useUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });
  const [filters, setFilters] = useState({});
  const [stats, setStats] = useState(null);

  // Use refs to track current state without causing re-renders
  const filtersRef = useRef(filters);
  const paginationRef = useRef(pagination);

  // Update refs when state changes
  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

  useEffect(() => {
    paginationRef.current = pagination;
  }, [pagination]);

  // Fetch users
  const fetchUsers = useCallback(async (newFilters = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await usersAPI.getAll({
        ...filtersRef.current,
        ...newFilters,
        page: paginationRef.current.page,
        limit: paginationRef.current.limit
      });
      
      if (response.success) {
        setUsers(response.data);
        setPagination(response.pagination);
      } else {
        setError(response.message || 'Failed to fetch users');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching users');
    } finally {
      setLoading(false);
    }
  }, []); // Empty dependency array to prevent recreation

  // Fetch user statistics
  const fetchUserStats = async () => {
    try {
      const response = await usersAPI.getStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (err) {
      console.error('Error fetching user stats:', err);
    }
  };

  // Create user
  const createUser = async (userData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await usersAPI.create(userData);
      
      if (response.success) {
        // Refresh users list
        await fetchUsers();
        return { success: true, data: response.data };
      } else {
        setError(response.message || 'Failed to create user');
        return { success: false, message: response.message };
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error creating user';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Update user
  const updateUser = async (id, updateData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await usersAPI.update(id, updateData);
      
      if (response.success) {
        // Update the user in the list
        setUsers(prev => 
          prev.map(user => 
            user._id === id ? response.data : user
          )
        );
        return { success: true, data: response.data };
      } else {
        setError(response.message || 'Failed to update user');
        return { success: false, message: response.message };
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error updating user';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Delete user
  const deleteUser = async (id) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await usersAPI.delete(id);
      
      if (response.success) {
        // Remove the user from the list
        setUsers(prev => prev.filter(user => user._id !== id));
        return { success: true };
      } else {
        setError(response.message || 'Failed to delete user');
        return { success: false, message: response.message };
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error deleting user';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Update filters
  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
    // Trigger fetch after state updates
    setTimeout(() => fetchUsers(), 0);
  }, [fetchUsers]);

  // Update pagination
  const updatePagination = useCallback((newPagination) => {
    setPagination(prev => ({ ...prev, ...newPagination }));
    // Trigger fetch after state updates
    setTimeout(() => fetchUsers(), 0);
  }, [fetchUsers]);

  // Clear error
  const clearError = () => {
    setError(null);
  };

  // Initial fetch
  useEffect(() => {
    fetchUsers();
  }, []); // Only run once on mount

  // Initial fetch of stats
  useEffect(() => {
    fetchUserStats();
  }, []);

  return {
    users,
    loading,
    error,
    pagination,
    filters,
    stats,
    fetchUsers,
    fetchUserStats,
    createUser,
    updateUser,
    deleteUser,
    updateFilters,
    updatePagination,
    clearError
  };
}; 