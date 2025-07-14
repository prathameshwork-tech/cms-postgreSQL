import Log from '../models/Log.js';

export const getAllLogs = async (req, res, next) => {
  try {
    const logs = await Log.find().populate('user', 'name email role');
    res.json(logs);
  } catch (err) {
    next(err);
  }
};

export const getLogById = async (req, res, next) => {
  try {
    const log = await Log.findById(req.params.id).populate('user', 'name email role');
    if (!log) return res.status(404).json({ message: 'Log not found' });
    res.json(log);
  } catch (err) {
    next(err);
  }
};

export const createLog = async (req, res, next) => {
  try {
    const log = await Log.create(req.body);
    res.status(201).json(log);
  } catch (err) {
    next(err);
  }
};

export const updateLog = async (req, res, next) => {
  try {
    const log = await Log.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!log) return res.status(404).json({ message: 'Log not found' });
    res.json(log);
  } catch (err) {
    next(err);
  }
};

export const deleteLog = async (req, res, next) => {
  try {
    const log = await Log.findByIdAndDelete(req.params.id);
    if (!log) return res.status(404).json({ message: 'Log not found' });
    res.json({ message: 'Log deleted' });
  } catch (err) {
    next(err);
  }
}; 