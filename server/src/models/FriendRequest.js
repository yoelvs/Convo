import mongoose from 'mongoose';

const friendRequestSchema = new mongoose.Schema({
  fromUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  toUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'declined'],
    default: 'pending',
  },
}, {
  timestamps: true,
});

// Index to prevent duplicate requests
friendRequestSchema.index({ fromUser: 1, toUser: 1 }, { unique: true });

export const FriendRequest = mongoose.model('FriendRequest', friendRequestSchema);

