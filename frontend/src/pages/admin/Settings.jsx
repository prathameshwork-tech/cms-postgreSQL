import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, Typography } from '@mui/material';
import { useForm } from 'react-hook-form';
import { usersAPI } from '../../utils/api';

export default function Settings() {
  const { register, handleSubmit, reset, formState: { errors, isDirty }, getValues } = useForm({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    }
  });
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [superadmin, setSuperadmin] = useState(null);
  const [loadingSuperadmin, setLoadingSuperadmin] = useState(true);
  const [superadminError, setSuperadminError] = useState('');

  useEffect(() => {
    async function fetchSuperadmin() {
      setLoadingSuperadmin(true);
      setSuperadminError('');
      try {
        const res = await usersAPI.getAll({ email: 'admin@techcorp.com' });
        if (res.success && res.data.length > 0) {
          setSuperadmin(res.data[0]);
        } else {
          setSuperadmin(null);
          setSuperadminError('System Administrator not found.');
        }
      } catch (err) {
        setSuperadminError('Failed to load System Administrator info.');
      } finally {
        setLoadingSuperadmin(false);
      }
    }
    fetchSuperadmin();
  }, []);

  // In the onSubmit handler, call the new superadmin password change endpoint
  const onSubmit = async (data) => {
    setError('');
    setSuccess(false);
    setLoading(true);
    try {
      const result = await usersAPI.superadminChangePassword({
        email: 'admin@techcorp.com',
        currentPassword: data.currentPassword,
        newPassword: data.newPassword
      });
      if (result.success) {
        setSuccess(true);
        reset();
      } else {
        setError(result.message || 'Failed to change password');
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
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
      {/* System Administrator Info */}
      <Box sx={{ mb: 3, background: '#f7f7f7', borderRadius: 2, p: 2, border: '1px solid #e0e0e0' }}>
        <Typography variant="subtitle2" color="primary.main" sx={{ fontWeight: 700 }}>System Administrator</Typography>
        <Typography><strong>Email:</strong> admin@techcorp.com</Typography>
      </Box>
    </Box>
  );
}
