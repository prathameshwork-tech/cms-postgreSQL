import React from 'react';
import { TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Chip, Box, IconButton, Select, MenuItem } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';

export default function ComplaintsTable({ recentComplaints, statusMap, handleStatusChange, handleViewDetails, handleDeleteComplaint, formatComplaintDate, priorityColors, statusBgColors, sx }) {
  const statusOptions = [
    { value: 'Pending', color: '#fff3cd', text: 'Pending' },
    { value: 'In Progress', color: '#d1ecf1', text: 'In Progress' },
    { value: 'Resolved', color: '#d4edda', text: 'Resolved' },
    { value: 'Rejected', color: '#f8d7da', text: 'Rejected' },
  ];
  return (
    <TableContainer sx={{ width: '100%', overflowX: 'auto', ...sx }}>
      <Table size="small" sx={{ minWidth: 900 }}>
        <TableHead>
          <TableRow sx={{ background: '#f7f7f7' }}>
            <TableCell sx={{ fontWeight: 700, color: '#222', py: 1 }}>ID</TableCell>
            <TableCell sx={{ fontWeight: 700, color: '#222', py: 1 }}>Title</TableCell>
            <TableCell sx={{ fontWeight: 700, color: '#222', py: 1 }}>Department</TableCell>
            <TableCell sx={{ fontWeight: 700, color: '#222', py: 1 }}>Status</TableCell>
            <TableCell sx={{ fontWeight: 700, color: '#222', py: 1 }}>Date</TableCell>
            <TableCell sx={{ fontWeight: 700, color: '#222', py: 1 }}>Priority</TableCell>
            <TableCell sx={{ fontWeight: 700, color: '#222', py: 1 }}>Action</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {recentComplaints.map((row) => (
            <TableRow key={row._id}>
              <TableCell sx={{ py: 1 }}>{row._id}</TableCell>
              <TableCell sx={{ py: 1 }}>{row.title}</TableCell>
              <TableCell sx={{ py: 1 }}>{row.department}</TableCell>
              <TableCell sx={{ py: 1 }}>
                <Select
                  value={statusMap[row._id] || row.status}
                  onChange={e => handleStatusChange(row._id, e.target.value)}
                  size="small"
                  variant="outlined"
                  sx={{
                    background: statusBgColors[statusMap[row._id] || row.status],
                    color: '#222',
                    fontWeight: 600,
                    borderRadius: 2,
                    px: 1.5,
                    fontSize: 14,
                    height: 28,
                    minWidth: 100,
                  }}
                  MenuProps={{
                    PaperProps: {
                      style: {
                        minWidth: 120,
                      },
                    },
                  }}
                >
                  {statusOptions.map(option => (
                    <MenuItem key={option.value} value={option.value} sx={{ background: option.color, color: '#222', fontWeight: 600 }}>
                      {option.text}
                    </MenuItem>
                  ))}
                </Select>
              </TableCell>
              <TableCell sx={{ py: 1 }}>{formatComplaintDate(row.createdAt)}</TableCell>
              <TableCell sx={{ py: 1 }}>
                <Chip label={row.priority} color={priorityColors[row.priority]} size="small" sx={{ borderRadius: 2, fontWeight: 700, px: 1, fontSize: 12, height: 24, width: 80, justifyContent: 'center' }} />
              </TableCell>
              <TableCell sx={{ py: 1 }}>
                <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                  <IconButton color="primary" onClick={() => handleViewDetails(row)}>
                    <VisibilityIcon />
                  </IconButton>
                  <IconButton color="error" onClick={() => handleDeleteComplaint(row._id)}>
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
} 