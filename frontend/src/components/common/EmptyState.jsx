import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import InboxIcon from '@mui/icons-material/Inbox';

export default function EmptyState({ 
  title = 'No Data Found', 
  message = 'There are no items to display at the moment.',
  actionText,
  onAction,
  icon = <InboxIcon sx={{ fontSize: 60, color: 'text.secondary' }} />
}) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 300,
        gap: 2,
        p: 4,
      }}
    >
      {icon}
      <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 600 }}>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary" align="center" sx={{ maxWidth: 400 }}>
        {message}
      </Typography>
      {actionText && onAction && (
        <Button
          variant="contained"
          onClick={onAction}
          sx={{ mt: 2 }}
        >
          {actionText}
        </Button>
      )}
    </Box>
  );
} 