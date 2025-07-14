import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Complaint from '../models/Complaint.js';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DB_URI || 'mongodb://localhost:27017/cms', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected for testing urgent API');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const testUrgentAPI = async () => {
  try {
    console.log('🧪 Testing urgent complaints API...\n');
    
    // Get admin user
    const adminUser = await User.findOne({ email: 'admin@test.com' });
    if (!adminUser) {
      console.log('❌ Admin user not found');
      return;
    }
    
    console.log('✅ Admin user found:', adminUser.name);
    
    // Create a test token
    const token = jwt.sign(
      { userId: adminUser._id, role: adminUser.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1h' }
    );
    
    console.log('✅ Test token created');
    
    // Test the database query directly
    const urgentComplaints = await Complaint.find({ priority: 'Critical' })
      .populate('submittedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(10);
    
    console.log('📊 Database query results:');
    console.log(`- Found ${urgentComplaints.length} Critical complaints`);
    urgentComplaints.forEach((complaint, index) => {
      console.log(`  ${index + 1}. ${complaint.title} (by ${complaint.submittedBy?.name})`);
    });
    
    // Test the API endpoint manually
    console.log('\n🔗 Testing API endpoint...');
    
    const response = await fetch('http://localhost:5000/api/complaints/urgent', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    console.log('📡 API Response:', data);
    
    if (response.ok) {
      console.log('✅ API endpoint working correctly');
      console.log(`📊 API returned ${data.data?.length || 0} urgent complaints`);
    } else {
      console.log('❌ API endpoint failed');
      console.log('Status:', response.status);
      console.log('Error:', data);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

const main = async () => {
  try {
    await connectDB();
    await testUrgentAPI();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

main(); 