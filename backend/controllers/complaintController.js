import Complaint from '../models/Complaint.js';
import Log from '../models/Log.js';

// @desc    Get urgent complaints for notifications
// @route   GET /api/complaints/urgent
// @access  Private (Admin only)
export const getUrgentComplaints = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    // Get complaints with urgent priority (exclude resolved/closed/rejected)
    const urgentComplaints = await Complaint.find({ 
      priority: 'Critical',
      status: { $nin: ['Resolved', 'Closed', 'Rejected'] }
    })
      .populate('submittedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      success: true,
      data: urgentComplaints,
      count: urgentComplaints.length
    });
  } catch (error) {
    console.error('Get urgent complaints error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching urgent complaints',
      error: error.message
    });
  }
};

// @desc    Auto-escalate priority for old pending complaints
// @route   POST /api/complaints/auto-escalate
// @access  Private (Admin only)
export const autoEscalatePriority = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    // Find complaints that are pending or in progress for more than 3 days and not already Critical
    const complaintsToEscalate = await Complaint.find({
      status: { $in: ['Pending', 'In Progress'] },
      priority: { $ne: 'Critical' },
      createdAt: { $lt: threeDaysAgo }
    });

    let escalatedCount = 0;
    for (const complaint of complaintsToEscalate) {
      complaint.priority = 'Critical';
      await complaint.save();
      escalatedCount++;
    }

    res.json({
      success: true,
      message: `Escalated ${escalatedCount} complaints to Critical priority`,
      escalatedCount
    });
  } catch (error) {
    console.error('Auto-escalate error:', error);
    res.status(500).json({
      success: false,
      message: 'Error auto-escalating complaints',
      error: error.message
    });
  }
};

// @desc    Get all complaints with filtering and pagination
// @route   GET /api/complaints
// @access  Private
export const getAllComplaints = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      priority,
      category,
      department,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Auto-escalate old complaints (only for admin requests)
    if (req.user.role === 'admin') {
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

      await Complaint.updateMany(
        {
          status: { $in: ['Pending', 'In Progress'] },
          priority: { $ne: 'Critical' },
          createdAt: { $lt: threeDaysAgo }
        },
        { priority: 'Critical' }
      );
    }

    // Build filter object
    const filter = {};
    
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (category) filter.category = category;
    if (department) filter.department = department;
    
    // Search functionality
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // User-specific filtering (non-admin users see only their complaints)
    if (req.user.role !== 'admin') {
      filter.submittedBy = req.user._id;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    const complaints = await Complaint.find(filter)
      .populate('submittedBy', 'name email')
      .populate('assignedTo', 'name email')
      .populate('resolution.resolvedBy', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Complaint.countDocuments(filter);

    res.json({
      success: true,
      data: complaints,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get complaints error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching complaints',
      error: error.message
    });
  }
};

// @desc    Get complaint by ID
// @route   GET /api/complaints/:id
// @access  Private
export const getComplaintById = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('submittedBy', 'name email department')
      .populate('assignedTo', 'name email department')
      .populate('resolution.resolvedBy', 'name email')
      .populate('comments.user', 'name email');

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    // Check if user has access to this complaint
    if (req.user.role !== 'admin' && complaint.submittedBy._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: complaint
    });
  } catch (error) {
    console.error('Get complaint error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching complaint',
      error: error.message
    });
  }
};

// @desc    Create new complaint
// @route   POST /api/complaints
// @access  Private
export const createComplaint = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      priority,
      department,
      tags
    } = req.body;

    // Validate required fields
    if (!title || !description || !priority || !department) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: title, description, priority, and department are required'
      });
    }

    // Validate title length
    if (title.trim().length < 5) {
      return res.status(400).json({
        success: false,
        message: 'Title must be at least 5 characters long'
      });
    }

    if (title.trim().length > 60) {
      return res.status(400).json({
        success: false,
        message: 'Title cannot exceed 60 characters'
      });
    }

    // Validate description length
    if (description.trim().length < 15) {
      return res.status(400).json({
        success: false,
        message: 'Description must be at least 15 characters long'
      });
    }

    if (description.trim().length > 500) {
      return res.status(400).json({
        success: false,
        message: 'Description cannot exceed 500 characters'
      });
    }

    // Validate priority
    const validPriorities = ['Low', 'Medium', 'High', 'Critical'];
    if (!validPriorities.includes(priority)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid priority. Must be one of: Low, Medium, High, Critical'
      });
    }

    // Validate department
    const validDepartments = ['IT', 'HR', 'Facilities', 'Finance', 'Marketing', 'Operations'];
    if (!validDepartments.includes(department)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid department. Must be one of: IT, HR, Facilities, Finance, Marketing, Operations'
      });
    }

    const complaintData = {
      title: title.trim(),
      description: description.trim(),
      category: category || 'General',
      priority,
      department,
      submittedBy: req.user._id,
      tags: tags || []
    };

    const complaint = await Complaint.create(complaintData);

    // Log the action
    await Log.createLog({
      user: req.user._id,
      action: 'CREATE_COMPLAINT',
      details: `Created complaint: ${title}`,
      resource: {
        type: 'COMPLAINT',
        id: complaint._id
      }
    });

    const populatedComplaint = await Complaint.findById(complaint._id)
      .populate('submittedBy', 'name email department');

    res.status(201).json({
      success: true,
      message: 'Complaint created successfully',
      data: populatedComplaint
    });
  } catch (error) {
    console.error('Create complaint error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating complaint',
      error: error.message
    });
  }
};

