import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const Complaint = sequelize.define('Complaint', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    title: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        len: [3, 100],
        notEmpty: true
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        len: [10, 1000],
        notEmpty: true
      }
    },
    category: {
      type: DataTypes.ENUM('Technical', 'Billing', 'Service', 'General', 'Other'),
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    priority: {
      type: DataTypes.ENUM('Low', 'Medium', 'High', 'Critical'),
      defaultValue: 'Medium',
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('Pending', 'In Progress', 'Resolved', 'Closed', 'Rejected'),
      defaultValue: 'Pending',
      allowNull: false
    },
    department: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    attachments: {
      type: DataTypes.JSONB,
      defaultValue: [],
      allowNull: false
    },
    tags: {
      type: DataTypes.JSONB,
      defaultValue: [],
      allowNull: false
    },
    estimatedResolutionTime: {
      type: DataTypes.DATE,
      allowNull: true
    },
    actualResolutionTime: {
      type: DataTypes.DATE,
      allowNull: true
    },
    submittedBy: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    assignedTo: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    resolvedBy: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    resolvedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    resolution: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'complaints',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['status', 'priority', 'created_at']
      },
      {
        fields: ['submitted_by', 'created_at']
      },
      {
        fields: ['department', 'status']
      }
    ],
    hooks: {
      beforeUpdate: (complaint) => {
        if (complaint.changed('status') && complaint.status === 'Resolved') {
          complaint.resolvedAt = new Date();
          if (!complaint.resolution) {
            complaint.resolution = 'Complaint resolved';
          }
        }
      }
    },
    instanceMethods: {
      addComment: async function(userId, comment) {
        const Comment = sequelize.models.Comment;
        return await Comment.create({
          complaintId: this.id,
          userId: userId,
          comment: comment
        });
      },
      updateStatus: async function(newStatus, userId = null) {
        this.status = newStatus;
        
        if (newStatus === 'Resolved' && userId) {
          this.resolvedBy = userId;
          this.resolvedAt = new Date();
          this.resolution = 'Complaint resolved';
        }
        
        return await this.save();
      },
      getResolutionTime: function() {
        if (this.resolvedAt && this.createdAt) {
          return this.resolvedAt - this.createdAt;
        }
        return null;
      }
    }
  });

  // Define associations
  Complaint.associate = (models) => {
    // Complaint belongs to User (submitter)
    Complaint.belongsTo(models.User, {
      foreignKey: 'submittedBy',
      as: 'submitter'
    });

    // Complaint belongs to User (assignee)
    Complaint.belongsTo(models.User, {
      foreignKey: 'assignedTo',
      as: 'assignee'
    });

    // Complaint belongs to User (resolver)
    Complaint.belongsTo(models.User, {
      foreignKey: 'resolvedBy',
      as: 'resolver'
    });

    // Complaint has many comments
    Complaint.hasMany(models.Comment, {
      foreignKey: 'complaintId',
      as: 'comments'
    });
  };

  return Complaint;
}; 