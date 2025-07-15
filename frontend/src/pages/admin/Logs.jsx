import React, { useState, useEffect } from 'react';
import { Box, TextField, Select, MenuItem, InputAdornment, Button, Dialog, DialogTitle, DialogContent, DialogActions, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Typography, CircularProgress, Alert, Pagination, IconButton } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import DownloadIcon from '@mui/icons-material/Download';
import ClearIcon from '@mui/icons-material/Clear';
import { logsAPI } from '../../utils/api';

export default function Logs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const fetchLogs = async (pageNum = 1) => {
    try {
      setLoading(true);
      setError(null);
      const filters = {};
      if (roleFilter) filters.role = roleFilter;
      if (search) filters.search = search;
      if (fromDate) filters.fromDate = fromDate;
      if (toDate) filters.toDate = toDate;
      const response = await logsAPI.getAll(filters, pageNum, pageSize);
      setLogs(response.logs);
      setTotal(response.total);
      setPage(response.page);
      setPageSize(response.pageSize);
    } catch (err) {
      setError('Failed to fetch logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(page);
    // eslint-disable-next-line
  }, [page, roleFilter, search, fromDate, toDate]);

  function formatLogDate(dateStr) {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  }

  const actionIcons = {
    'LOGIN': '🔐',
    'LOGOUT': '🚪',
    'CREATE': '➕',
    'UPDATE': '✏️',
    'DELETE': '🗑️',
    'VIEW': '👁️',
    'EXPORT': '📤',
    'IMPORT': '📥',
  };

  // Helper to render action text based on role
  function getRoleActionText(log) {
    const action = (log.friendlyAction || log.action) || '';
    const role = log.user?.role;
    // Only for login/logout/register actions
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
    // For other actions, replace 'user' with 'employee' only if role is 'user'
    if (role === 'user') {
      return action.replace(/\buser\b/gi, 'employee');
    }
    return action;
  }

  const handleViewDetails = (log) => {
    setSelectedLog(log);
    setModalOpen(true);
  };

  const handleCloseModal = () => setModalOpen(false);

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, width: '100%', maxWidth: 1100, mx: 'auto' }}>
      {/* Top Bar */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, gap: 2, flexWrap: 'wrap' }}>
        <Box sx={{
          color: '#1976d2',
          fontWeight: 700,
          fontSize: 22,
          letterSpacing: 0.5,
          mb: 0,
        }}>
          Activity Logs
        </Box>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
          <TextField
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by User or Complaint ID..."
            size="small"
            variant="outlined"
            sx={{ minWidth: 220, background: '#f7f7f7', borderRadius: 2, '& .MuiOutlinedInput-root': { borderRadius: 2 }, mr: 1 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                </InputAdornment>
              ),
            }}
          />
          <Select
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
            displayEmpty
            size="small"
            variant="outlined"
            sx={{ minWidth: 140, background: '#f7f7f7', borderRadius: 2, '& .MuiOutlinedInput-notchedOutline': { borderColor: '#e0e0e0' }, '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#1976d2' } }}
          >
            <MenuItem value="">All Roles</MenuItem>
            <MenuItem value="user">Employee</MenuItem>
            <MenuItem value="admin">Admin</MenuItem>
          </Select>
          <TextField
            label="From"
            type="date"
            size="small"
            value={fromDate}
            onChange={e => setFromDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ minWidth: 140, background: '#f7f7f7', borderRadius: 2 }}
          />
          <TextField
            label="To"
            type="date"
            size="small"
            value={toDate}
            onChange={e => setToDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ minWidth: 140, background: '#f7f7f7', borderRadius: 2 }}
          />
          {(fromDate || toDate) && (
            <IconButton onClick={() => { setFromDate(''); setToDate(''); }} size="small" sx={{ ml: 1 }} title="Clear date filter">
              <ClearIcon />
            </IconButton>
          )}
        </Box>
      </Box>
      {/* Logs Table */}
      <Box sx={{ borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.10)', background: '#fff', border: '1px solid #f0f0f0', p: 4, mt: 4 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : (
          <>
            <TableContainer sx={{ maxHeight: 500 }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow sx={{ background: '#f7f7f7' }}>
                    <TableCell sx={{ fontWeight: 700, width: 40 }}>#</TableCell>
                    <TableCell sx={{ fontWeight: 700, minWidth: 180 }}>Timestamp</TableCell>
                    <TableCell sx={{ fontWeight: 700, minWidth: 160 }}>User</TableCell>
                    <TableCell sx={{ fontWeight: 700, minWidth: 80 }}>Role</TableCell>
                    <TableCell sx={{ fontWeight: 700, minWidth: 140 }}>Action</TableCell>
                    <TableCell sx={{ fontWeight: 700, minWidth: 120 }}>Details</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {logs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                        No logs found.
                      </TableCell>
                    </TableRow>
                  ) : logs.map((log, idx) => (
                    <TableRow key={log._id || log.id || idx} sx={{ background: idx % 2 === 1 ? '#fafbfc' : undefined }}>
                      <TableCell>{(page - 1) * pageSize + idx + 1}</TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>{formatLogDate(log.timestamp || log.createdAt)}</TableCell>
                      <TableCell>{log.user?.name || 'Unknown'}</TableCell>
                      <TableCell>
                        <Chip label={log.user?.role === 'admin' ? 'Admin' : log.user?.role === 'user' ? 'Employee' : 'N/A'} color={log.user?.role === 'admin' ? 'primary' : log.user?.role === 'user' ? 'secondary' : 'default'} size="small" sx={{ textTransform: 'capitalize', fontWeight: 700 }} />
                      </TableCell>
                      <TableCell>
                        <span style={{ marginRight: 6 }}>{actionIcons[(log.action || '').toUpperCase()] || '📝'}</span>
                        {getRoleActionText(log)}
                      </TableCell>
                      <TableCell>
                        <Button variant="outlined" size="small" onClick={() => handleViewDetails(log)} sx={{ fontWeight: 600, borderRadius: 2, px: 1.5, minWidth: 0, fontSize: 13, height: 28 }}>
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Pagination
                count={Math.ceil(total / pageSize)}
                page={page}
                onChange={(_, value) => setPage(value)}
                color="primary"
                shape="rounded"
                size="medium"
              />
            </Box>
          </>
        )}
      </Box>
      {/* Log Details Modal */}
      <Dialog open={modalOpen} onClose={handleCloseModal} maxWidth="sm" fullWidth>
        <DialogTitle>Log Details</DialogTitle>
        <DialogContent dividers>
          {selectedLog && (
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mt: 1 }}>
              <Box>
                <Typography variant="body2" color="text.secondary"><b>Action:</b></Typography>
                <Typography variant="body1" sx={{ mb: 1 }}><span style={{ marginRight: 6 }}>{actionIcons[(selectedLog.action || '').toUpperCase()] || '📝'}</span>{getRoleActionText(selectedLog)}</Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary"><b>Timestamp:</b></Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>{formatLogDate(selectedLog.timestamp || selectedLog.createdAt)}</Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary"><b>User:</b></Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>{selectedLog.user?.name || 'Unknown'}</Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary"><b>Role:</b></Typography>
                <Chip label={selectedLog.user?.role === 'admin' ? 'Admin' : selectedLog.user?.role === 'user' ? 'Employee' : 'N/A'} color={selectedLog.user?.role === 'admin' ? 'primary' : selectedLog.user?.role === 'user' ? 'secondary' : 'default'} size="small" sx={{ textTransform: 'capitalize', fontWeight: 700, ml: 0.5 }} />
              </Box>
              <Box sx={{ gridColumn: '1 / -1' }}>
                <Typography variant="body2" color="text.secondary"><b>Details:</b></Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>{selectedLog.details || 'N/A'}</Typography>
              </Box>
              {selectedLog.level && (
                <Box>
                  <Typography variant="body2" color="text.secondary"><b>Level:</b></Typography>
                  <Typography variant="body1" sx={{ mb: 1 }}>{selectedLog.level}</Typography>
                </Box>
              )}
              {selectedLog.ipAddress && (
                <Box>
                  <Typography variant="body2" color="text.secondary"><b>IP Address:</b></Typography>
                  <Typography variant="body1" sx={{ mb: 1 }}>{selectedLog.ipAddress}</Typography>
                </Box>
              )}
              {selectedLog.userAgent && (
                <Box sx={{ gridColumn: '1 / -1' }}>
                  <Typography variant="body2" color="text.secondary"><b>User Agent:</b></Typography>
                  <Typography variant="body1" sx={{ mb: 1 }}>{selectedLog.userAgent}</Typography>
                </Box>
              )}
              {selectedLog.resource && selectedLog.resource.type && (
                <Box>
                  <Typography variant="body2" color="text.secondary"><b>Resource:</b></Typography>
                  <Typography variant="body1" sx={{ mb: 1 }}>{selectedLog.resource.type} {selectedLog.resource.id ? `(${selectedLog.resource.id})` : ''}</Typography>
                </Box>
              )}
              {selectedLog.metadata && Object.keys(selectedLog.metadata).length > 0 && (
                <Box sx={{ gridColumn: '1 / -1' }}>
                  <Typography variant="body2" color="text.secondary"><b>Metadata:</b></Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 0.5 }}>
                    {Object.entries(selectedLog.metadata).map(([key, value]) => (
                      <Chip key={key} label={`${key}: ${value}`} size="small" variant="outlined" />
                    ))}
                  </Box>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} variant="contained">Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
