import mongoose from 'mongoose';

const chatRoomSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['private', 'group'],
    required: true,
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  }],
  name: {
    type: String,
    default: null, // For group chats
  },
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null, // For group chats
  },
  managers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }], // For group chats - managers can perform admin actions
  lastMessageAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Index for finding rooms by members
chatRoomSchema.index({ members: 1 });
chatRoomSchema.index({ lastMessageAt: -1 });

export const ChatRoom = mongoose.model('ChatRoom', chatRoomSchema);

