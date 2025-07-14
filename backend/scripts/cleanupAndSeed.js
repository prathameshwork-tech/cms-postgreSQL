import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Complaint from '../models/Complaint.js';
import Log from '../models/Log.js';
import bcrypt from 'bcryptjs';

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DB_URI || 'mongodb://localhost:27017/cms', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected for cleanup and seeding');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const cleanupAndSeed = async () => {
  try {
    // Delete all logs and complaints
    const logDelete = await Log.deleteMany({});
    const complaintDelete = await Complaint.deleteMany({});
    console.log(`🗑️ Deleted ${logDelete.deletedCount} logs and ${complaintDelete.deletedCount} complaints.`);

    // Find or create users
    let admin = await User.findOne({ email: 'admin@test.com' });
    let john = await User.findOne({ email: 'john@test.com' });
    let sarah = await User.findOne({ email: 'sarah@test.com' });
    if (!admin) admin = await User.create({ name: 'Admin User', email: 'admin@test.com', password: await bcrypt.hash('admin123', 10), role: 'admin', department: 'IT' });
    if (!john) john = await User.create({ name: 'John Smith', email: 'john@test.com', password: await bcrypt.hash('user123', 10), role: 'user', department: 'HR' });
    if (!sarah) sarah = await User.create({ name: 'Sarah Johnson', email: 'sarah@test.com', password: await bcrypt.hash('user123', 10), role: 'user', department: 'Finance' });

    // Create new complaints as different users
    const complaints = [
      {
        title: 'Network Outage in HR',
        description: 'No internet connectivity in HR department.',
        category: 'Technical',
        priority: 'High',
        status: 'Pending',
        department: 'HR',
        submittedBy: john._id,
      },
      {
        title: 'Payroll Delay',
        description: 'Payroll processing is delayed for this month.',
        category: 'Billing',
        priority: 'Medium',
        status: 'Pending',
        department: 'Finance',
        submittedBy: sarah._id,
      },
      {
        title: 'Server Room AC Failure',
        description: 'AC in server room is not working, risk of overheating.',
        category: 'Service',
        priority: 'Critical',
        status: 'Pending',
        department: 'IT',
        submittedBy: admin._id,
      }
    ];
    let created = 0;
    for (const c of complaints) {
      await Complaint.create(c);
      created++;
    }
    console.log(`✅ Created ${created} new complaints as different users.`);
    console.log('Now, logs should be automatically generated for these actions.');
  } catch (error) {
    console.error('❌ Error during cleanup and seeding:', error);
  }
};

const main = async () => {
  await connectDB();
  await cleanupAndSeed();
  process.exit(0);
};

main(); 