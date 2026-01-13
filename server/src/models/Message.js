import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ChatRoom',
    required: true,
    index: true,
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  content: {
    type: String,
    required: true,
    maxlength: 5000,
  },
  attachments: [{
    type: {
      type: String,
      enum: ['image', 'document', 'file', 'friend', 'location'],
      required: true,
    },
    url: {
      type: String,
    },
    filename: {
      type: String,
    },
    size: {
      type: Number,
    },
    // For friend sharing
    friendId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    friendUsername: {
      type: String,
    },
    // For location sharing
    location: {
      latitude: {
        type: Number,
      },
      longitude: {
        type: Number,
      },
      address: {
        type: String,
      },
    },
  }],
  readBy: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    readAt: {
      type: Date,
      default: Date.now,
    },
  }],
}, {
  timestamps: true,
});

// Indexes for efficient querying
messageSchema.index({ roomId: 1, createdAt: -1 });
messageSchema.index({ createdAt: -1 });

export const Message = mongoose.model('Message', messageSchema);

