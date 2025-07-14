import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const Log = sequelize.define('Log', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    action: {
      type: DataTypes.ENUM(
        'LOGIN', 'LOGOUT', 'REGISTER',
        'CREATE_COMPLAINT', 'UPDATE_COMPLAINT', 'DELETE_COMPLAINT',
        'ASSIGN_COMPLAINT', 'RESOLVE_COMPLAINT',
        'CREATE_USER', 'UPDATE_USER', 'DELETE_USER',
        'UPDATE_PROFILE', 'CHANGE_PASSWORD',
        'SYSTEM_ERROR', 'SYSTEM_WARNING', 'SYSTEM_INFO'
      ),
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    details: {
      type: DataTypes.STRING(500),
      allowNull: true,
      validate: {
        len: [0, 500]
      }
    },
    level: {
      type: DataTypes.ENUM('INFO', 'WARNING', 'ERROR', 'CRITICAL'),
      defaultValue: 'INFO',
      allowNull: false
    },
    ipAddress: {
      type: DataTypes.STRING(45), // IPv6 compatible
      allowNull: true
    },
    userAgent: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    resourceType: {
      type: DataTypes.ENUM('COMPLAINT', 'USER', 'SYSTEM'),
      allowNull: true
    },
    resourceId: {
      type: DataTypes.UUID,
      allowNull: true
    },
    metadata: {
      type: DataTypes.JSONB,
      defaultValue: {},
      allowNull: false
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    }
  }, {
    tableName: 'logs',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['created_at']
      },
      {
        fields: ['user_id', 'created_at']
      },
      {
        fields: ['action', 'created_at']
      },
      {
        fields: ['level', 'created_at']
      }
    ],
    classMethods: {
      createLog: async function(data) {
        return await this.create({
          userId: data.user,
          action: data.action,
          details: data.details,
          level: data.level || 'INFO',
          ipAddress: data.ipAddress,
          userAgent: data.userAgent,
          resourceType: data.resource?.type,
          resourceId: data.resource?.id,
          metadata: data.metadata || {}
        });
      },
      getLogs: async function(filters = {}, page = 1, limit = 20) {
        const offset = (page - 1) * limit;
        const where = {};
        
        if (filters.userId) where.userId = filters.userId;
        if (filters.action) where.action = filters.action;
        if (filters.level) where.level = filters.level;
        
        return await this.findAndCountAll({
          where,
          include: [{
            model: sequelize.models.User,
            as: 'user',
            attributes: ['id', 'name', 'email', 'role']
          }],
          order: [['createdAt', 'DESC']],
          offset,
          limit
        });
      }
    }
  });

  // Define associations
  Log.associate = (models) => {
    // Log belongs to User
    Log.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });
  };

  return Log;
}; 