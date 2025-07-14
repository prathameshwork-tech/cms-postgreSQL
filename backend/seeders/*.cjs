'use strict';
const bcrypt = require('bcryptjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const users = [
      {
        id: '550e8400-e29b-41d4-a716-446655440001',
        name: 'System Administrator',
        email: 'admin@techcorp.com',
        password: hashedPassword,
        role: 'admin',
        department: 'IT',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440002',
        name: 'Test User',
        email: 'user@techcorp.com',
        password: hashedPassword,
        role: 'user',
        department: 'IT',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440003',
        name: 'John Smith',
        email: 'john@test.com',
        password: hashedPassword,
        role: 'user',
        department: 'HR',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440004',
        name: 'Sarah Johnson',
        email: 'sarah@test.com',
        password: hashedPassword,
        role: 'user',
        department: 'Finance',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    await queryInterface.bulkInsert('users', users, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', null, {});
  }
};
