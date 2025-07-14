import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Grid, Card, CardContent, Chip, Button, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import AssignmentIcon from '@mui/icons-material/Assignment';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useComplaints } from '../../hooks/useComplaints';
import { useAuth } from '../../context/AuthContext';

export default function UserDashboard() {
  const { user } = useAuth();
  const { complaints, loading } = useComplaints();
  const navigate = useNavigate();

  // Filter complaints for current user (backend already filters, but double-check)
  const userComplaints = complaints.filter(c => c.submittedBy?._id === user?._id || c.submittedBy === user?._id);

  const stats = [
    {
      label: 'Total Complaints',
      value: userComplaints.length,
      icon: <AssignmentIcon fontSize="large" />,
      color: 'primary.main'
    },
    {
      label: 'Pending',
      value: userComplaints.filter(c => c.status === 'Pending').length,
      icon: <HourglassEmptyIcon fontSize="large" />,
      color: 'warning.main'
    },
    {
      label: 'Resolved',
      value: userComplaints.filter(c => c.status === 'Resolved').length,
      icon: <CheckCircleIcon fontSize="large" />,
      color: 'success.main'
    },
    {
      label: 'Rejected',
      value: userComplaints.filter(c => c.status === 'Rejected').length,
      icon: <CancelIcon fontSize="large" />,
      color: 'error.main'
    }
  ];

  // Modal for complaint details
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const handleViewDetails = (complaint) => {
    setSelectedComplaint(complaint);
    setModalOpen(true);
  };
  const handleCloseModal = () => setModalOpen(false);

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, width: '100%', maxWidth: 1200, mx: 'auto' }}>
      {/* User Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ color: '#1976d2', fontWeight: 700 }}>
          Welcome, {user?.name || 'User'}! 👋
        </Typography>
        <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 0.5 }}>
          Here’s a summary of your complaints. You can file a new complaint or track your existing ones below.
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4, justifyContent: 'center' }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index} sx={{ display: 'flex', justifyContent: 'center' }}>
            <Card sx={{ 
              borderRadius: 4, 
              boxShadow: '0 4px 24px rgba(25, 118, 210, 0.08)',
              background: 'linear-gradient(135deg, #f7fafc 60%, #e3f2fd 100%)',
              border: 'none',
              minWidth: 210,
              maxWidth: 260,
              transition: 'transform 0.2s',
              '&:hover': { transform: 'translateY(-6px) scale(1.04)', boxShadow: '0 8px 32px rgba(25, 118, 210, 0.16)' }
            }}>
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  bgcolor: stat.color, 
                  color: '#fff', 
                  borderRadius: '50%', 
                  width: 54, 
                  height: 54, 
                  fontSize: 32,
                  mx: 'auto',
                  mb: 2,
                  boxShadow: '0 2px 8px rgba(25, 118, 210, 0.10)'
                }}>
                  {stat.icon}
                </Box>
                <Typography variant="h3" fontWeight={700} sx={{ mb: 1, color: '#1976d2', fontSize: 36 }}>
                  {stat.value}
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 600 }}>
                  {stat.label}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>



    </Box>
  );
}
