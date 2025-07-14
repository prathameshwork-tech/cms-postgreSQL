import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import ErrorBoundary from './components/common/ErrorBoundary';
import { AuthProvider } from './context/AuthContext';
import AdminLayout from './layout/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import Complaints from './pages/admin/Complaints';
import Users from './pages/admin/Users';
import Logs from './pages/admin/Logs';
import Settings from './pages/admin/Settings';
import UserDashboard from './pages/user/UserDashboard';
import FileComplaint from './pages/user/FileComplaint';
import ComplaintStatus from './pages/user/ComplaintStatus';
import HomePage from './pages/HomePage';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ProtectedRoute from './components/common/ProtectedRoute';
import UserLayout from './layout/UserLayout';

// Create a custom theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f6f8fb',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 700,
    },
    h6: {
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          border: '1px solid #f0f0f0',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
        },
      },
    },
  },
});

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Root route - homepage for everyone */}
              <Route path="/" element={<HomePage />} />
              
              {/* Public Routes */}
              <Route path="/home" element={<HomePage />} />
              <Route path="/admin-login" element={<Login role="admin" />} />
              <Route path="/user-login" element={<Login role="user" />} />
              <Route path="/register" element={<Register />} />
              
              {/* User Routes */}
              <Route path="/user/*" element={
                <ProtectedRoute>
                  <UserLayout />
                </ProtectedRoute>
              }>
                <Route path="dashboard" element={<UserDashboard />} />
                <Route path="file-complaint" element={<FileComplaint />} />
                <Route path="status" element={<ComplaintStatus />} />
                <Route path="*" element={<Navigate to="dashboard" replace />} />
              </Route>
              
              {/* Admin Routes */}
              <Route path="/admin" element={
                <ProtectedRoute requireAdmin>
                  <AdminLayout />
                </ProtectedRoute>
              }>
                <Route index element={<Dashboard />} />
                <Route path="complaints" element={<Complaints />} />
                <Route path="users" element={<Users />} />
                <Route path="logs" element={<Logs />} />
                <Route path="settings" element={<Settings />} />
                <Route path="*" element={<Navigate to="" replace />} />
              </Route>
              
              {/* Catch all - redirect to home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
