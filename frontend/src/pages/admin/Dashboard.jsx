import React, { useMemo, useState, useEffect, useRef } from 'react';
import StatCard from '../../components/StatCard';
import ChartBox from '../../components/ChartBox';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { Box, Grid, Paper, Typography, Fade, Alert, Button, Chip, Card, CardContent } from '@mui/material';
import AssignmentIcon from '@mui/icons-material/Assignment';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import PeopleIcon from '@mui/icons-material/People';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import ComplaintDetailsModal from '../../components/ComplaintDetailsModal';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { LineChart, DoughnutChart } from '../../components/ExtraCharts';
import { useComplaints } from '../../hooks/useComplaints';
import { useUsers } from '../../hooks/useUsers';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { CircularProgress, List, ListItem, ListItemText, ListItemAvatar, Avatar, Divider, Chip as MuiChip, IconButton } from '@mui/material';
import HistoryIcon from '@mui/icons-material/History';

function formatComplaintDate(dateStr) {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now - date;
  const diffMins = diffMs / 60000;
  if (diffMins < 5) return 'Now';
  if (now.toDateString() === date.toDateString()) return 'Today';
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (yesterday.toDateString() === date.toDateString()) return 'Yesterday';
  return dateStr;
}

const statusColors = {
  Pending: 'warning',
  'In Progress': 'info',
  Resolved: 'success',
  Rejected: 'error',
};

const priorityColors = {
  High: 'error',
  Medium: 'warning',
  Low: 'info',
  Urgent: 'secondary',
};

const statusBgColors = {
  'Pending': '#fff3cd',
  'In Progress': '#d1ecf1',
  'Resolved': '#d4edda',
  'Rejected': '#f8d7da',
};

