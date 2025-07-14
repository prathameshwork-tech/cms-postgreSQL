import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const Comment = sequelize.define('Comment', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        len: [1, 500],
        notEmpty: true
      }
    },
    complaintId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'complaints',
        key: 'id'
      }
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
    tableName: 'comments',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['complaint_id', 'created_at']
      },
      {
        fields: ['user_id', 'created_at']
      }
    ]
  });

  // Define associations
  Comment.associate = (models) => {
    // Comment belongs to Complaint
    Comment.belongsTo(models.Complaint, {
      foreignKey: 'complaintId',
      as: 'complaint'
    });

    // Comment belongs to User
    Comment.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });
  };

  return Comment;
}; 