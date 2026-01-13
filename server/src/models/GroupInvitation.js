import mongoose from 'mongoose';

const groupInvitationSchema = new mongoose.Schema({
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ChatRoom',
    required: true,
    index: true,
  },
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

// Index to prevent duplicate invitations
groupInvitationSchema.index({ groupId: 1, toUser: 1 }, { unique: true });

export const GroupInvitation = mongoose.model('GroupInvitation', groupInvitationSchema);

