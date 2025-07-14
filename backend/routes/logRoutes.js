import express from 'express';
import {
  getAllLogs,
  getLogById,
  createLog,
  updateLog,
  deleteLog
} from '../controllers/logController.js';

const router = express.Router();

router.get('/', getAllLogs);
router.get('/:id', getLogById);
router.post('/', createLog);
router.put('/:id', updateLog);
router.delete('/:id', deleteLog);

export default router; 