'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('logs', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      action: {
        type: Sequelize.ENUM(
          'LOGIN', 'LOGOUT', 'REGISTER',
          'CREATE_COMPLAINT', 'UPDATE_COMPLAINT', 'DELETE_COMPLAINT',
          'ASSIGN_COMPLAINT', 'RESOLVE_COMPLAINT',
          'CREATE_USER', 'UPDATE_USER', 'DELETE_USER',
          'UPDATE_PROFILE', 'CHANGE_PASSWORD',
          'SYSTEM_ERROR', 'SYSTEM_WARNING', 'SYSTEM_INFO'
        ),
        allowNull: false
      },
      details: {
        type: Sequelize.STRING(500),
        allowNull: true
      },
      level: {
        type: Sequelize.ENUM('INFO', 'WARNING', 'ERROR', 'CRITICAL'),
        defaultValue: 'INFO',
        allowNull: false
      },
      ip_address: {
        type: Sequelize.STRING(45),
        allowNull: true
      },
      user_agent: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      resource_type: {
        type: Sequelize.ENUM('COMPLAINT', 'USER', 'SYSTEM'),
        allowNull: true
      },
      resource_id: {
        type: Sequelize.UUID,
        allowNull: true
      },
      metadata: {
        type: Sequelize.JSONB,
        defaultValue: {},
        allowNull: false
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
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
    await queryInterface.addIndex('logs', ['created_at']);
    await queryInterface.addIndex('logs', ['user_id', 'created_at']);
    await queryInterface.addIndex('logs', ['action', 'created_at']);
    await queryInterface.addIndex('logs', ['level', 'created_at']);
    await queryInterface.addIndex('logs', ['resource_type', 'resource_id']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('logs');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_logs_action";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_logs_level";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_logs_resource_type";');
  }
};
