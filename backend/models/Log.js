import mongoose from 'mongoose';

const logSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: [true, 'User is required']
  },
  action: { 
    type: String, 
    required: [true, 'Action is required'],
    enum: [
      'LOGIN', 'LOGOUT', 'REGISTER',
      'CREATE_COMPLAINT', 'UPDATE_COMPLAINT', 'DELETE_COMPLAINT',
      'ASSIGN_COMPLAINT', 'RESOLVE_COMPLAINT',
      'CREATE_USER', 'UPDATE_USER', 'DELETE_USER',
      'UPDATE_PROFILE', 'CHANGE_PASSWORD',
      'SYSTEM_ERROR', 'SYSTEM_WARNING', 'SYSTEM_INFO'
    ]
  },
  details: { 
    type: String,
    maxlength: [500, 'Details cannot be more than 500 characters']
  },
  level: { 
    type: String, 
    enum: ['INFO', 'WARNING', 'ERROR', 'CRITICAL'],
    default: 'INFO'
  },
  ipAddress: String,
  userAgent: String,
  resource: {
    type: { type: String, enum: ['COMPLAINT', 'USER', 'SYSTEM'] },
    id: mongoose.Schema.Types.ObjectId
  },
  metadata: {
    type: Map,
    of: String
  }
}, {
  timestamps: true
});

// Index for better query performance
logSchema.index({ createdAt: -1 });
logSchema.index({ user: 1, createdAt: -1 });
logSchema.index({ action: 1, createdAt: -1 });
logSchema.index({ level: 1, createdAt: -1 });

// Static method to create log entry
logSchema.statics.createLog = function(data) {
  return this.create({
    user: data.user,
    action: data.action,
    details: data.details,
    level: data.level || 'INFO',
    ipAddress: data.ipAddress,
    userAgent: data.userAgent,
    resource: data.resource,
    metadata: data.metadata
  });
};

// Static method to get logs with pagination
logSchema.statics.getLogs = function(filters = {}, page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  
  return this.find(filters)
    .populate('user', 'name email role')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

const Log = mongoose.model('Log', logSchema);
export default Log; 