'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('complaints', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      title: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      category: {
        type: Sequelize.ENUM('Technical', 'Billing', 'Service', 'General', 'Other'),
        allowNull: false
      },
      priority: {
        type: Sequelize.ENUM('Low', 'Medium', 'High', 'Critical'),
        defaultValue: 'Medium',
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('Pending', 'In Progress', 'Resolved', 'Closed', 'Rejected'),
        defaultValue: 'Pending',
        allowNull: false
      },
      department: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      attachments: {
        type: Sequelize.JSONB,
        defaultValue: [],
        allowNull: false
      },
      tags: {
        type: Sequelize.JSONB,
        defaultValue: [],
        allowNull: false
      },
      estimated_resolution_time: {
        type: Sequelize.DATE,
        allowNull: true
      },
      actual_resolution_time: {
        type: Sequelize.DATE,
        allowNull: true
      },
      submitted_by: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      assigned_to: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      resolved_by: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      resolved_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      resolution: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
    await queryInterface.addIndex('complaints', ['status', 'priority', 'created_at']);
    await queryInterface.addIndex('complaints', ['submitted_by', 'created_at']);
    await queryInterface.addIndex('complaints', ['department', 'status']);
    await queryInterface.addIndex('complaints', ['priority']);
    await queryInterface.addIndex('complaints', ['category']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('complaints');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_complaints_category";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_complaints_priority";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_complaints_status";');
  }
};
