import { DataTypes } from 'sequelize';
import bcrypt from 'bcryptjs';

export default (sequelize) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        len: [2, 50],
        notEmpty: true
      }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
        notEmpty: true
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [6, 255],
        notEmpty: true
      }
    },
    role: {
      type: DataTypes.ENUM('user', 'admin'),
      defaultValue: 'user',
      allowNull: false
    },
    department: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false
    },
    lastLogin: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'users',
    timestamps: true,
    underscored: true,
    hooks: {
      beforeSave: async (user) => {
        if (user.changed('password')) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      }
    },
    instanceMethods: {
      comparePassword: async function(candidatePassword) {
        return await bcrypt.compare(candidatePassword, this.password);
      },
      toJSON: function() {
        const user = this.get();
        delete user.password;
        return user;
      }
    }
  });

  // Define associations
  User.associate = (models) => {
    // User has many complaints (as submitter)
    User.hasMany(models.Complaint, {
      foreignKey: 'submittedBy',
      as: 'submittedComplaints'
    });

    // User has many complaints (as assignee)
    User.hasMany(models.Complaint, {
      foreignKey: 'assignedTo',
      as: 'assignedComplaints'
    });

    // User has many logs
    User.hasMany(models.Log, {
      foreignKey: 'userId',
      as: 'logs'
    });

    // User has many comments
    User.hasMany(models.Comment, {
      foreignKey: 'userId',
      as: 'comments'
    });

    // User has many resolutions (as resolver)
    User.hasMany(models.Complaint, {
      foreignKey: 'resolvedBy',
      as: 'resolvedComplaints'
    });
  };

  return User;
}; 