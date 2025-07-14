import React, { useState, useEffect } from 'react';
import { Box, TextField, Select, MenuItem, InputAdornment, Alert, CircularProgress } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ComplaintsTable from '../../components/ComplaintsTable';
import ComplaintDetailsModal from '../../components/ComplaintDetailsModal';
import { useComplaints } from '../../hooks/useComplaints';

export default function Complaints() {
  const { 
    complaints, 
    loading, 
    error, 
    pagination,
    updateFilters,
    updatePagination,
    updateComplaintStatus, 
    deleteComplaint 
  } = useComplaints();
  const [statusMap, setStatusMap] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  // Apply filters when they change
  useEffect(() => {
    // Always send a fresh filters object, not a merge
    const filters = {};
    if (search) filters.search = search;
    if (statusFilter) filters.status = statusFilter;
    if (departmentFilter) filters.department = departmentFilter;
    if (priorityFilter) filters.priority = priorityFilter;

    updateFilters(filters, true); // true = reset filters
  }, [search, statusFilter, departmentFilter, priorityFilter]);

  // Update status map when complaints change
  useEffect(() => {
    const newStatusMap = {};
    complaints.forEach(complaint => {
      newStatusMap[complaint.id] = complaint.status;
    });
    setStatusMap(newStatusMap);
  }, [complaints]);

  // Unique values for dropdowns
  const allDepartments = Array.from(new Set(complaints.map(c => c.department)));
  const allStatuses = Array.from(new Set(complaints.map(c => c.status)));
  const allPriorities = Array.from(new Set(complaints.map(c => c.priority)));

  const handleStatusChange = async (id, newStatus) => {
    try {
      const result = await updateComplaintStatus(id, newStatus);
      if (result.success) {
        setStatusMap(prev => ({ ...prev, [id]: newStatus }));
      }
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };
  const handleViewDetails = (complaint) => {
    setSelectedComplaint(complaint);
    setModalOpen(true);
  };
  const handleCloseModal = () => setModalOpen(false);
  const handleDeleteComplaint = async (id) => {
    if (window.confirm('Are you sure you want to delete this complaint?')) {
      try {
        await deleteComplaint(id);
      } catch (error) {
        console.error('Failed to delete complaint:', error);
      }
    }
  };
  const formatComplaintDate = (date) => {
    if (!date) return 'Invalid Date';
    
    const complaintDate = new Date(date);
    const now = new Date();
    const diffInMs = now - complaintDate;
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    // Less than 1 minute
    if (diffInMinutes < 1) {
      return 'now';
    }
    // Less than 1 hour
    else if (diffInMinutes < 60) {
      return `${diffInMinutes} min ago`;
    }
    // Less than 3 hours
    else if (diffInHours < 3) {
      return `${diffInHours} hr${diffInHours > 1 ? 's' : ''} ago`;
    }
    // Less than 24 hours (same day)
    else if (diffInHours < 24) {
      return 'today';
    }
    // Less than 48 hours (yesterday)
    else if (diffInDays < 2) {
      return 'yesterday';
    }
    // More than 48 hours - show actual date
    else {
      return complaintDate.toLocaleDateString();
    }
  };
  const priorityColors = { 
    Critical: 'error', 
    High: 'warning', 
    Medium: 'primary', 
    Low: 'info' 
  };
  const statusBgColors = { 'Pending': '#fff3cd', 'In Progress': '#d1ecf1', 'Resolved': '#d4edda', 'Rejected': '#f8d7da' };
  
  return (
    <Box sx={{ p: { xs: 2, md: 4 }, width: '100%', maxWidth: 1200, mx: 'auto' }}>
      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Loading State */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Heading and Filters Row */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mb: 3 }}>
        <Box sx={{
          color: '#1976d2',
          fontWeight: 700,
          fontSize: 22,
          letterSpacing: 0.5,
        }}>
          Complaints ({complaints.length})
        </Box>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
          <TextField
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by ID or Title..."
            size="small"
            variant="outlined"
            sx={{ minWidth: 220, background: '#f7f7f7', borderRadius: 2, '& .MuiOutlinedInput-root': { borderRadius: 2 }, mr: 1 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                </InputAdornment>
              ),
            }}
          />
          <Select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            displayEmpty
            size="small"
            variant="outlined"
            sx={{ minWidth: 140, background: '#f7f7f7', borderRadius: 2, '& .MuiOutlinedInput-notchedOutline': { borderColor: '#e0e0e0' }, '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#1976d2' } }}
          >
            <MenuItem value="">All Statuses</MenuItem>
            {allStatuses.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
          </Select>
          <Select
            value={departmentFilter}
            onChange={e => setDepartmentFilter(e.target.value)}
            displayEmpty
            size="small"
            variant="outlined"
            sx={{ minWidth: 140, background: '#f7f7f7', borderRadius: 2, '& .MuiOutlinedInput-notchedOutline': { borderColor: '#e0e0e0' }, '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#1976d2' } }}
          >
            <MenuItem value="">All Departments</MenuItem>
            {allDepartments.map(d => <MenuItem key={d} value={d}>{d}</MenuItem>)}
          </Select>
          <Select
            value={priorityFilter}
            onChange={e => setPriorityFilter(e.target.value)}
            displayEmpty
            size="small"
            variant="outlined"
            sx={{ minWidth: 140, background: '#f7f7f7', borderRadius: 2, '& .MuiOutlinedInput-notchedOutline': { borderColor: '#e0e0e0' }, '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#1976d2' } }}
          >
            <MenuItem value="">All Priorities</MenuItem>
            {allPriorities.map(p => <MenuItem key={p} value={p}>{p}</MenuItem>)}
          </Select>
        </Box>
      </Box>
      <Box sx={{
        borderRadius: 3,
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        background: '#fff',
        border: '1px solid #f0f0f0',
        width: '100%',
        maxWidth: 1400,
        overflowX: 'auto',
      }}>
        <Box sx={{ p: { xs: 2, md: 4 } }}>
          <ComplaintsTable
            recentComplaints={complaints}
            statusMap={statusMap}
            handleStatusChange={handleStatusChange}
            handleViewDetails={handleViewDetails}
            handleDeleteComplaint={handleDeleteComplaint}
            formatComplaintDate={formatComplaintDate}
            priorityColors={priorityColors}
            statusBgColors={statusBgColors}
            pagination={pagination}
            onPageChange={(page) => updatePagination({ page })}
          />
          <ComplaintDetailsModal open={modalOpen} onClose={handleCloseModal} complaint={selectedComplaint} />
        </Box>
      </Box>
    </Box>
  );
}
