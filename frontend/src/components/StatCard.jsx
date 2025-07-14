import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';

export default function StatCard({ icon, label, value, color }) {
  return (
    <Card sx={{
      borderRadius: 4,
      boxShadow: '0 4px 24px rgba(25, 118, 210, 0.08)',
      background: 'linear-gradient(135deg, #f7fafc 60%, #e3f2fd 100%)',
      border: 'none',
      minWidth: 210,
      maxWidth: 260,
      height: 200,
      minHeight: 200,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'transform 0.2s',
      '&:hover': { transform: 'translateY(-6px) scale(1.04)', boxShadow: '0 8px 32px rgba(25, 118, 210, 0.16)' }
    }}>
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: color || 'primary.main',
        color: '#fff',
        borderRadius: '50%',
        width: 54,
        height: 54,
        fontSize: 32,
        mb: 2,
        boxShadow: '0 2px 8px rgba(25, 118, 210, 0.10)'
      }}>
        {icon}
      </Box>
      <CardContent sx={{ p: 0, textAlign: 'center' }}>
        <Typography variant="h3" fontWeight={700} sx={{ mb: 1, color: '#1976d2', fontSize: 36 }}>{value}</Typography>
        <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 600 }}>{label}</Typography>
      </CardContent>
    </Card>
  );
} 