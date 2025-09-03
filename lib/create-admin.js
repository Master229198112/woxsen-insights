import dotenv from 'dotenv';
import connectDB from './mongodb.js';
import User from '../models/User.js';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function createAdmin() {
  try {
    console.log('🚀 Creating admin user...');
    
    await connectDB();
    
    const adminData = {
      name: 'Vishal Kumar Sharma',
      email: 'vishal.sharma@woxsen.edu.in',
      password: 'admin123', // You can change this later
      department: 'AI Research Centre',
      role: 'admin',
      isApproved: true,
    };

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminData.email });
    if (existingAdmin) {
      console.log('✅ Admin user already exists!');
      console.log('📧 Email:', adminData.email);
      return;
    }

    // Create admin user
    const admin = await User.create(adminData);
    console.log('✅ Admin user created successfully!');
    console.log('📧 Email:', adminData.email);
    console.log('🔑 Password:', adminData.password);
    console.log('⚠️  Please change the password after first login!');
    
  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
  }
  
  process.exit(0);
}

createAdmin();
