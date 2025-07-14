import mongoose from 'mongoose';

const complaintSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: { 
    type: String, 
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  category: { 
    type: String, 
    required: [true, 'Category is required'],
    enum: ['Technical', 'Billing', 'Service', 'General', 'Other']
  },
  priority: { 
    type: String, 
    required: [true, 'Priority is required'],
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium'
  },
  status: { 
    type: String, 
    enum: ['Pending', 'In Progress', 'Resolved', 'Closed', 'Rejected'],
    default: 'Pending'
  },
  submittedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: [true, 'User is required']
  },
  assignedTo: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User'
  },
  department: { 
    type: String, 
    required: [true, 'Department is required']
  },
  attachments: [{
    filename: String,
    originalName: String,
    url: String,
    uploadedAt: { type: Date, default: Date.now }
  }],
  comments: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    comment: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  }],
  resolution: {
    resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    resolvedAt: Date,
    resolution: String
  },
  tags: [String],
  estimatedResolutionTime: Date,
  actualResolutionTime: Date
}, {
  timestamps: true
});

// Index for better query performance
complaintSchema.index({ status: 1, priority: 1, createdAt: -1 });
complaintSchema.index({ submittedBy: 1, createdAt: -1 });
complaintSchema.index({ department: 1, status: 1 });

// Virtual for calculating resolution time
complaintSchema.virtual('resolutionTime').get(function() {
  if (this.resolution?.resolvedAt && this.createdAt) {
    return this.resolution.resolvedAt - this.createdAt;
  }
  return null;
});

// Method to add comment
complaintSchema.methods.addComment = function(userId, comment) {
  this.comments.push({
    user: userId,
    comment: comment
  });
  return this.save();
};

// Method to update status
complaintSchema.methods.updateStatus = function(newStatus, userId = null) {
  this.status = newStatus;
  
  if (newStatus === 'Resolved' && userId) {
    this.resolution = {
      resolvedBy: userId,
      resolvedAt: new Date(),
      resolution: 'Complaint resolved'
    };
  }
  
  return this.save();
};

const Complaint = mongoose.model('Complaint', complaintSchema);
export default Complaint; 