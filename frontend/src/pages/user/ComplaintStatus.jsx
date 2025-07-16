import React, { useState } from 'react';
import { Box, Typography, Card, CardContent, Chip, TextField, InputAdornment, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Dialog, DialogTitle, DialogContent, DialogActions, Button, Select, MenuItem } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import { useComplaints } from '../../hooks/useComplaints';
import { useAuth } from '../../context/AuthContext';

export default function ComplaintStatus() {
  const [search, setSearch] = useState('');
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const { user } = useAuth();
  const { complaints, loading, deleteComplaint } = useComplaints();
  
  // Filter complaints for current user
  const userComplaints = complaints.filter(c => 
    c.submittedBy?._id === user?._id || c.submittedBy === user?._id
  );
  
  const [statusFilter, setStatusFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  // Unique values for dropdowns
  const allDepartments = Array.from(new Set(userComplaints.map(c => c.department)));
  const allStatuses = Array.from(new Set(userComplaints.map(c => c.status)));
  const allPriorities = Array.from(new Set(userComplaints.map(c => c.priority)));

  // Filtered complaints
  const filteredComplaints = userComplaints.filter(c => {
    const matchesSearch =
      !search ||
      c._id?.toString().includes(search) ||
      c.title.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = !statusFilter || c.status === statusFilter;
    const matchesDepartment = !departmentFilter || c.department === departmentFilter;
    const matchesPriority = !priorityFilter || c.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesDepartment && matchesPriority;
  });

  const handleViewDetails = (complaint) => {
    setSelectedComplaint(complaint);
    setModalOpen(true);
  };

  const handleCloseModal = () => setModalOpen(false);

  const handleDeleteComplaint = async (id) => {
    try {
      const result = await deleteComplaint(id);
      if (result.success) {
        // Complaint will be automatically removed from the list by the hook
      }
    } catch (error) {
      console.error('Error deleting complaint:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'warning';
      case 'In Progress': return 'info';
      case 'Resolved': return 'success';
      case 'Rejected': return 'error';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'error';
      case 'Medium': return 'warning';
      case 'Low': return 'info';
      case 'Urgent': return 'secondary';
      default: return 'default';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'now';
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
    if (diffInMinutes < 2880) return 'yesterday';
    
    return date.toLocaleDateString();
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, width: '100%', maxWidth: 1200, mx: 'auto' }}>
      {/* Heading and Filters Row */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mb: 3 }}>
        <Box sx={{
          color: '#1976d2',
          fontWeight: 700,
          fontSize: 22,
          letterSpacing: 0.5,
        }}>
          My Complaints
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
        </Box>
      </Box>
      {/* Complaints Table Container */}
      <Box sx={{
        borderRadius: 3,
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        background: '#fff',
        border: '1px solid #f0f0f0',
        width: '100%',
        maxWidth: '100%',
        overflowX: 'auto',
      }}>
        <Box sx={{ p: { xs: 2, md: 4 } }}>
          <TableContainer sx={{ width: '100%', overflowX: 'auto' }}>
            <Table size="small" sx={{ minWidth: 800 }}>
              <TableHead>
                <TableRow sx={{ background: '#f7f7f7' }}>
                  <TableCell sx={{ fontWeight: 700, color: '#222', py: 1, width: 220, maxWidth: 260, minWidth: 180, whiteSpace: 'nowrap' }}>ID</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#222', py: 1, width: 80, maxWidth: 120, minWidth: 50, overflow: 'hidden', textOverflow: 'ellipsis' }}>Title</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#222', py: 1 }}>Department</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#222', py: 1 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#222', py: 1 }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#222', py: 1 }}>Priority</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#222', py: 1 }}>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                      Loading complaints...
                    </TableCell>
                  </TableRow>
                ) : filteredComplaints.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                      {search || statusFilter || departmentFilter || priorityFilter ? 'No complaints found matching your filters.' : 'No complaints found. File your first complaint to get started!'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredComplaints.map((complaint) => (
                    <TableRow key={complaint.id || complaint._id}>
                      <TableCell sx={{ py: 1, fontFamily: 'monospace', fontSize: 13 }}>
                        {(() => {
                          const id = complaint.id || complaint._id || '';
                          if (id.length > 18) {
                            return <span>{id.slice(0, 18)}<br />{id.slice(18)}</span>;
                          }
                          return id;
                        })()}
                      </TableCell>
                      <TableCell sx={{ py: 1 }}>{complaint.title}</TableCell>
                      <TableCell sx={{ py: 1 }}>{complaint.department}</TableCell>
                      <TableCell sx={{ py: 1 }}>
                        <Chip label={complaint.status} color={getStatusColor(complaint.status)} size="small" sx={{ borderRadius: 2, fontWeight: 700, px: 1, fontSize: 12, height: 24, width: 100, justifyContent: 'center' }} />
                      </TableCell>
                      <TableCell sx={{ py: 1 }}>{formatDate(complaint.createdAt)}</TableCell>
                      <TableCell sx={{ py: 1 }}>
                        <Chip label={complaint.priority} color={getPriorityColor(complaint.priority)} size="small" sx={{ borderRadius: 2, fontWeight: 700, px: 1, fontSize: 12, height: 24, width: 80, justifyContent: 'center' }} />
                      </TableCell>
                      <TableCell sx={{ py: 1 }}>
                        <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                          <Button
                            variant="outlined"
                            size="small"
                            sx={{ minWidth: 0 }}
                            onClick={() => handleViewDetails(complaint)}
                          >
                            <VisibilityIcon />
                          </Button>
                          <Button
                            variant="outlined"
                            color="error"
                            size="small"
                            onClick={() => handleDeleteComplaint(complaint.id || complaint._id)}
                            sx={{ minWidth: 0, px: 1.2 }}
                          >
                            <DeleteIcon fontSize="small" />
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Box>

      {/* Complaint Details Modal */}
      <Dialog open={modalOpen} onClose={handleCloseModal} maxWidth="sm" fullWidth>
        <DialogTitle>Complaint Details</DialogTitle>
        <DialogContent dividers>
          {selectedComplaint && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Complaint ID</Typography>
                <Typography variant="h6">{selectedComplaint.id || selectedComplaint._id}</Typography>
              </Box>
              
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Title</Typography>
                <Typography variant="body1">{selectedComplaint.title}</Typography>
              </Box>
              
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Description</Typography>
                <Typography variant="body1">{selectedComplaint.description}</Typography>
              </Box>
              
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Department</Typography>
                <Typography variant="body1">{selectedComplaint.department}</Typography>
              </Box>
              
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                <Typography variant="body1">{selectedComplaint.status}</Typography>
              </Box>
              
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Priority</Typography>
                <Chip 
                  label={selectedComplaint.priority} 
                  color={getPriorityColor(selectedComplaint.priority)}
                  sx={{ mt: 0.5 }}
                />
              </Box>
              
              {/* History Section */}
              <Box>
                <Typography variant="subtitle2" color="text.secondary">History</Typography>
                <Typography variant="body2">Filed at: {formatDate(selectedComplaint.createdAt)}</Typography>
                {selectedComplaint.resolvedAt && (
                  <Typography variant="body2">Resolved at: {formatDate(selectedComplaint.resolvedAt)}</Typography>
                )}
              </Box>
              {selectedComplaint.status === 'Resolved' && selectedComplaint.resolver && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Handled By:</Typography>
                  <Typography variant="body1">{selectedComplaint.resolver.name}</Typography>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
