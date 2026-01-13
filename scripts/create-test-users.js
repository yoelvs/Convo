import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '../server/.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/social-network';

// User schema (simplified)
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  avatarUrl: String,
  bio: String,
  friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isOnline: { type: Boolean, default: false },
  lastSeen: Date,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
}

async function createTestUsers() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const users = [];
    
    // Create users from test4 to test53 (50 users)
    for (let i = 4; i <= 53; i++) {
      const username = `test${i}`;
      const email = `test${i}@gmail.com`;
      const password = '123456';
      
      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        console.log(`⏭️  User ${email} already exists, skipping...`);
        continue;
      }

      const passwordHash = await hashPassword(password);
      const user = new User({
        username,
        email,
        passwordHash,
      });

      await user.save();
      users.push({ username, email });
      console.log(`✅ Created user: ${username} (${email})`);
    }

    console.log(`\n🎉 Successfully created ${users.length} users:`);
    users.forEach(u => console.log(`   - ${u.username} (${u.email})`));
    
    if (users.length === 0) {
      console.log('\nℹ️  All users already exist in the database.');
    }
    
  } catch (error) {
    console.error('❌ Error creating users:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  }
}

createTestUsers();
