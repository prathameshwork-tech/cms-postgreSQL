import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

// Load environment variables
dotenv.config();

const createTestUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.DB_URI);
    console.log('Connected to MongoDB');

    // Check if test user already exists
    const existingUser = await User.findOne({ email: 'user@techcorp.com' });
    if (existingUser) {
      console.log('Test user already exists');
      process.exit(0);
    }

    // Create test user
    const testUser = new User({
      name: 'Test User',
      email: 'user@techcorp.com',
      password: 'user123',
      role: 'user',
      department: 'IT',
      isActive: true
    });

    await testUser.save();
    console.log('✅ Test user created successfully!');
    console.log('📧 Email: user@techcorp.com');
    console.log('🔑 Password: user123');
    console.log('👤 Role: User');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating test user:', error);
    process.exit(1);
  }
};

createTestUser(); 