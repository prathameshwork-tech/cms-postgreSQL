import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Chip, Box } from '@mui/material';

export default function ComplaintDetailsModal({ open, onClose, complaint }) {
  if (!complaint) return null;

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString();
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Critical': return 'error';
      case 'High': return 'warning';
      case 'Medium': return 'primary';
      case 'Low': return 'info';
      default: return 'default';
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Complaint Details</DialogTitle>
      <DialogContent dividers>
        <Typography variant="subtitle1" fontWeight={600} mb={2}>{complaint.title}</Typography>
        
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            <strong>Description:</strong>
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            {complaint.description}
          </Typography>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
          <Box>
            <Typography variant="body2" color="text.secondary">
              <strong>ID:</strong>
            </Typography>
            <Typography variant="body1" sx={{ mb: 1 }}>
              {complaint._id || 'N/A'}
            </Typography>
          </Box>

          <Box>
            <Typography variant="body2" color="text.secondary">
              <strong>Submitted By:</strong>
            </Typography>
            <Typography variant="body1" sx={{ mb: 1 }}>
              {complaint.submittedBy?.name || 'Unknown User'}
            </Typography>
          </Box>

          <Box>
            <Typography variant="body2" color="text.secondary">
              <strong>Department:</strong>
            </Typography>
            <Typography variant="body1" sx={{ mb: 1 }}>
              {complaint.department || 'N/A'}
            </Typography>
          </Box>

          <Box>
            <Typography variant="body2" color="text.secondary">
              <strong>Category:</strong>
            </Typography>
            <Typography variant="body1" sx={{ mb: 1 }}>
              {complaint.category || 'N/A'}
            </Typography>
          </Box>

          <Box>
            <Typography variant="body2" color="text.secondary">
              <strong>Status:</strong>
            </Typography>
            <Chip 
              label={complaint.status || 'N/A'} 
              color="primary" 
              size="small" 
              sx={{ mb: 1 }}
            />
          </Box>

          <Box>
            <Typography variant="body2" color="text.secondary">
              <strong>Priority:</strong>
            </Typography>
            <Chip 
              label={complaint.priority || 'N/A'} 
              color={getPriorityColor(complaint.priority)}
              size="small" 
              sx={{ mb: 1 }}
            />
          </Box>

          <Box sx={{ gridColumn: '1 / -1' }}>
            <Typography variant="body2" color="text.secondary">
              <strong>Date Created:</strong>
            </Typography>
            <Typography variant="body1" sx={{ mb: 1 }}>
              {formatDate(complaint.createdAt)}
            </Typography>
          </Box>

          {complaint.tags && complaint.tags.length > 0 && (
            <Box sx={{ gridColumn: '1 / -1' }}>
              <Typography variant="body2" color="text.secondary">
                <strong>Tags:</strong>
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 0.5 }}>
                {complaint.tags.map((tag, index) => (
                  <Chip key={index} label={tag} size="small" variant="outlined" />
                ))}
              </Box>
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained" color="primary">Close</Button>
      </DialogActions>
    </Dialog>
  );
} 