// @desc    Update complaint
// @route   PUT /api/complaints/:id
// @access  Private
export const updateComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    // Check if user has permission to update
    if (req.user.role !== 'admin' && complaint.submittedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const updatedComplaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('submittedBy', 'name email department')
     .populate('assignedTo', 'name email department');

    // Log the action
    await Log.createLog({
      user: req.user._id,
      action: 'UPDATE_COMPLAINT',
      details: `Updated complaint: ${updatedComplaint.title}`,
      resource: {
        type: 'COMPLAINT',
        id: updatedComplaint._id
      }
    });

    res.json({
      success: true,
      message: 'Complaint updated successfully',
      data: updatedComplaint
    });
  } catch (error) {
    console.error('Update complaint error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating complaint',
      error: error.message
    });
  }
};

// @desc    Delete complaint
// @route   DELETE /api/complaints/:id
// @access  Private (Admin only)
export const deleteComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    // Only admins can delete complaints
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    await Complaint.findByIdAndDelete(req.params.id);

    // Log the action
    await Log.createLog({
      user: req.user._id,
      action: 'DELETE_COMPLAINT',
      details: `Deleted complaint: ${complaint.title}`,
      resource: {
        type: 'COMPLAINT',
        id: complaint._id
      }
    });

    res.json({
      success: true,
      message: 'Complaint deleted successfully'
    });
  } catch (error) {
    console.error('Delete complaint error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting complaint',
      error: error.message
    });
  }
};

// @desc    Update complaint status
// @route   PATCH /api/complaints/:id/status
// @access  Private
export const updateComplaintStatus = async (req, res) => {
  try {
    const { status, resolution } = req.body;
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    // Only admins or assigned users can update status
    if (req.user.role !== 'admin' && complaint.assignedTo?.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const updateData = { status };
    
    if (status === 'Resolved' && resolution) {
      updateData.resolution = {
        resolvedBy: req.user._id,
        resolvedAt: new Date(),
        resolution
      };
    }

    const updatedComplaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('submittedBy', 'name email department')
     .populate('assignedTo', 'name email department')
     .populate('resolution.resolvedBy', 'name email');

    // Log the action
    await Log.createLog({
      user: req.user._id,
      action: 'UPDATE_COMPLAINT',
      details: `Updated complaint status to: ${status}`,
      resource: {
        type: 'COMPLAINT',
        id: updatedComplaint._id
      }
    });

    res.json({
      success: true,
      message: 'Complaint status updated successfully',
      data: updatedComplaint
    });
  } catch (error) {
    console.error('Update complaint status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating complaint status',
      error: error.message
    });
  }
};

// @desc    Add comment to complaint
// @route   POST /api/complaints/:id/comments
// @access  Private
export const addComment = async (req, res) => {
  try {
    const { comment } = req.body;
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    // Check if user has access to this complaint
    if (req.user.role !== 'admin' && complaint.submittedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    await complaint.addComment(req.user._id, comment);

    const updatedComplaint = await Complaint.findById(req.params.id)
      .populate('submittedBy', 'name email department')
      .populate('assignedTo', 'name email department')
      .populate('comments.user', 'name email');

    // Log the action
    await Log.createLog({
      user: req.user._id,
      action: 'UPDATE_COMPLAINT',
      details: `Added comment to complaint: ${complaint.title}`,
      resource: {
        type: 'COMPLAINT',
        id: complaint._id
      }
    });

    res.json({
      success: true,
      message: 'Comment added successfully',
      data: updatedComplaint
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding comment',
      error: error.message
    });
  }
};

// @desc    Get complaint statistics
// @route   GET /api/complaints/stats
// @access  Private (Admin only)
export const getComplaintStats = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const stats = await Complaint.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const priorityStats = await Complaint.aggregate([
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      }
    ]);

    const categoryStats = await Complaint.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalComplaints = await Complaint.countDocuments();
    const resolvedComplaints = await Complaint.countDocuments({ status: 'Resolved' });
    const pendingComplaints = await Complaint.countDocuments({ status: 'Pending' });

    res.json({
      success: true,
      data: {
        total: totalComplaints,
        resolved: resolvedComplaints,
        pending: pendingComplaints,
        statusStats: stats,
        priorityStats: priorityStats,
        categoryStats: categoryStats
      }
    });
  } catch (error) {
    console.error('Get complaint stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching complaint statistics',
      error: error.message
    });
  }
}; 