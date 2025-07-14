import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';

export default function ChartBox({ title, children }) {
  return (
    <Card sx={{
      borderRadius: 3,
      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      background: '#fff',
      border: '1px solid #f0f0f0',
      mb: 2,
      minWidth: 260,
      maxWidth: 320,
      minHeight: 320,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      p: 2,
      m: 'auto',
    }}>
      <CardContent sx={{ width: '100%', p: 0 }}>
        <Typography variant="subtitle1" fontWeight={600} mb={2} align="center">{title}</Typography>
        <Box sx={{ minHeight: 220, width: '100%' }}>{children}</Box>
      </CardContent>
    </Card>
  );
} 