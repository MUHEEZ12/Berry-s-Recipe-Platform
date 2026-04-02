const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true,
  },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: { 
    type: String, 
    required: true,
    minlength: 6,
  },
  bio: { 
    type: String, 
    default: '',
    maxlength: 500,
  },
  avatar: { 
    type: String, 
    default: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="150" height="150"%3E%3Crect fill="%23e5e7eb" width="150" height="150"/%3E%3Ctext x="75" y="75" font-size="36" text-anchor="middle" dominant-baseline="middle" fill="%239ca3af"%3EU%3C/text%3E%3C/svg%3E',
  },
  followers: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }],
  following: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }],
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  },
}, { timestamps: true });

// Index for faster lookups
UserSchema.index({ email: 1 });

module.exports = mongoose.model('User', UserSchema);

