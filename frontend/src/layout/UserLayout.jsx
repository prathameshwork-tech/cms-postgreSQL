import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box, Container } from '@mui/material';
import UserSidebar from '../components/Sidebar/UserSidebar';
import UserHeader from '../components/Header/UserHeader';
import { useAuth } from '../context/AuthContext';

const UserLayout = () => {
  const { user } = useAuth();
  // Debug log
  console.log('UserLayout user:', user);
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <UserSidebar />
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <UserHeader />
        <Container maxWidth="xl" sx={{ flexGrow: 1, py: 3 }}>
          <Outlet />
        </Container>
      </Box>
    </Box>
  );
};

export default UserLayout; 