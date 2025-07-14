import React from 'react';
import { ListItem, ListItemIcon, ListItemText } from '@mui/material';

export default function SidebarItem({ icon, label, selected, onClick }) {
  return (
    <ListItem 
      selected={selected} 
      onClick={onClick}
      sx={{ 
        borderRadius: 2, 
        my: 1.7, 
        minHeight: 40, 
        px: 1.2, 
        py: 0.5,
        cursor: 'pointer',
        '&:hover': {
          backgroundColor: 'rgba(25, 118, 210, 0.08)',
        },
        '&.Mui-selected': {
          backgroundColor: 'rgba(25, 118, 210, 0.12)',
          '&:hover': {
            backgroundColor: 'rgba(25, 118, 210, 0.16)',
          },
        },
      }}
    >
      <ListItemIcon sx={{ color: selected ? 'primary.main' : 'inherit', minWidth: 32, mr: 0.5 }}>{icon}</ListItemIcon>
      <ListItemText primary={label} primaryTypographyProps={{ fontWeight: selected ? 700 : 500 }} />
    </ListItem>
  );
} 