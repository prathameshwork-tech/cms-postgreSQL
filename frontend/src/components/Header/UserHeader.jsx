import React from 'react';
import { Box, Typography, Avatar } from '@mui/material';
import { useAuth } from '../../context/AuthContext';

export default function UserHeader() {
  const { user } = useAuth();
  const userName = user?.name || 'User';
  
  return (
    <Box sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      py: 2,
      px: 4,
      background: '#fff',
      borderBottom: '1px solid #f0f0f0',
      boxShadow: 1,
      minHeight: 56,
    }}>
      <Typography variant="h6" fontWeight={600} color="#1976d2">
        Welcome, {userName}
      </Typography>
      <Avatar sx={{ bgcolor: '#1976d2', width: 36, height: 36 }}
        src="https://randomuser.me/api/portraits/men/32.jpg"
      />
    </Box>
  );
} 