import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Complaint from '../models/Complaint.js';
import bcrypt from 'bcryptjs';

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DB_URI || 'mongodb://localhost:27017/cms', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected for test data creation');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const createTestUsers = async () => {
  const users = [
    {
      name: 'Admin User',
      email: 'admin@test.com',
      password: 'admin123',
      role: 'admin',
      department: 'IT'
    },
    {
      name: 'John Smith',
      email: 'john@test.com',
      password: 'user123',
      role: 'user',
      department: 'HR'
    },
    {
      name: 'Sarah Johnson',
      email: 'sarah@test.com',
      password: 'user123',
      role: 'user',
      department: 'Finance'
    }
  ];

  console.log('Creating test users...');
  const createdUsers = [];

  for (const userData of users) {
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      console.log(`User ${userData.email} already exists, skipping...`);
      createdUsers.push(existingUser);
      continue;
    }

    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const user = await User.create({
      ...userData,
      password: hashedPassword
    });
    console.log(`Created user: ${user.name} (${user.email})`);
    createdUsers.push(user);
  }

  return createdUsers;
};

const createTestComplaints = async (users) => {
  const [admin, john, sarah] = users;

  // Helper function to create date with offset
  const createDate = (daysAgo) => {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    return date;
  };

  const complaints = [
    // URGENT COMPLAINTS (Critical Priority)
    {
      title: 'Server Down - Production System Unavailable',
      description: 'The main production server has been down for 2 hours. All users are unable to access the system. This is affecting business operations.',
      category: 'Technical',
      priority: 'Critical',
      status: 'Pending',
      department: 'IT',
      submittedBy: john._id,
      createdAt: createDate(4), // 4 days ago - should be escalated
      tags: ['server', 'production', 'urgent']
    },
    {
      title: 'Payment System Failure - Customer Complaints',
      description: 'Customers are reporting payment failures. The payment gateway is not processing transactions. Revenue is being affected.',
      category: 'Billing',
      priority: 'Critical',
      status: 'In Progress',
      department: 'Finance',
      submittedBy: sarah._id,
      createdAt: createDate(3), // 3 days ago
      tags: ['payment', 'revenue', 'critical']
    },
    {
      title: 'Security Breach - Unauthorized Access Detected',
      description: 'Multiple failed login attempts detected from unknown IP addresses. Potential security breach needs immediate attention.',
      category: 'Technical',
      priority: 'Critical',
      status: 'Pending',
      department: 'IT',
      submittedBy: admin._id,
      createdAt: createDate(1), // 1 day ago
      tags: ['security', 'breach', 'urgent']
    },

    // HIGH PRIORITY COMPLAINTS
    {
      title: 'Employee Database Access Issues',
      description: 'HR staff cannot access employee records. This is affecting payroll processing and employee management.',
      category: 'Service',
      priority: 'High',
      status: 'In Progress',
      department: 'HR',
      submittedBy: john._id,
      createdAt: createDate(5), // 5 days ago - should be escalated
      tags: ['hr', 'database', 'access']
    },
    {
      title: 'Budget Report Generation Failed',
      description: 'Monthly budget reports are not generating correctly. Finance team needs this for board meeting.',
      category: 'General',
      priority: 'High',
      status: 'Pending',
      department: 'Finance',
      submittedBy: sarah._id,
      createdAt: createDate(2), // 2 days ago
      tags: ['budget', 'reports', 'finance']
    },

    // MEDIUM PRIORITY COMPLAINTS
    {
      title: 'Email System Slow Performance',
      description: 'Company email system is running very slowly. Users are experiencing delays in sending/receiving emails.',
      category: 'Technical',
      priority: 'Medium',
      status: 'Resolved',
      department: 'IT',
      submittedBy: john._id,
      createdAt: createDate(7), // 7 days ago
      tags: ['email', 'performance', 'resolved']
    },
    {
      title: 'Office Printer Network Issues',
      description: 'Network printers in the office are not connecting properly. Staff cannot print documents.',
      category: 'Technical',
      priority: 'Medium',
      status: 'In Progress',
      department: 'IT',
      submittedBy: sarah._id,
      createdAt: createDate(6), // 6 days ago - should be escalated
      tags: ['printer', 'network', 'office']
    },
    {
      title: 'Employee Benefits Portal Down',
      description: 'Employees cannot access the benefits portal to update their information.',
      category: 'Service',
      priority: 'Medium',
      status: 'Pending',
      department: 'HR',
      submittedBy: john._id,
      createdAt: createDate(4), // 4 days ago - should be escalated
      tags: ['benefits', 'portal', 'hr']
    },

    // LOW PRIORITY COMPLAINTS
    {
      title: 'Office Coffee Machine Broken',
      description: 'The coffee machine in the break room is not working. Staff would like it fixed.',
      category: 'General',
      priority: 'Low',
      status: 'Pending',
      department: 'HR',
      submittedBy: sarah._id,
      createdAt: createDate(8), // 8 days ago - should be escalated
      tags: ['coffee', 'breakroom', 'facilities']
    },
    {
      title: 'Website Footer Link Broken',
      description: 'One of the footer links on the company website is not working properly.',
      category: 'Technical',
      priority: 'Low',
      status: 'Resolved',
      department: 'IT',
      submittedBy: admin._id,
      createdAt: createDate(10), // 10 days ago
      tags: ['website', 'footer', 'link']
    },
    {
      title: 'Office Temperature Too Cold',
      description: 'The office temperature is set too low. Staff are feeling cold and would like it adjusted.',
      category: 'General',
      priority: 'Low',
      status: 'In Progress',
      department: 'HR',
      submittedBy: john._id,
      createdAt: createDate(5), // 5 days ago - should be escalated
      tags: ['temperature', 'office', 'comfort']
    },

    // RECENT COMPLAINTS (for testing "now" and "min ago")
    {
      title: 'New Software Installation Request',
      description: 'Need to install new design software for the marketing team.',
      category: 'Technical',
      priority: 'Medium',
      status: 'Pending',
      department: 'IT',
      submittedBy: sarah._id,
      createdAt: new Date(), // Just created
      tags: ['software', 'installation', 'marketing']
    },
    {
      title: 'Meeting Room Booking System Issue',
      description: 'Cannot book meeting rooms through the online system.',
      category: 'Service',
      priority: 'Medium',
      status: 'Pending',
      department: 'HR',
      submittedBy: john._id,
      createdAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      tags: ['meeting', 'booking', 'rooms']
    },
    {
      title: 'Expense Report Submission Problem',
      description: 'Employees cannot submit expense reports through the portal.',
      category: 'Billing',
      priority: 'High',
      status: 'In Progress',
      department: 'Finance',
      submittedBy: sarah._id,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      tags: ['expenses', 'reports', 'portal']
    }
  ];

  console.log('Creating test complaints...');
  let createdCount = 0;
  let skippedCount = 0;

  for (const complaintData of complaints) {
    // Check if complaint with same title exists
    const existingComplaint = await Complaint.findOne({ title: complaintData.title });
    if (existingComplaint) {
      console.log(`Complaint "${complaintData.title}" already exists, skipping...`);
      skippedCount++;
      continue;
    }

    const complaint = await Complaint.create(complaintData);
    console.log(`Created complaint: ${complaint.title} (${complaint.priority} priority, ${complaint.status} status)`);
    createdCount++;
  }

  console.log(`\nTest data creation summary:`);
  console.log(`- Users: ${users.length} (${users.length - skippedCount} created, ${skippedCount} already existed)`);
  console.log(`- Complaints: ${complaints.length} (${createdCount} created, ${skippedCount} already existed)`);
  
  // Show breakdown by priority
  const priorityStats = await Complaint.aggregate([
    { $group: { _id: '$priority', count: { $sum: 1 } } }
  ]);
  console.log(`\nComplaints by priority:`);
  priorityStats.forEach(stat => {
    console.log(`- ${stat._id}: ${stat.count}`);
  });

  // Show breakdown by status
  const statusStats = await Complaint.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);
  console.log(`\nComplaints by status:`);
  statusStats.forEach(stat => {
    console.log(`- ${stat._id}: ${stat.count}`);
  });

  // Show breakdown by category
  const categoryStats = await Complaint.aggregate([
    { $group: { _id: '$category', count: { $sum: 1 } } }
  ]);
  console.log(`\nComplaints by category:`);
  categoryStats.forEach(stat => {
    console.log(`- ${stat._id}: ${stat.count}`);
  });

  // Show breakdown by department
  const departmentStats = await Complaint.aggregate([
    { $group: { _id: '$department', count: { $sum: 1 } } }
  ]);
  console.log(`\nComplaints by department:`);
  departmentStats.forEach(stat => {
    console.log(`- ${stat._id}: ${stat.count}`);
  });
};

const main = async () => {
  try {
    await connectDB();
    
    console.log('🚀 Starting test data creation...\n');
    
    const users = await createTestUsers();
    console.log('\n' + '='.repeat(50) + '\n');
    
    await createTestComplaints(users);
    
    console.log('\n✅ Test data creation completed successfully!');
    console.log('\n📋 Test Users:');
    console.log('- Admin: admin@test.com (password: admin123)');
    console.log('- User: john@test.com (password: user123)');
    console.log('- User: sarah@test.com (password: user123)');
    
    console.log('\n🔔 Notification Testing:');
    console.log('- 3 Critical priority complaints should appear in notifications');
    console.log('- 5 complaints older than 3 days should be auto-escalated');
    console.log('- Recent complaints will show "now", "30 min ago", "2 hrs ago"');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating test data:', error);
    process.exit(1);
  }
};

main(); 