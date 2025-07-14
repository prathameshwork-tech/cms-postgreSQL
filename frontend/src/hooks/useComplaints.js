import { useState, useEffect, useCallback, useRef } from 'react';
import { complaintsAPI } from '../utils/api';

export const useComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });
  const [filters, setFilters] = useState({});

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

  // Fetch complaints
  const fetchComplaints = useCallback(async (newFilters = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await complaintsAPI.getAll({
        ...filtersRef.current,
        ...newFilters,
        page: paginationRef.current.page,
        limit: paginationRef.current.limit
      });
      
      if (response.success) {
        setComplaints(response.data);
        setPagination(response.pagination);
      } else {
        setError(response.message || 'Failed to fetch complaints');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching complaints');
    } finally {
      setLoading(false);
    }
  }, []); // Empty dependency array to prevent recreation

  // Initial fetch
  useEffect(() => {
    fetchComplaints();
  }, []); // Only run once on mount

  // Create complaint
  const createComplaint = async (complaintData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await complaintsAPI.create(complaintData);
      
      if (response.success) {
        // Refresh complaints list
        await fetchComplaints();
        return { success: true, data: response.data };
      } else {
        setError(response.message || 'Failed to create complaint');
        return { success: false, message: response.message };
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error creating complaint';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Update complaint
  const updateComplaint = async (id, updateData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await complaintsAPI.update(id, updateData);
      
      if (response.success) {
        // Update the complaint in the list
        setComplaints(prev => 
          prev.map(complaint => 
            complaint.id === id ? response.data : complaint
          )
        );
        return { success: true, data: response.data };
      } else {
        setError(response.message || 'Failed to update complaint');
        return { success: false, message: response.message };
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error updating complaint';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Update complaint status
  const updateComplaintStatus = async (id, status, resolution = null) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await complaintsAPI.updateStatus(id, status, resolution);
      
      if (response.success) {
        // Update the complaint in the list
        setComplaints(prev => 
          prev.map(complaint => 
            complaint.id === id ? response.data : complaint
          )
        );
        return { success: true, data: response.data };
      } else {
        setError(response.message || 'Failed to update complaint status');
        return { success: false, message: response.message };
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error updating complaint status';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Add comment to complaint
  const addComment = async (id, comment) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await complaintsAPI.addComment(id, comment);
      
      if (response.success) {
        // Update the complaint in the list
        setComplaints(prev => 
          prev.map(complaint => 
            complaint.id === id ? response.data : complaint
          )
        );
        return { success: true, data: response.data };
      } else {
        setError(response.message || 'Failed to add comment');
        return { success: false, message: response.message };
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error adding comment';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Delete complaint
  const deleteComplaint = async (id) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await complaintsAPI.delete(id);
      
      if (response.success) {
        // Remove the complaint from the list
        setComplaints(prev => prev.filter(complaint => complaint.id !== id));
        return { success: true };
      } else {
        setError(response.message || 'Failed to delete complaint');
        return { success: false, message: response.message };
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error deleting complaint';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Update filters
  const updateFilters = useCallback((newFilters, reset = false) => {
    setFilters(prev => reset ? { ...newFilters } : { ...prev, ...newFilters });
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
    // Trigger fetch after state updates
    setTimeout(() => fetchComplaints(), 0);
  }, [fetchComplaints]);

  // Update pagination
  const updatePagination = useCallback((newPagination) => {
    setPagination(prev => ({ ...prev, ...newPagination }));
    // Trigger fetch after state updates
    setTimeout(() => fetchComplaints(), 0);
  }, [fetchComplaints]);

  // Clear error
  const clearError = () => {
    setError(null);
  };

  // Fetch urgent complaints for notifications
  const fetchUrgentComplaints = useCallback(async () => {
    try {
      const response = await complaintsAPI.getUrgent();
      return response.data;
    } catch (error) {
      console.error('Error fetching urgent complaints:', error);
      return { success: false, data: [], count: 0 };
    }
  }, []);

  // Auto-escalate old complaints
  const autoEscalateComplaints = useCallback(async () => {
    try {
      const response = await complaintsAPI.autoEscalate();
      return response.data;
    } catch (error) {
      console.error('Error auto-escalating complaints:', error);
      return { success: false };
    }
  }, []);

  return {
    complaints,
    loading,
    error,
    pagination,
    filters,
    fetchComplaints,
    createComplaint,
    updateComplaint,
    updateComplaintStatus,
    addComment,
    deleteComplaint,
    updateFilters,
    updatePagination,
    clearError,
    fetchUrgentComplaints,
    autoEscalateComplaints
  };
}; 