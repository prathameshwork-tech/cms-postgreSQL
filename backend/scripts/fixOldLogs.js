import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Log from '../models/Log.js';
import User from '../models/User.js';

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DB_URI || 'mongodb://localhost:27017/cms', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected for fixing old logs');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const fixOldLogs = async () => {
  try {
    const adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      console.log('❌ No admin user found. Cannot fix logs.');
      return;
    }
    console.log('Using admin user:', adminUser.name, adminUser._id.toString());

    // Find logs with missing or invalid user
    const logs = await Log.find({ $or: [ { user: { $exists: false } }, { user: null }, { user: '' }, { user: { $type: 'string' } } ] });
    console.log(`Found ${logs.length} logs with missing or invalid user.`);
    let fixed = 0;
    for (const log of logs) {
      log.user = adminUser._id;
      await log.save();
      fixed++;
    }
    console.log(`✅ Fixed ${fixed} logs by assigning to admin user.`);
  } catch (error) {
    console.error('❌ Error fixing logs:', error);
  }
};

const main = async () => {
  await connectDB();
  await fixOldLogs();
  process.exit(0);
};

main(); 