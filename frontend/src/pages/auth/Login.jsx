import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  InputAdornment
} from '@mui/material';
import BusinessIcon from '@mui/icons-material/Business';
import IconButton from '@mui/material/IconButton';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useAuth } from '../../context/AuthContext';

// Autofill background fix for Chrome/Edge
const autofillStyle = `
  input:-webkit-autofill,
  input:-webkit-autofill:focus,
  input:-webkit-autofill:hover,
  input:-webkit-autofill:active {
    -webkit-box-shadow: 0 0 0 1000px #fff inset !important;
    box-shadow: 0 0 0 1000px #fff inset !important;
    -webkit-text-fill-color: #222 !important;
    caret-color: #1976d2 !important;
    border-radius: 8px;
    background: #fff !important;
  }
`;

const Login = ({ role }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const emailRef = useRef(null);
  const [showPassword, setShowPassword] = useState(false);

  const { login, error, clearError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (emailRef.current) {
      setTimeout(() => {
        emailRef.current && emailRef.current.focus();
      }, 200);
    }
  }, []);

  const from = location.state?.from?.pathname || '/home';

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    // Clear auth error when user interacts with form
    if (error) {
      clearError();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    clearError();

    try {
      const result = await login(formData.email, formData.password);
      if (result.success) {
        // Redirect based on user role
        if (result.user?.role === 'admin') {
          navigate('/admin', { replace: true });
        } else {
          navigate('/user/dashboard', { replace: true });
        }
      }
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: `#e3f0fc url('data:image/svg+xml;utf8,<svg width="100%25" height="100%25" xmlns="http://www.w3.org/2000/svg"><polygon fill="%23d0e6fa" points="0,0 100,0 100,100 0,100"/><polygon fill="%23e3f0fc" points="0,0 100,0 100,80 0,100"/><polygon fill="%23b8d8f8" points="0,20 100,0 100,100 0,100"/></svg>') no-repeat center center`,
      backgroundSize: 'cover',
      py: 4,
      px: 2
    }}>
      <style>{autofillStyle}</style>
      <Paper
        elevation={6}
        sx={{
          minWidth: 340,
          maxWidth: 400,
          width: '100%',
          p: { xs: 3, sm: 4 },
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(25, 118, 210, 0.18)',
          background: 'rgba(255,255,255,0.97)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <BusinessIcon sx={{
          fontSize: 54,
          color: 'primary.main',
          mb: 1,
          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.10))'
        }} />
        <Typography component="h1" variant="h4" fontWeight={700} color="primary.main" gutterBottom sx={{ letterSpacing: 0.5 }}>
          Login as {role === 'admin' ? 'Admin' : 'Employee'}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3, fontWeight: 500, fontSize: 17 }}>
          Welcome back! Please sign in to your {role === 'admin' ? 'admin' : 'employee'} account.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ width: '100%', mb: 2, fontSize: 15, py: 1 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%', mt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            inputRef={emailRef}
            value={formData.email}
            onChange={handleChange}
            error={!!errors.email}
            helperText={errors.email}
            disabled={isSubmitting}
            InputProps={{
              sx: {
                borderRadius: 2,
                background: '#fff',
                fontSize: 16
              }
            }}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type={showPassword ? 'text' : 'password'}
            id="password"
            autoComplete="current-password"
            value={formData.password}
            onChange={handleChange}
            error={!!errors.password}
            helperText={errors.password}
            disabled={isSubmitting}
            InputProps={{
              sx: {
                borderRadius: 2,
                background: '#fff',
                fontSize: 16
              },
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    onClick={() => setShowPassword((show) => !show)}
                    edge="end"
                    tabIndex={-1}
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={isSubmitting}
            sx={{
              mt: 3,
              mb: 2,
              py: 1.5,
              fontSize: 16,
              fontWeight: 700,
              borderRadius: 2,
              background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
              boxShadow: '0 3px 15px rgba(25, 118, 210, 0.3)',
              '&:hover': {
                background: 'linear-gradient(45deg, #1565c0 30%, #1976d2 90%)',
                boxShadow: '0 6px 20px rgba(25, 118, 210, 0.4)'
              },
              '&:disabled': {
                background: '#ccc',
                boxShadow: 'none'
              }
            }}
          >
            {isSubmitting ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              'Sign In'
            )}
          </Button>
          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              <Link to="/home" style={{ color: '#d32f2f', textDecoration: 'none', fontWeight: 600 }}>
                Back to Home
              </Link>
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default Login; 