import React, { useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Chip, Box, Divider, CircularProgress } from '@mui/material';
import axios from 'axios';

export default function ComplaintDetailsModal({ open, onClose, complaint }) {
  const [timeline, setTimeline] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [historyError, setHistoryError] = useState(null);

  useEffect(() => {
    if (open && complaint?.id) {
      setLoadingHistory(true);
      setHistoryError(null);
      axios.get(`/api/complaints/${complaint.id}/history`)
        .then(res => {
          setTimeline(res.data.data || []);
        })
        .catch(err => {
          setHistoryError('Failed to load update history.');
        })
        .finally(() => setLoadingHistory(false));
    } else {
      setTimeline([]);
    }
  }, [open, complaint?.id]);

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

  const eventTypeLabel = (type) => {
    switch (type) {
      case 'CREATED': return 'Created';
      case 'UPDATE_COMPLAINT': return 'Updated';
      case 'DELETE_COMPLAINT': return 'Deleted';
      case 'RESOLVE_COMPLAINT': return 'Resolved';
      case 'COMMENT': return 'Commented';
      case 'REJECTED': return 'Rejected';
      default: return type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
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
              {complaint.id || complaint._id || 'N/A'}
            </Typography>
          </Box>

          <Box>
            <Typography variant="body2" color="text.secondary">
              <strong>Submitted By:</strong>
            </Typography>
            <Typography variant="body1" sx={{ mb: 1 }}>
              {complaint.submitter
                ? `${complaint.submitter.name} (${complaint.submitter.email})`
                : 'Unknown User'}
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

          {/* Admin who resolved/rejected the complaint */}
          {(complaint.status === 'Resolved' || complaint.status === 'Rejected') && complaint.resolver && (
            <Box sx={{ gridColumn: '1 / -1' }}>
              <Typography variant="body2" color="text.secondary">
                <strong>Handled By:</strong>
              </Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                {complaint.resolver.name} ({complaint.resolver.email})
              </Typography>
            </Box>
          )}
        </Box>

        {/* Timeline / Update History Section */}
        <Divider sx={{ my: 3 }} />
        <Typography variant="h6" sx={{ mb: 2 }}>Update History</Typography>
        {loadingHistory ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <CircularProgress size={22} />
            <Typography variant="body2">Loading history...</Typography>
          </Box>
        ) : historyError ? (
          <Typography color="error" sx={{ mb: 2 }}>{historyError}</Typography>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {timeline.length === 0 ? (
              <Typography variant="body2" color="text.secondary">No history found.</Typography>
            ) : timeline.map((event, idx) => (
              <Box key={idx} sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                <Box sx={{ minWidth: 90 }}>
                  <Chip label={eventTypeLabel(event.type)} size="small" color="primary" />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {event.by ? `${event.by.name} (${event.by.email})` : event.handledBy || 'System'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formatDate(event.createdAt)}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 0.5 }}>
                    {event.details}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained" color="primary">Close</Button>
      </DialogActions>
    </Dialog>
  );
}
