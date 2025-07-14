import React, { useState } from 'react';
import { Box, TextField, Button, Typography } from '@mui/material';
import { useForm } from 'react-hook-form';
import { usersAPI } from '../../utils/api';

export default function Settings() {
  const { register, handleSubmit, reset, formState: { errors, isDirty } } = useForm({
    defaultValues: {
      name: '',
      email: '',
      password: '',
    }
  });
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data) => {
    setError('');
    setSuccess(false);
    setLoading(true);
    try {
      const result = await usersAPI.create({ ...data, role: 'admin' });
      if (result.success) {
        setSuccess(true);
        reset();
      } else {
        setError(result.message || 'Failed to add admin');
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to add admin');
    } finally {
      setLoading(false);
      setTimeout(() => setSuccess(false), 2000);
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, width: '100%', maxWidth: 500, mx: 'auto' }}>
      <Box sx={{
        color: '#1976d2',
        fontWeight: 700,
        fontSize: 22,
        letterSpacing: 0.5,
        mb: 3,
      }}>
        Admin Settings
      </Box>
      <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ display: 'flex', flexDirection: 'column', gap: 2, background: '#fff', borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: '1px solid #f0f0f0', p: { xs: 2, md: 4 } }}>
        <TextField
          label="Name"
          {...register('name', { required: 'Name is required' })}
          error={!!errors.name}
          helperText={errors.name?.message}
          fullWidth
        />
        <TextField
          label="Email"
          type="email"
          {...register('email', { required: 'Email is required' })}
          error={!!errors.email}
          helperText={errors.email?.message}
          fullWidth
        />
        <TextField
          label="Password"
          type="password"
          {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Password must be at least 6 characters' } })}
          error={!!errors.password}
          helperText={errors.password?.message}
          fullWidth
        />
        <Button type="submit" variant="contained" disabled={!isDirty || loading} sx={{ mt: 1 }}>
          {loading ? 'Saving...' : 'Add Admin'}
        </Button>
        {success && <Typography color="success.main" sx={{ mt: 1 }}>Admin added successfully!</Typography>}
        {error && <Typography color="error.main" sx={{ mt: 1 }}>{error}</Typography>}
      </Box>
    </Box>
  );
}
