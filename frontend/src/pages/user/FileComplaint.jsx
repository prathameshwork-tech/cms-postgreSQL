import React, { useState } from 'react';
import { Box, Typography, Card, CardContent, TextField, Button, Select, MenuItem, FormControl, InputLabel, Alert, CircularProgress } from '@mui/material';
import { useForm } from 'react-hook-form';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useComplaints } from '../../hooks/useComplaints';

export default function FileComplaint() {
  const [success, setSuccess] = useState(false);
  const [titleValue, setTitleValue] = useState('');
  const [descValue, setDescValue] = useState('');
  const TITLE_MAX = 60;
  const DESC_MAX = 500;
  const DESC_MIN = 15;
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const { createComplaint, loading } = useComplaints();

  const departments = ['IT', 'HR', 'Facilities', 'Finance', 'Marketing', 'Operations'];
  const priorities = ['Low', 'Medium', 'High', 'Critical'];

  // Reset form completely
  const resetForm = () => {
    reset();
    setTitleValue('');
    setDescValue('');
  };

  const onSubmit = async (data) => {
    if (data.description.length < DESC_MIN) return;
    
    try {
      const complaintData = {
        title: data.title,
        description: data.description,
        department: data.department,
        priority: data.priority,
        category: 'General', // Default category
        contact: data.contact || ''
      };

      const result = await createComplaint(complaintData);
      
      if (result.success) {
        setSuccess(true);
        resetForm(); // Use the reset function
        toast.success('Complaint filed successfully!');
        setTimeout(() => setSuccess(false), 3000);
      } else {
        toast.error(result.message || 'Failed to file complaint');
      }
    } catch (error) {
      console.error('Error filing complaint:', error);
      toast.error('Failed to file complaint. Please try again.');
    }
  };

  return (
    <Box sx={{ 
      p: { xs: 2, md: 4 }, 
      pt: 0, 
      mt: 0, 
      width: '100%', 
      maxWidth: 600, 
      mx: 'auto',
      minHeight: '100vh',
      background: '#f5f5f5'
    }}>
      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Your complaint has been filed successfully! We'll review it and get back to you soon.
        </Alert>
      )}

      <Card sx={{ 
        borderRadius: 3, 
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        background: '#fff',
        border: '1px solid #f0f0f0'
      }}>
        <CardContent sx={{ p: { xs: 2, md: 4 } }}>
          <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              label="Complaint Title"
              {...register('title', { 
                required: 'Title is required',
                minLength: { value: 5, message: 'Title must be at least 5 characters' },
                maxLength: { value: TITLE_MAX, message: `Title cannot exceed ${TITLE_MAX} characters` }
              })}
              error={!!errors.title}
              helperText={errors.title?.message}
              fullWidth
              placeholder="Brief description of the issue"
              inputProps={{ maxLength: TITLE_MAX }}
              value={titleValue}
              onChange={e => setTitleValue(e.target.value)}
            />
            <Typography variant="caption" color="text.secondary" sx={{ alignSelf: 'flex-end', mb: -2, mt: -1 }}>
              {TITLE_MAX - titleValue.length} characters left
            </Typography>

            <TextField
              label="Detailed Description"
              {...register('description', { 
                required: 'Description is required',
                minLength: { value: DESC_MIN, message: `Description must be at least ${DESC_MIN} characters` },
                maxLength: { value: DESC_MAX, message: `Description cannot exceed ${DESC_MAX} characters` }
              })}
              error={!!errors.description || descValue.length < DESC_MIN}
              helperText={errors.description?.message || (descValue.length < DESC_MIN ? `Description must be at least ${DESC_MIN} characters` : '')}
              fullWidth
              multiline
              rows={4}
              placeholder="Please provide detailed information about the issue..."
              inputProps={{ maxLength: DESC_MAX }}
              value={descValue}
              onChange={e => setDescValue(e.target.value)}
            />
            <Typography variant="caption" color={descValue.length < DESC_MIN ? 'error' : 'text.secondary'} sx={{ alignSelf: 'flex-end', mb: -2, mt: -1 }}>
              {descValue.length}/{DESC_MAX} characters ({DESC_MAX - descValue.length} left)
            </Typography>

            <FormControl fullWidth error={!!errors.department}>
              <InputLabel>Department</InputLabel>
              <Select
                {...register('department', { required: 'Department is required' })}
                label="Department"
                defaultValue=""
              >
                <MenuItem value="" disabled>Select Department</MenuItem>
                {departments.map((dept) => (
                  <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                ))}
              </Select>
              {errors.department && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                  {errors.department.message}
                </Typography>
              )}
            </FormControl>

            <FormControl fullWidth error={!!errors.priority}>
              <InputLabel>Priority</InputLabel>
              <Select
                {...register('priority', { required: 'Priority is required' })}
                label="Priority"
                defaultValue=""
              >
                <MenuItem value="" disabled>Select Priority</MenuItem>
                {priorities.map((priority) => (
                  <MenuItem key={priority} value={priority}>{priority}</MenuItem>
                ))}
              </Select>
              {errors.priority && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                  {errors.priority.message}
                </Typography>
              )}
            </FormControl>

            <TextField
              label="Contact Information (Optional)"
              {...register('contact')}
              fullWidth
              placeholder="Phone number or additional contact info"
            />

            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <Button 
                type="button" 
                variant="outlined" 
                onClick={resetForm}
                disabled={loading}
                sx={{ flex: 1 }}
              >
                Clear Form
              </Button>
              <Button 
                type="submit" 
                variant="contained" 
                disabled={loading}
                sx={{ flex: 1 }}
              >
                {loading ? <CircularProgress size={24} /> : 'Submit Complaint'}
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
      <ToastContainer position="top-right" />
    </Box>
  );
}
