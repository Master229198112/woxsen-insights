import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true, // This already creates an index
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
  },
  role: {
    type: String,
    enum: ['staff', 'admin'],
    default: 'staff',
  },
  department: {
    type: String,
    required: [true, 'Department is required'],
    trim: true,
  },
  isApproved: {
    type: Boolean,
    default: false,
  },
  profileImage: {
    type: String,
    default: null,
  },
  resetPasswordToken: {
  type: String,
  default: null,
},
resetPasswordExpiry: {
  type: Date,
  default: null,
},
bio: {
  type: String,
  default: '',
  maxlength: [500, 'Bio cannot exceed 500 characters']
},
}, {
  timestamps: true,
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();
  
  try {
    // Hash password with cost of 12
    this.password = await bcrypt.hash(this.password, 12);
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to check password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Create indexes (removed duplicate email index)
// userSchema.index({ email: 1 }); // REMOVED - email already has unique: true
userSchema.index({ role: 1 });
userSchema.index({ isApproved: 1 });

export default mongoose.models.User || mongoose.model('User', userSchema);
