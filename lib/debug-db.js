import connectDB from './mongodb.js';
import User from '../models/User.js';

async function debugDatabase() {
  try {
    console.log('🔍 Debugging database...');
    await connectDB();
    
    // Count all users
    const totalUsers = await User.countDocuments();
    console.log('👥 Total users in database:', totalUsers);
    
    // Get all users
    const allUsers = await User.find({}).select('-password');
    console.log('📋 All users:');
    allUsers.forEach(user => {
      console.log(`  - ${user.name} (${user.email}) - Role: ${user.role}, Approved: ${user.isApproved}`);
    });
    
    // Count pending users
    const pendingUsers = await User.countDocuments({ isApproved: false });
    console.log('⏳ Pending users:', pendingUsers);
    
    // Count approved users
    const approvedUsers = await User.countDocuments({ isApproved: true });
    console.log('✅ Approved users:', approvedUsers);
    
  } catch (error) {
    console.error('❌ Debug error:', error);
  }
  
  process.exit(0);
}

// Uncomment to run: node lib/debug-db.js
// debugDatabase();
