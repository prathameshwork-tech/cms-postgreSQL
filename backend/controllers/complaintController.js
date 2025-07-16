import { getModels } from '../config/db.js';

// @desc    Get urgent complaints for notifications
// @route   GET /api/complaints/urgent
// @access  Private (Admin only)
export const getUrgentComplaints = async (req, res) => {
  try {
    const { Complaint, User } = getModels();
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }
    const urgentComplaints = await Complaint.findAll({
      where: {
        priority: 'Critical',
        status: ['Pending', 'In Progress']
      },
      include: [
        { model: User, as: 'submitter', attributes: ['id', 'name', 'email'] }
      ],
      order: [['createdAt', 'DESC']],
      limit: 10
    });
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
    const { Complaint } = getModels();
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    // Find complaints that are pending or in progress for more than 3 days and not already Critical
    const complaintsToEscalate = await Complaint.findAll({
      where: {
        status: ['Pending', 'In Progress'],
        priority: { $ne: 'Critical' },
        createdAt: { $lt: threeDaysAgo }
      }
    });

    let escalatedCount = 0;
    for (const complaint of complaintsToEscalate) {
      await complaint.update({ priority: 'Critical' });
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
    const { Complaint, User } = getModels();
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
    const where = {};
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (category) where.category = category;
    if (department) where.department = department;
    if (search) {
      where["title"] = { $iLike: `%${search}%` };
    }
    if (req.user.role !== 'admin') {
      where.submittedBy = req.user.id;
    }
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const { rows, count } = await Complaint.findAndCountAll({
      where,
      include: [
        { model: User, as: 'submitter', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'assignee', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'resolver', attributes: ['id', 'name', 'email'] }
      ],
      order: [[sortBy, sortOrder.toUpperCase()]],
      offset,
      limit: parseInt(limit)
    });
    res.json({
      success: true,
      data: rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / parseInt(limit))
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
    const { Complaint, User } = getModels();
    const complaint = await Complaint.findByPk(req.params.id, {
      include: [
        { model: User, as: 'submitter', attributes: ['id', 'name', 'email', 'department'] },
        { model: User, as: 'assignee', attributes: ['id', 'name', 'email', 'department'] },
        { model: User, as: 'resolver', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'comments', attributes: ['id', 'comment', 'createdAt'] }
      ]
    });

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    // Check if user has access to this complaint
    if (req.user.role !== 'admin' && complaint.submittedBy !== req.user.id) {
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
    const { Complaint, Log } = getModels();
    const {
      title,
      description,
      category,
      priority,
      department,
      tags
    } = req.body;
    if (!title || !description || !priority || !department) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: title, description, priority, and department are required'
      });
    }
    const complaint = await Complaint.create({
      title: title.trim(),
      description: description.trim(),
      category: category || 'General',
      priority,
      department,
      submittedBy: req.user.id,
      tags: tags || []
    });
    if (Log && Log.createLog) {
      await Log.createLog({
        user: req.user.id,
        action: 'CREATE_COMPLAINT',
        details: `Created complaint: ${title}`,
        resource: { type: 'COMPLAINT', id: complaint.id }
      });
    }
    res.status(201).json({
      success: true,
      message: 'Complaint created successfully',
      data: complaint
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
    const { Complaint, Log, User } = getModels();
    const complaint = await Complaint.findByPk(req.params.id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    // Check if user has permission to update
    if (req.user.role !== 'admin' && complaint.submittedBy !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    await Complaint.update(req.body, {
      where: { id: req.params.id },
    });

    let logData = {
      user: req.user.id,
      action: 'UPDATE_COMPLAINT',
      details: `Updated complaint: ${complaint.title}`,
      resource: { type: 'COMPLAINT', id: complaint.id }
    };
    if (req.user.role === 'admin') {
      const admin = await User.findByPk(req.user.id);
      logData.handledBy = admin?.name;
      logData.metadata = { adminName: admin?.name, adminEmail: admin?.email };
    }
    if (Log && Log.createLog) {
      await Log.createLog(logData);
    }

    // Fetch updated complaint with associations
    const updatedComplaint = await Complaint.findByPk(req.params.id, {
      include: [
        { model: User, as: 'submitter', attributes: ['id', 'name', 'email', 'department'] },
        { model: User, as: 'assignee', attributes: ['id', 'name', 'email', 'department'] },
        { model: User, as: 'resolver', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'comments', attributes: ['id', 'comment', 'createdAt'] }
      ]
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
    const { Complaint, Log, User } = getModels();
    const complaint = await Complaint.findByPk(req.params.id);

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

    await Complaint.destroy({ where: { id: req.params.id } });

    // Fetch admin details
    const admin = await User.findByPk(req.user.id);

    if (Log && Log.createLog) {
      await Log.createLog({
        user: req.user.id,
        action: 'DELETE_COMPLAINT',
        details: `Deleted complaint: ${complaint.title}`,
        resource: { type: 'COMPLAINT', id: complaint.id },
        metadata: {
          adminName: admin?.name,
          adminEmail: admin?.email
        },
        handledBy: admin?.name
      });
    }

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
    const { Complaint, Log, User } = getModels();
    const { status, resolution } = req.body;
    const complaint = await Complaint.findByPk(req.params.id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    // Only admins or assigned users can update status
    if (req.user.role !== 'admin' && complaint.assignedTo !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const updateData = { status };
    if (status === 'Resolved') {
      updateData.resolvedAt = new Date();
      updateData.resolvedBy = req.user.id;
      if (resolution) {
        updateData.resolution = resolution;
      }
    }

    await Complaint.update(updateData, {
      where: { id: req.params.id },
    });

    // Fetch admin details
    const admin = await User.findByPk(req.user.id);

    if (Log && Log.createLog) {
      await Log.createLog({
        user: req.user.id,
        action: 'UPDATE_COMPLAINT',
        details: `Updated complaint status to: ${status}`,
        resource: { type: 'COMPLAINT', id: complaint.id },
        metadata: {
          adminName: admin?.name,
          adminEmail: admin?.email,
          status
        },
        handledBy: admin?.name
      });
    }

    // After updating status, fetch the complaint with all user associations
    const updatedComplaint = await Complaint.findByPk(req.params.id, {
      include: [
        { model: User, as: 'submitter', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'assignee', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'resolver', attributes: ['id', 'name', 'email'] }
      ]
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
    const { Complaint, Log, User } = getModels();
    const { comment } = req.body;
    const complaint = await Complaint.findByPk(req.params.id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    // Check if user has access to this complaint
    if (req.user.role !== 'admin' && complaint.submittedBy !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    await complaint.addComment(req.user.id, comment);

    let logData = {
      user: req.user.id,
      action: 'UPDATE_COMPLAINT',
      details: `Added comment to complaint: ${complaint.title}`,
      resource: { type: 'COMPLAINT', id: complaint.id }
    };
    if (req.user.role === 'admin') {
      const admin = await User.findByPk(req.user.id);
      logData.handledBy = admin?.name;
      logData.metadata = { adminName: admin?.name, adminEmail: admin?.email };
    }
    if (Log && Log.createLog) {
      await Log.createLog(logData);
    }

    // Fetch updated complaint with associations
    const updatedComplaint = await Complaint.findByPk(req.params.id, {
      include: [
        { model: User, as: 'submitter', attributes: ['id', 'name', 'email', 'department'] },
        { model: User, as: 'assignee', attributes: ['id', 'name', 'email', 'department'] },
        { model: User, as: 'resolver', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'comments', attributes: ['id', 'comment', 'createdAt'] }
      ]
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
    const { Complaint } = getModels();
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const stats = await Complaint.findAll({
      attributes: ['status', [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']],
      group: ['status']
    });

    const priorityStats = await Complaint.findAll({
      attributes: ['priority', [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']],
      group: ['priority']
    });

    const categoryStats = await Complaint.findAll({
      attributes: ['category', [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']],
      group: ['category']
    });

    const totalComplaints = await Complaint.count();
    const resolvedComplaints = await Complaint.count({ where: { status: 'Resolved' } });
    const pendingComplaints = await Complaint.count({ where: { status: 'Pending' } });

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

// @desc    Get complaint history (timeline)
// @route   GET /api/complaints/:id/history
// @access  Private (admin or complaint owner)
export const getComplaintHistory = async (req, res) => {
  try {
    const { Complaint, Log, Comment, User } = getModels();
    const complaint = await Complaint.findByPk(req.params.id, {
      include: [
        { model: User, as: 'submitter', attributes: ['id', 'name', 'email'] }
      ]
    });
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }
    // Only allow admin or complaint owner
    if (req.user.role !== 'admin' && complaint.submittedBy !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    // Fetch all logs for this complaint
    const logs = await Log.findAll({
      where: { resourceType: 'COMPLAINT', resourceId: complaint.id },
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email', 'role'] }],
      order: [['createdAt', 'ASC']]
    });
    // Fetch all comments for this complaint
    const comments = await Comment.findAll({
      where: { complaintId: complaint.id },
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email', 'role'] }],
      order: [['createdAt', 'ASC']]
    });
    // Initial creation event
    const creationEvent = {
      type: 'CREATED',
      createdAt: complaint.createdAt,
      by: complaint.submitter,
      details: `Complaint created: ${complaint.title}`
    };
    // Map logs and comments to timeline events
    const logEvents = logs.map(log => ({
      type: log.action,
      createdAt: log.createdAt,
      by: log.user,
      details: log.details,
      handledBy: log.handledBy || null,
      metadata: log.metadata || null
    }));
    const commentEvents = comments.map(comment => ({
      type: 'COMMENT',
      createdAt: comment.createdAt,
      by: comment.user,
      details: comment.comment
    }));
    // Combine and sort all events
    const timeline = [creationEvent, ...logEvents, ...commentEvents].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    res.json({ success: true, data: timeline });
  } catch (error) {
    console.error('Get complaint history error:', error);
    res.status(500).json({ success: false, message: 'Error fetching complaint history', error: error.message });
  }
}; 