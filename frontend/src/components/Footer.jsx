import React from 'react';
import { Box, Typography, Paper, List, ListItem, ListItemText } from '@mui/material';

export default function Footer({ logs, versionLabel, sx }) {
  return (
    <Box sx={{ mt: 4, px: 2, position: 'relative', ...sx }}>
      <Paper sx={{ p: 2, mb: 2, borderRadius: 2, background: '#f9f9f9' }}>
        <Typography variant="subtitle2" fontWeight={600} mb={1}>
          Log File Preview
        </Typography>
        <List dense>
          {logs && logs.length > 0 ? (
            logs.map((line, idx) => (
              <ListItem key={idx} sx={{ py: 0.5 }}>
                <ListItemText primary={line} primaryTypographyProps={{ fontSize: 13, color: 'text.secondary' }} />
              </ListItem>
            ))
          ) : (
            <ListItem>
              <ListItemText primary="No logs available." />
            </ListItem>
          )}
        </List>
      </Paper>
      {versionLabel && (
        <Typography variant="caption" color="text.secondary" align="left" display="block" sx={{ position: 'absolute', left: 0, bottom: 0, pl: 2, pb: 1 }}>
          v1.0.0 &copy; {new Date().getFullYear()} Foresight
        </Typography>
      )}
    </Box>
  );
} 