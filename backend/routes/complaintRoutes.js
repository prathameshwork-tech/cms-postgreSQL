import express from 'express';
import { body } from 'express-validator';
import {
  getAllComplaints,
  getComplaintById,
  createComplaint,
  updateComplaint,
  deleteComplaint,
  updateComplaintStatus,
  addComment,
  getComplaintStats,
  getUrgentComplaints,
  autoEscalatePriority
} from '../controllers/complaintController.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Validation middleware
const validateComplaint = [
  body('title')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Title must be between 3 and 100 characters'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters'),
  body('category')
    .isIn(['Technical', 'Billing', 'Service', 'General', 'Other'])
    .withMessage('Invalid category'),
  body('priority')
    .isIn(['Low', 'Medium', 'High', 'Critical'])
    .withMessage('Invalid priority'),
  body('department')
    .trim()
    .notEmpty()
    .withMessage('Department is required')
];

const validateStatusUpdate = [
  body('status')
    .isIn(['Pending', 'In Progress', 'Resolved', 'Closed', 'Rejected'])
    .withMessage('Invalid status'),
  body('resolution')
    .optional()
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Resolution must be between 10 and 500 characters')
];

const validateComment = [
  body('comment')
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Comment must be between 1 and 500 characters')
];

// Apply authentication to all routes
router.use(authenticateToken);

// Public routes (authenticated users)
router.get('/', getAllComplaints);
router.post('/', validateComplaint, createComplaint);
router.get('/urgent', requireAdmin, getUrgentComplaints);
router.get('/stats', requireAdmin, getComplaintStats);
router.post('/auto-escalate', requireAdmin, autoEscalatePriority);

// Parameter routes (must come after specific routes)
router.get('/:id', getComplaintById);
router.put('/:id', validateComplaint, updateComplaint);
router.patch('/:id/status', validateStatusUpdate, updateComplaintStatus);
router.post('/:id/comments', validateComment, addComment);

// Admin only routes
router.delete('/:id', requireAdmin, deleteComplaint);

export default router; 