import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

const AuthRedirect = () => {
  const { isAuthenticated, loading, user } = useAuth();

  console.log('AuthRedirect - State:', { isAuthenticated, loading, user });

  if (loading) {
    console.log('AuthRedirect - Loading, showing spinner');
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    console.log('AuthRedirect - Not authenticated, redirecting to /home');
    // Redirect unauthenticated users to homepage
    return <Navigate to="/home" replace />;
  }

  // Redirect authenticated users to their appropriate dashboard
  if (user.role === 'admin') {
    console.log('AuthRedirect - Admin user, redirecting to /admin');
    return <Navigate to="/admin" replace />;
  } else {
    console.log('AuthRedirect - Regular user, redirecting to /user/dashboard');
    return <Navigate to="/user/dashboard" replace />;
  }
};

export default AuthRedirect; 