const pieColors = ['#1976d2', '#00bcd4', '#ff9800', '#4caf50', '#f44336'];

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { complaints, loading: complaintsLoading, error: complaintsError } = useComplaints();
  const { users, stats: userStats, loading: usersLoading, error: usersError } = useUsers();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [statusMap, setStatusMap] = useState({});
  const [recentLogs, setRecentLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(true);
  const intervalRef = useRef(null);
  const isMounted = useRef(true);

  const loading = complaintsLoading || usersLoading;
  const error = complaintsError || usersError;

  // Pie chart: Complaints by Department
  const complaintsByDept = useMemo(() => {
    const map = {};
    complaints.forEach(c => {
      map[c.department] = (map[c.department] || 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [complaints]);

  // Bar chart: Complaints by Status
  const complaintsByStatus = useMemo(() => {
    const map = {};
    complaints.forEach(c => {
      map[c.status] = (map[c.status] || 0) + 1;
    });
    return Object.entries(map).map(([status, count]) => ({ status, count }));
  }, [complaints]);

  // Recent complaints (latest 5)
  const recentComplaints = useMemo(() => {
    return [...complaints].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);
  }, [complaints]);

  // Recent users (latest 5)
  const recentUsers = useMemo(() => {
    return [...users].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);
  }, [users]);

  // Initialize status map - fixed dependency
  useEffect(() => {
    if (recentComplaints.length > 0) {
      setStatusMap(Object.fromEntries(recentComplaints.map(c => [c.id, c.status])));
    }
  }, [recentComplaints]);

  // Helper to render action text based on role
  function getRoleActionText(log) {
    const action = (log.friendlyAction || log.action) || '';
    const role = log.user?.role;
    if (/user logged in/i.test(action)) {
      return role === 'admin' ? 'Admin logged in' : 'Employee logged in';
    }
    if (/user logged out/i.test(action)) {
      return role === 'admin' ? 'Admin logged out' : 'Employee logged out';
    }
    if (/user registered/i.test(action)) {
      return role === 'admin' ? 'Admin registered' : 'Employee registered';
    }
    if (/user created/i.test(action)) {
      return role === 'admin' ? 'Admin created' : 'Employee created';
    }
    if (/user updated/i.test(action)) {
      return role === 'admin' ? 'Admin updated' : 'Employee updated';
    }
    if (/user deleted/i.test(action)) {
      return role === 'admin' ? 'Admin deleted' : 'Employee deleted';
    }
    if (role === 'user') {
      return action.replace(/\buser\b/gi, 'employee');
    }
    return action;
  }

  // Fetch recent logs (limit 5)
  const fetchRecentLogs = async () => {
    setLogsLoading(true);
    try {
      const response = await logsAPI.getAll({}, 1, 5);
      if (isMounted.current) setRecentLogs(response.logs || []);
    } catch (err) {
      if (isMounted.current) setRecentLogs([]);
    } finally {
      if (isMounted.current) setLogsLoading(false);
    }
  };

  useEffect(() => {
    isMounted.current = true;
    fetchRecentLogs();
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(fetchRecentLogs, 5000); // Poll every 5s
    return () => {
      isMounted.current = false;
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const statCards = useMemo(() => [
    {
      label: 'Total Complaints',
      icon: <AssignmentIcon fontSize="large" />, 
      value: complaints.length, 
      color: 'primary.main',
    },
    {
      label: 'Pending',
      icon: <HourglassEmptyIcon fontSize="large" />, 
      value: complaints.filter(c => c.status === 'Pending').length, 
      color: 'warning.main',
    },
    {
      label: 'In Progress',
      icon: <AutorenewIcon fontSize="large" />, 
      value: complaints.filter(c => c.status === 'In Progress').length, 
      color: 'info.main',
    },
    {
      label: 'Resolved',
      icon: <CheckCircleIcon fontSize="large" />, 
      value: complaints.filter(c => c.status === 'Resolved').length, 
      color: 'success.main',
    },
    {
      label: 'Total Users',
      icon: <PeopleIcon fontSize="large" />, 
      value: userStats?.total || users.length, 
      color: 'secondary.main',
    },
  ], [complaints, userStats, users]);

  const handleViewDetails = (complaint) => {
    setSelectedComplaint(complaint);
    setModalOpen(true);
  };
  
  const handleCloseModal = () => setModalOpen(false);
  
  const handleStatusChange = (id, newStatus) => {
    setStatusMap(prev => ({ ...prev, [id]: newStatus }));
    toast.success(`Status updated to "${newStatus}"!`);
  };

  const handleNavigateToUsers = () => {
    navigate('/admin/users');
  };

  const getRoleColor = (role) => {
    return role === 'admin' ? 'error' : 'primary';
  };

  const getStatusColor = (isActive) => {
    return isActive ? 'success' : 'error';
  };

  if (loading) {
    return <LoadingSpinner message="Loading dashboard data..." />;
  }

  if (error) {
    return (
      <Box sx={{ p: { xs: 2, md: 4 } }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, width: '100%' }}>
      {/* Metric Cards Row (Grid, match user dashboard) */}
      <Grid
        container
        spacing={1.5}
        sx={{
          mb: 4,
          flexWrap: { xs: 'wrap', md: 'nowrap' },
          justifyContent: { xs: 'center', md: 'flex-start' },
          alignItems: 'stretch',
        }}
      >
        {statCards.map((card, idx) => (
          <Grid
            key={card.label}
            item
            xs={12}
            sm={6}
            md={2.4}
            sx={{
              display: 'flex',
              justifyContent: 'center',
              minWidth: 180,
              maxWidth: 240,
              flex: 1,
              p: 0,
            }}
          >
            <StatCard {...card} />
          </Grid>
        ))}
      </Grid>

      {/* Charts Row - 3 square charts, responsive */}
      <Grid container spacing={3} mb={4} sx={{ justifyContent: 'center', alignItems: 'stretch', width: '100%', m: 0, flexWrap: 'wrap' }}>
        <Grid sx={{ display: 'flex', justifyContent: 'center', maxWidth: 300, flex: 1, ml: 0 }}>
          <ChartBox title="Complaints by Department">
            <PieChart width={260} height={260}>
              <Pie
                data={complaintsByDept}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {complaintsByDept.map((entry, idx) => (
                  <Cell key={`cell-${idx}`} fill={pieColors[idx % pieColors.length]} />
                ))}
              </Pie>
              <Legend />
            </PieChart>
          </ChartBox>
        </Grid>
        <Grid sx={{ display: 'flex', justifyContent: 'center', maxWidth: 300, flex: 1 }}>
          <ChartBox title="Complaints by Status">
            <BarChart width={260} height={260} data={complaintsByStatus} barSize={40}>
              <XAxis dataKey="status" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#1976d2" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ChartBox>
        </Grid>
        <Grid sx={{ display: 'flex', justifyContent: 'center', maxWidth: 300, flex: 1 }}>
          <ChartBox title="Priority Distribution">
            <DoughnutChart data={complaints} width={260} height={260} />
          </ChartBox>
        </Grid>
      </Grid>

      {/* Recent Logs Section */}
      <Box sx={{ mb: 4, mt: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" sx={{ color: '#1976d2', fontWeight: 600, textAlign: 'center', width: '100%' }}>
            Recent Users
          </Typography>
        </Box>
        <Grid container spacing={2}>
          {recentUsers.length > 0 ? (
            recentUsers.map((user) => (
              <Grid item xs={12} sm={6} md={4} key={user._id}>
                <Card sx={{ 
                  borderRadius: 2, 
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  border: '1px solid #f0f0f0',
                  '&:hover': {
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    transform: 'translateY(-2px)',
                    transition: 'all 0.2s ease-in-out'
                  }
                }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar 
                        sx={{ 
                          bgcolor: user.role === 'admin' ? 'error.main' : 'primary.main',
                          mr: 2,
                          width: 48,
                          height: 48
                        }}
                      >
                        {user.name.charAt(0).toUpperCase()}
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                          {user.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {user.email}
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                      <Chip 
                        label={user.role} 
                        color={getRoleColor(user.role)}
                        size="small"
                        variant="outlined"
                      />
                      <Chip 
                        label={user.isActive ? 'Active' : 'Inactive'} 
                        color={getStatusColor(user.isActive)}
                        size="small"
                        variant="outlined"
                      />
                    </Box>
                    {user.department && (
                      <Typography variant="body2" color="text.secondary">
                        Department: {user.department}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))
          ) : (
            <Grid item xs={12}>
              <EmptyState 
                title="No Users Found"
                message="No users have been created yet."
                icon={<PeopleIcon />}
              />
            </Grid>
          )}
        </Grid>
      </Box>

      <ComplaintDetailsModal open={modalOpen} onClose={handleCloseModal} complaint={selectedComplaint} />
      <ToastContainer position="top-right" autoClose={2000} hideProgressBar />
    </Box>
  );
}
