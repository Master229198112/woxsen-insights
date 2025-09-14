require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local') });

async function runMigration() {
  console.log('🚀 Starting username generation for existing users...');
  
  try {
    // Dynamically import the ES6 modules
    const mongoose = await import('mongoose');
    const { default: User } = await import('../models/User.js');

    // Connect to MongoDB
    console.log('📡 Connecting to MongoDB...');
    const conn = await mongoose.default.connect(process.env.MONGODB_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

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
        console.error(`❌ Error processing user ${user._id}:`, error.message);
        skipped++;
      }
    }
    
    console.log(`\n🎉 Migration completed!`);
    console.log(`   Updated: ${updated} users`);
    console.log(`   Skipped: ${skipped} users`);
    
    await mongoose.default.connection.close();
    console.log('📡 Database connection closed');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

// Run the migration
runMigration();
