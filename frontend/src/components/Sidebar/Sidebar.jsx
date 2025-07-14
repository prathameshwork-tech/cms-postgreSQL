import React from 'react';
import { Drawer, Box, Typography, Divider, Button, List } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ListAltIcon from '@mui/icons-material/ListAlt';
import PeopleIcon from '@mui/icons-material/People';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import BusinessIcon from '@mui/icons-material/Business';
import SidebarItem from '../SidebarItem';
import { useLocation, useNavigate } from 'react-router-dom';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { useAuth } from '../../context/AuthContext';

const drawerWidth = 220;

const navItems = [
  { label: 'Dashboard', icon: <DashboardIcon />, path: '/admin' },
  { label: 'Complaints', icon: <ListAltIcon />, path: '/admin/complaints' },
  { label: 'User Management', icon: <PeopleIcon />, path: '/admin/users' },
  { label: 'Logs', icon: <ReceiptLongIcon />, path: '/admin/logs' },
  { label: 'Settings', icon: <SettingsIcon />, path: '/admin/settings' },
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  // Filter navigation items based on user role
  const filteredNavItems = user?.role === 'admin' 
    ? navItems 
    : navItems.filter(item => item.label !== 'User Management' && item.label !== 'Logs');

  const handleLogout = () => {
    logout();
    navigate('/home');
  };

  const handleNavigation = (path) => {
    console.log('Navigating to:', path);
    navigate(path, { replace: true });
  };

  // Check if item is active
  const isActive = (itemPath) => {
    if (itemPath === '/admin') {
      // For dashboard, check if we're at /admin or /admin/
      return location.pathname === '/admin' || location.pathname === '/admin/';
    }
    return location.pathname === itemPath;
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        overflowX: 'hidden',
        [`& .MuiDrawer-paper`]: {
          width: drawerWidth,
          minWidth: drawerWidth,
          maxWidth: drawerWidth,
          boxSizing: 'border-box',
          background: '#fff',
          borderRight: 'none',
          boxShadow: '2px 0 8px rgba(0,0,0,0.04)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          overflowX: 'hidden',
        },
      }}
    >
      <Box>
        {/* Logo and App Name */}
        <Box sx={{ p: 1.2, pb: 2.5, minHeight: 41, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 0.1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <BusinessIcon sx={{ fontSize: 28, color: '#1976d2' }} />
            <Typography variant="h6" fontWeight={700} color="primary.main" sx={{ fontSize: 18, letterSpacing: 1 }}>
              TechCorp
            </Typography>
          </Box>
          <Typography variant="caption" color="text.secondary" sx={{ ml: 4, mt: 0 }}>
            {user?.role === 'admin' ? 'Admin Portal' : 'User Portal'}
          </Typography>
        </Box>
        <Divider />
        {/* Navigation */}
        <List sx={{ flexGrow: 0, mt: 1, mb: 0 }}>
          {filteredNavItems.map((item) => (
            <SidebarItem
              key={item.label}
              icon={item.icon}
              label={item.label}
              selected={isActive(item.path)}
              onClick={() => handleNavigation(item.path)}
            />
          ))}
        </List>
      </Box>
      <Box sx={{ width: '100%', px: 2, pb: 1, pt: 0 }}>
        <Button
          variant="contained"
          color="error"
          startIcon={<LogoutIcon />}
          fullWidth
          onClick={handleLogout}
          sx={{
            mb: 1,
            fontWeight: 700,
            fontSize: 18,
            borderRadius: 3,
            boxShadow: '0 2px 8px rgba(220,0,78,0.10)',
            py: 1.2,
            mt: 2,
            letterSpacing: 0.5,
            transition: 'background 0.2s, box-shadow 0.2s',
            '&:hover': {
              backgroundColor: '#b71c1c',
              boxShadow: '0 4px 16px rgba(220,0,78,0.18)'
            }
          }}
        >
          Logout
        </Button>
        <Typography variant="caption" color="text.secondary" align="left" display="block" sx={{ mt: 1 }}>
          v1.0.0 &copy; {new Date().getFullYear()} Foresight
        </Typography>
      </Box>
    </Drawer>
  );
} 