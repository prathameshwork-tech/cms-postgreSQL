import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Complaint from '../models/Complaint.js';

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DB_URI || 'mongodb://localhost:27017/cms', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected for checking complaints');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const checkComplaints = async () => {
  try {
    console.log('🔍 Checking complaints in database...\n');
    
    const allComplaints = await Complaint.find({});
    console.log(`Total complaints found: ${allComplaints.length}\n`);
    
    if (allComplaints.length === 0) {
      console.log('❌ No complaints found in database');
      console.log('💡 Run the test data script first: node scripts/createTestData.js');
      return;
    }
    
    console.log('📋 All complaints:');
    allComplaints.forEach((complaint, index) => {
      console.log(`${index + 1}. ${complaint.title}`);
      console.log(`   Priority: ${complaint.priority}`);
      console.log(`   Status: ${complaint.status}`);
      console.log(`   Department: ${complaint.department}`);
      console.log(`   Created: ${complaint.createdAt}`);
      console.log('');
    });
    
    // Check by priority
    const criticalComplaints = await Complaint.find({ priority: 'Critical' });
    const highComplaints = await Complaint.find({ priority: 'High' });
    const mediumComplaints = await Complaint.find({ priority: 'Medium' });
    const lowComplaints = await Complaint.find({ priority: 'Low' });
    
    console.log('📊 Priority breakdown:');
    console.log(`- Critical: ${criticalComplaints.length}`);
    console.log(`- High: ${highComplaints.length}`);
    console.log(`- Medium: ${mediumComplaints.length}`);
    console.log(`- Low: ${lowComplaints.length}`);
    
    if (criticalComplaints.length === 0) {
      console.log('\n⚠️  No Critical complaints found!');
      console.log('This is why the notification bell shows 0 urgent complaints.');
    } else {
      console.log('\n✅ Critical complaints found - notification should work!');
    }
    
  } catch (error) {
    console.error('❌ Error checking complaints:', error);
  }
};

const main = async () => {
  try {
    await connectDB();
    await checkComplaints();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

main(); 