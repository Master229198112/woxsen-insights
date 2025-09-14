import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current file directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

// Import User model
import User from '../models/User.js';

// Connect to MongoDB
async function connectDB() {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
}

// Generate username from name
function generateUsernameFromName(name) {
  return name
    .toLowerCase()
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .replace(/\s+/g, '.')
    .substring(0, 25);
}

// Check if username exists
async function isUsernameUnique(username, excludeId = null) {
  const query = { username };
  if (excludeId) {
    query._id = { $ne: excludeId };
  }
  const existing = await User.findOne(query);
  return !existing;
}

// Generate unique username
async function generateUniqueUsername(name, userId) {
  const baseUsername = generateUsernameFromName(name);
  let username = baseUsername;
  let counter = 1;
  
  while (!(await isUsernameUnique(username, userId))) {
    username = `${baseUsername}.${counter}`;
    counter++;
  }
  
  return username;
}

// Main migration function
async function generateUsernames() {
  console.log('🚀 Starting username generation for existing users...');
  
  try {
    await connectDB();
    
    // Find all users without usernames
    const usersWithoutUsernames = await User.find({
      $or: [
        { username: { $exists: false } },
        { username: null },
        { username: '' }
      ]
    });
    
    console.log(`📊 Found ${usersWithoutUsernames.length} users without usernames`);
    
    let updated = 0;
    let skipped = 0;
    
    for (const user of usersWithoutUsernames) {
      try {
        if (!user.name) {
          console.log(`⚠️  Skipping user ${user._id} - no name available`);
          skipped++;
          continue;
        }
        
        const username = await generateUniqueUsername(user.name, user._id);
        
        await User.findByIdAndUpdate(user._id, { username });
        
        console.log(`✅ Generated username "${username}" for user "${user.name}" (${user.email})`);
        updated++;
        
      } catch (error) {
        console.error(`❌ Error processing user ${user._id}:`, error);
        skipped++;
      }
    }
    
    console.log(`\n🎉 Migration completed!`);
    console.log(`   Updated: ${updated} users`);
    console.log(`   Skipped: ${skipped} users`);
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('📡 Database connection closed');
    process.exit(0);
  }
}

// Export the function
export { generateUsernames };

// Run the migration if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  generateUsernames();
}
