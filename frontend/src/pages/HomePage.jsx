import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Card, CardContent, Typography, Button } from '@mui/material';
import HowToRegIcon from '@mui/icons-material/HowToReg';

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `#e3f0fc url('data:image/svg+xml;utf8,<svg width="100%25" height="100%25" xmlns="http://www.w3.org/2000/svg"><polygon fill="%23d0e6fa" points="0,0 100,0 100,100 0,100"/><polygon fill="%23e3f0fc" points="0,0 100,0 100,80 0,100"/><polygon fill="%23b8d8f8" points="0,20 100,0 100,100 0,100"/></svg>') no-repeat center center`,
        backgroundSize: 'cover',
        py: 4,
        px: 2,
      }}
    >
      <Card
        sx={{
          maxWidth: 400,
          width: '100%',
          borderRadius: 4,
          boxShadow: '0 8px 32px rgba(0,0,0,0.10)',
          background: '#fff',
          p: 0,
        }}
      >
        <CardContent sx={{ p: { xs: 4, md: 6 } }}>
          {/* Logo */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
            <Box sx={{ mb: 2 }}>
              <HowToRegIcon sx={{ fontSize: 56, color: '#1976d2' }} />
            </Box>
            <Typography variant="h4" component="h1" fontWeight={700} color="#1976d2" gutterBottom sx={{ letterSpacing: 0.5 }}>
              TechCorp
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" sx={{ fontWeight: 400, mb: 2 }}>
              Employee Complaint Portal
            </Typography>
          </Box>

          {/* Login buttons */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/admin-login')}
              sx={{
                borderRadius: 8,
                fontWeight: 700,
                fontSize: 18,
                py: 1.5,
                boxShadow: '0 2px 8px rgba(25, 118, 210, 0.10)',
                mb: 1,
                textTransform: 'none',
              }}
              fullWidth
            >
              Login as Admin
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate('/user-login')}
              sx={{
                borderRadius: 8,
                fontWeight: 700,
                fontSize: 18,
                py: 1.5,
                color: '#1976d2',
                borderColor: '#1976d2',
                background: '#fff',
                textTransform: 'none',
                '&:hover': {
                  background: '#f5faff',
                  borderColor: '#1565c0',
                },
              }}
              fullWidth
            >
              Login as User
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
} 