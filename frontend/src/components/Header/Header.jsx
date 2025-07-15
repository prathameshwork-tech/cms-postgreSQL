import React, { useState, useEffect } from 'react';
import { Box, Typography, Avatar, Chip, IconButton, Badge, Menu, MenuItem, TextField } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import LogoutIcon from '@mui/icons-material/Logout';
import SettingsIcon from '@mui/icons-material/Settings';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { complaintsAPI } from '../../utils/api.js';

function getCurrentDate() {
  const options = { month: 'long', day: 'numeric' };
  return new Date().toLocaleDateString(undefined, options);
}

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  // For avatar menu
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationAnchor, setNotificationAnchor] = useState(null);
  const [urgentComplaints, setUrgentComplaints] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  
  const open = Boolean(anchorEl);
  const notificationOpen = Boolean(notificationAnchor);
  
  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);
  const handleNotificationOpen = (event) => setNotificationAnchor(event.currentTarget);
  const handleNotificationClose = () => setNotificationAnchor(null);
  
  const handleLogout = () => {
    logout();
    navigate('/home');
    handleMenuClose();
  };

  // Fetch urgent complaints for notifications
  const fetchUrgentComplaints = async () => {
    if (user?.role !== 'admin') return;
    
    try {
      setLoadingNotifications(true);
      const response = await complaintsAPI.getUrgent();
      if (response.success) {
        setUrgentComplaints(response.data);
      }
    } catch (error) {
      console.error('Error fetching urgent complaints:', error);
    } finally {
      setLoadingNotifications(false);
    }
  };

  // Fetch urgent complaints on component mount and every 30 seconds
  useEffect(() => {
    if (user?.role === 'admin') {
      // Add a small delay to ensure authentication is complete
      const timer = setTimeout(() => {
        fetchUrgentComplaints();
      }, 1000);
      
      const interval = setInterval(fetchUrgentComplaints, 30000); // 30 seconds
      return () => {
        clearTimeout(timer);
        clearInterval(interval);
      };
    }
  }, [user?.role]);

  // Filter urgent complaints for notifications
  const filteredUrgentComplaints = urgentComplaints.filter(
    c => (c.priority === 'High' || c.priority === 'Critical') &&
         (c.status === 'Pending' || c.status === 'In Progress')
  );
  const urgentCount = filteredUrgentComplaints.length;

  const formatNotificationTime = (date) => {
    if (!date) return 'Unknown time';
    
    const complaintDate = new Date(date);
    const now = new Date();
    const diffInMs = now - complaintDate;
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInMinutes < 1) return 'now';
    else if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
    else if (diffInHours < 24) return `${diffInHours} hr${diffInHours > 1 ? 's' : ''} ago`;
    else if (diffInDays < 2) return 'yesterday';
    else return complaintDate.toLocaleDateString();
  };

  return (
    <Box sx={{
      display: 'flex',
      alignItems: { xs: 'flex-start', sm: 'center' },
      justifyContent: 'space-between',
      flexDirection: { xs: 'column', sm: 'row' },
      py: 1.5,
      px: { xs: 2, md: 4 },
      background: '#fff',
      borderBottom: '1px solid #f0f0f0',
      boxShadow: 1,
      gap: { xs: 1, sm: 0 },
      minHeight: 56,
    }}>
      {/* Left: Greeting and subtitle */}
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', flex: 1 }}>
        <Typography variant="h6" fontWeight={600} sx={{ mb: 0.2, color: '#1976d2' }}>
          Welcome, {user?.name || 'User'} <span role="img" aria-label="wave">👋</span>
        </Typography>
        <Typography variant="subtitle2" color="text.secondary">
          {urgentCount} urgent complaint{urgentCount !== 1 ? 's' : ''} pending
        </Typography>
      </Box>
      
      {/* Right: Search, notifications, avatar, chip */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap', mt: { xs: 1, sm: 0 } }}>
        {/* Search Bar */}
        <TextField
          size="small"
          variant="outlined"
          placeholder="Search complaints, employees..."
          sx={{
            background: '#f7f7f7',
            borderRadius: 2,
            minWidth: { xs: 120, sm: 220 },
            '& .MuiOutlinedInput-root': { borderRadius: 2 },
          }}
          InputProps={{
            startAdornment: (
              <SearchIcon sx={{ color: 'text.secondary', fontSize: 20, mr: 1 }} />
            ),
          }}
        />
        
        {/* Notification Icon */}
        <IconButton 
          color="primary" 
          sx={{ ml: 0.5 }}
          onClick={handleNotificationOpen}
        >
          <Badge badgeContent={urgentCount} color="error" overlap="circular">
            <NotificationsNoneIcon />
          </Badge>
        </IconButton>
        
        {/* Notifications Menu */}
        <Menu 
          anchorEl={notificationAnchor} 
          open={notificationOpen} 
          onClose={handleNotificationClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          PaperProps={{
            sx: { minWidth: 350, maxHeight: 400 }
          }}
        >
          <Box sx={{ p: 2, borderBottom: '1px solid #f0f0f0' }}>
            <Typography variant="subtitle2" fontWeight={600}>
              Urgent Complaints ({urgentCount})
            </Typography>
          </Box>
          {loadingNotifications ? (
            <MenuItem disabled>
              <Typography variant="body2" color="text.secondary">
                Loading notifications...
              </Typography>
            </MenuItem>
          ) : urgentCount > 0 ? (
            filteredUrgentComplaints.map((complaint) => (
              <MenuItem key={complaint.id} sx={{ py: 1.5, px: 2 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                  <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 600 }}>
                    {complaint.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5 }}>
                    By: {complaint.submittedBy?.name || 'Unknown User'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formatNotificationTime(complaint.createdAt)}
                  </Typography>
                </Box>
              </MenuItem>
            ))
          ) : (
            <MenuItem disabled>
              <Typography variant="body2" color="text.secondary">
                No urgent complaints
              </Typography>
            </MenuItem>
          )}
        </Menu>
        
        {/* Avatar (static image, no dropdown) */}
        <Box>
          <Avatar
            src="https://randomuser.me/api/portraits/men/32.jpg"
            sx={{ width: 32, height: 32, bgcolor: '#1976d2', fontWeight: 700 }}
          />
        </Box>
        
        {/* Role Chip */}
        <Chip 
          label={`${user?.role === 'admin' ? 'Admin' : 'Employee'} Panel v1.0`}
          size="small" 
          sx={{ 
            background: user?.role === 'admin' ? '#e3f2fd' : '#f3e5f5', 
            color: user?.role === 'admin' ? '#1976d2' : '#7b1fa2', 
            fontWeight: 600, 
            ml: 0.5 
          }} 
        />
      </Box>
    </Box>
  );
} 