import { getModels } from '../config/db.js';

export const getAllLogs = async (req, res, next) => {
  try {
    const { Log, User } = getModels();
    // Pagination params
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = (page - 1) * limit;

    // Filtering (optional, keep same logic as before)
    const where = {};
    // Date range filter
    const { fromDate, toDate } = req.query;
    if (fromDate && toDate) {
      where.createdAt = { $between: [new Date(fromDate), new Date(toDate)] };
    } else if (fromDate) {
      where.createdAt = { $gte: new Date(fromDate) };
    } else if (toDate) {
      where.createdAt = { $lte: new Date(toDate) };
    }
    // Add more filters if needed

    // Fetch logs with pagination
    const { rows: logs, count: total } = await Log.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'role']
        }
      ],
      order: [['createdAt', 'DESC']],
      offset,
      limit
    });

    // Map action codes to user-friendly strings
    const actionMap = {
      CREATE_COMPLAINT: 'Complaint created',
      UPDATE_COMPLAINT: 'Complaint updated',
      DELETE_COMPLAINT: 'Complaint deleted',
      CREATE_USER: 'User created',
      UPDATE_USER: 'User updated',
      DELETE_USER: 'User deleted',
      LOGIN: 'User logged in',
      LOGOUT: 'User logged out',
      REGISTER: 'User registered',
      ASSIGN_COMPLAINT: 'Complaint assigned',
      RESOLVE_COMPLAINT: 'Complaint resolved',
      UPDATE_PROFILE: 'Profile updated',
      CHANGE_PASSWORD: 'Password changed',
      SYSTEM_ERROR: 'System error',
      SYSTEM_WARNING: 'System warning',
      SYSTEM_INFO: 'System info',
    };

    const logsWithFriendlyAction = logs.map(log => ({
      ...log.toJSON(),
      friendlyAction: actionMap[log.action] || log.action
    }));

    res.json({
      logs: logsWithFriendlyAction,
      total,
      page,
      pageSize: limit
    });
  } catch (err) {
    next(err);
  }
};

export const getLogById = async (req, res, next) => {
  try {
    const { Log, User } = getModels();
    const log = await Log.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'role']
        }
      ]
    });
    if (!log) return res.status(404).json({ message: 'Log not found' });
    res.json(log);
  } catch (err) {
    next(err);
  }
};

export const createLog = async (req, res, next) => {
  try {
    const { Log } = getModels();
    const log = await Log.create(req.body);
    res.status(201).json(log);
  } catch (err) {
    next(err);
  }
};

export const updateLog = async (req, res, next) => {
  try {
    const { Log } = getModels();
    const log = await Log.findByPk(req.params.id);
    if (!log) return res.status(404).json({ message: 'Log not found' });
    await log.update(req.body);
    res.json(log);
  } catch (err) {
    next(err);
  }
};

export const deleteLog = async (req, res, next) => {
  try {
    const { Log } = getModels();
    const log = await Log.findByPk(req.params.id);
    if (!log) return res.status(404).json({ message: 'Log not found' });
    await log.destroy();
    res.json({ message: 'Log deleted' });
  } catch (err) {
    next(err);
  }
}; 