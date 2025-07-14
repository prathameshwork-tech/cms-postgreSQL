import { getModels } from '../config/db.js';
import bcrypt from 'bcryptjs';

// @desc    Get all users with filtering and pagination
// @route   GET /api/users
// @access  Private (Admin only)
export const getAllUsers = async (req, res) => {
  try {
    const { User } = getModels();
    const {
      page = 1,
      limit = 10,
      role,
      department,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const where = {};
    if (role) where.role = role;
    if (department) where.department = department;
    if (search) {
      where[User.sequelize.Op.or] = [
        { name: { [User.sequelize.Op.iLike]: `%${search}%` } },
        { email: { [User.sequelize.Op.iLike]: `%${search}%` } },
        { department: { [User.sequelize.Op.iLike]: `%${search}%` } }
      ];
    }
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const order = [[sortBy, sortOrder.toUpperCase()]];
    const { rows: users, count: total } = await User.findAndCountAll({
      where,
      attributes: { exclude: ['password'] },
      order,
      offset,
      limit: parseInt(limit)
    });
    res.json({
      success: true,
      data: users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private (Admin only)
export const getUserById = async (req, res) => {
  try {
    const { User } = getModels();
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] }
    });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user',
      error: error.message
    });
  }
};

// @desc    Create new user (Admin only)
// @route   POST /api/users
// @access  Private (Admin only)
export const createUser = async (req, res) => {
  try {
    const { User, Log } = getModels();
    const { name, email, password, role, department } = req.body;
    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'user',
      department
    });
    // Log the action
    if (Log && Log.createLog) {
      await Log.createLog({
        user: req.user.id,
        action: 'CREATE_USER',
        details: `Created user: ${name} (${email})`,
        resource: { type: 'USER', id: user.id }
      });
    }
    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: user.toJSON()
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating user',
      error: error.message
    });
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private (Admin only)
export const updateUser = async (req, res) => {
  try {
    const { User, Log } = getModels();
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    const { name, email, role, department, isActive } = req.body;
    // Check if email is being changed and if it's already taken
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email is already taken'
        });
      }
    }
    const updateData = { name, email, role, department, isActive };
    // Remove undefined values
    Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);
    await user.update(updateData);
    // Log the action
    if (Log && Log.createLog) {
      await Log.createLog({
        user: req.user.id,
        action: 'UPDATE_USER',
        details: `Updated user: ${user.name} (${user.email})`,
        resource: { type: 'USER', id: user.id }
      });
    }
    res.json({
      success: true,
      message: 'User updated successfully',
      data: user
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user',
      error: error.message
    });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private (Admin only)
export const deleteUser = async (req, res) => {
  try {
    const { User, Log } = getModels();
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    // Prevent admin from deleting themselves
    if (user.id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      });
    }
    await user.destroy();
    // Log the action
    if (Log && Log.createLog) {
      await Log.createLog({
        user: req.user.id,
        action: 'DELETE_USER',
        details: `Deleted user: ${user.name} (${user.email})`,
        resource: { type: 'USER', id: user.id }
      });
    }
    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting user',
      error: error.message
    });
  }
};

// @desc    Get user statistics
// @route   GET /api/users/stats
// @access  Private (Admin only)
export const getUserStats = async (req, res) => {
  try {
    const { User } = getModels();

    // Total users
    const totalUsers = await User.count();
    // Active users
    const activeUsers = await User.count({ where: { isActive: true } });
    // Admin users
    const adminUsers = await User.count({ where: { role: 'admin' } });
    // Regular users
    const userUsers = await User.count({ where: { role: 'user' } });

    // Department stats (group by department)
    const departmentStatsRaw = await User.findAll({
      attributes: [
        'department',
        [User.sequelize.fn('COUNT', User.sequelize.col('id')), 'count']
      ],
      group: ['department']
    });
    const departmentStats = departmentStatsRaw.map(row => ({
      department: row.department,
      count: parseInt(row.get('count'))
    }));

    res.json({
      success: true,
      data: {
        total: totalUsers,
        active: activeUsers,
        inactive: totalUsers - activeUsers,
        admins: adminUsers,
        users: userUsers,
        departmentStats
      }
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user statistics',
      error: error.message
    });
  }
};

// Add a new controller function for admin password change
export const adminChangePassword = async (req, res) => {
  try {
    console.log('adminChangePassword request body:', req.body);
    const { User, Log } = getModels();
    const adminId = req.user.id;
    const admin = await User.findByPk(adminId);
    if (!admin || admin.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: Admins only' });
    }
    const { userId, newPassword } = req.body;
    if (!userId || !newPassword) {
      return res.status(400).json({ message: 'User ID and new password are required' });
    }
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    // More debug output
    console.log('User before password change:', user.toJSON());
    user.set('password', newPassword);
    user.changed('password', true);
    console.log('Password before save (should be plain):', user.password);
    await user.save();
    console.log('User after save:', user.toJSON());
    console.log('Password after save (should be hashed):', user.password);
    // Log the password change
    if (Log && Log.createLog) {
      await Log.createLog({
        user: adminId,
        action: 'CHANGE_PASSWORD', // valid ENUM value
        details: `Admin changed password for user ${userId}`,
        resource: { type: 'USER', id: userId }
      });
    }
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Admin password change error:', error);
    res.status(500).json({ message: 'Server error', error: error.message, stack: error.stack });
  }
}; 