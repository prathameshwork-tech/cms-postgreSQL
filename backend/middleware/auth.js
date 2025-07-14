import { verifyToken, extractToken } from '../utils/jwt.js';
import { getModels } from '../config/db.js';

// Middleware to verify JWT token
export const authenticateToken = async (req, res, next) => {
  try {
    const { User } = getModels();
    const authHeader = req.headers.authorization;
    const token = extractToken(authHeader);
    
    const decoded = verifyToken(token);
    
    // Get user from database
    const user = await User.findByPk(decoded.userId, {
      attributes: { exclude: ['password'] }
    });
    
    if (!user || !user.isActive) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not found or inactive' 
      });
    }
    
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ 
      success: false, 
      message: 'Invalid or expired token' 
    });
  }
};

// Middleware to check if user is admin
export const requireAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({ 
      success: false, 
      message: 'Admin access required' 
    });
  }
};

// Middleware to check if user is admin or the resource owner
export const requireAdminOrOwner = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.id === req.params.userId)) {
    next();
  } else {
    return res.status(403).json({ 
      success: false, 
      message: 'Access denied' 
    });
  }
}; 