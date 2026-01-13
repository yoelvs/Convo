import { ChatRoom } from '../models/ChatRoom.js';
import { Message } from '../models/Message.js';
import { GroupInvitation } from '../models/GroupInvitation.js';

export const createGroupRoom = async (creatorId, name, memberIds) => {
  // Filter out creator from memberIds and ensure no duplicates
  const membersToAdd = memberIds
    .filter(id => id.toString() !== creatorId.toString())
    .filter((id, index, self) => 
      index === self.findIndex(m => m.toString() === id.toString())
    );
  
  // Create group with creator and selected members
  const room = new ChatRoom({
    type: 'group',
    name,
    members: [creatorId, ...membersToAdd],
    admin: creatorId,
    managers: [creatorId], // Creator is also a manager
  });

  await room.save();

  return await ChatRoom.findById(room._id)
    .populate('members', 'username avatarUrl isOnline lastSeen')
    .populate('admin', 'username avatarUrl')
    .populate('managers', 'username avatarUrl');
};

export const addMembersToGroup = async (roomId, userId, newMemberIds) => {
  const room = await ChatRoom.findById(roomId);
  if (!room) {
    throw new Error('Room not found');
  }

  // Verify user is member
  const isMember = room.members.some(
    memberId => memberId.toString() === userId.toString()
  );
  if (!isMember) {
    throw new Error('Unauthorized to add members');
  }

  // Add new members (avoid duplicates)
  const existingMemberIds = room.members.map(m => m.toString());
  const membersToAdd = newMemberIds.filter(id => !existingMemberIds.includes(id.toString()));
  
  room.members.push(...membersToAdd);
  await room.save();

  return await ChatRoom.findById(roomId)
    .populate('members', 'username avatarUrl isOnline lastSeen');
};

export const removeMemberFromGroup = async (roomId, userId, memberIdToRemove) => {
  const room = await ChatRoom.findById(roomId);
  if (!room) {
    throw new Error('Room not found');
  }

  // Check if user is trying to remove themselves
  const isRemovingSelf = memberIdToRemove.toString() === userId.toString();
  
  if (isRemovingSelf) {
    // User can always remove themselves (unless they're the admin)
    if (room.admin && room.admin.toString() === userId.toString()) {
      throw new Error('Group admin cannot remove themselves. Delete the group or transfer admin rights first.');
    }
  } else {
    // User is trying to remove someone else - must be admin or manager
    const isAdmin = room.admin && room.admin.toString() === userId.toString();
    const isManager = room.managers && room.managers.some(
      managerId => managerId.toString() === userId.toString()
    );
    
    if (!isAdmin && !isManager) {
      throw new Error('Only group admin or managers can remove other members');
    }
  }

  room.members = room.members.filter(
    memberId => memberId.toString() !== memberIdToRemove.toString()
  );
  await room.save();

  return await ChatRoom.findById(roomId)
    .populate('members', 'username avatarUrl isOnline lastSeen')
    .populate('admin', 'username avatarUrl')
    .populate('managers', 'username avatarUrl');
};

export const leaveGroupChat = async (roomId, userId) => {
  const room = await ChatRoom.findById(roomId);
  if (!room || room.type !== 'group') {
    throw new Error('Group chat not found');
  }

  // Check if user is admin - admin cannot leave (must delete group or transfer admin)
  if (room.admin && room.admin.toString() === userId.toString()) {
    throw new Error('Group admin cannot leave. Delete the group or transfer admin rights first.');
  }

  room.members = room.members.filter(
    memberId => memberId.toString() !== userId.toString()
  );
  await room.save();

  return await ChatRoom.findById(roomId)
    .populate('members', 'username avatarUrl isOnline lastSeen');
};

export const deleteChatRoom = async (roomId, userId) => {
  const room = await ChatRoom.findById(roomId);
  if (!room) {
    throw new Error('Room not found');
  }

  // For private rooms, both members can delete
  // For group rooms, only admin can delete
  if (room.type === 'group') {
    if (!room.admin || room.admin.toString() !== userId.toString()) {
      throw new Error('Only group admin can delete the group');
    }
  } else {
    // Private room - verify user is a member
    const isMember = room.members.some(
      memberId => memberId.toString() === userId.toString()
    );
    if (!isMember) {
      throw new Error('Unauthorized');
    }
  }

  // Delete all messages in the room
  await Message.deleteMany({ roomId });

  // Delete the room
  await ChatRoom.findByIdAndDelete(roomId);

  return { success: true };
};

export const acceptGroupInvitation = async (invitationId, userId) => {
  const invitation = await GroupInvitation.findById(invitationId);
  if (!invitation) {
    throw new Error('Invitation not found');
  }

  if (invitation.toUser.toString() !== userId.toString()) {
    throw new Error('Unauthorized to accept this invitation');
  }

  if (invitation.status !== 'pending') {
    throw new Error('Invitation is not pending');
  }

  // Add user to group
  const room = await ChatRoom.findById(invitation.groupId);
  if (!room) {
    throw new Error('Group not found');
  }

  // Check if user is already a member
  const isMember = room.members.some(
    memberId => memberId.toString() === userId.toString()
  );
  if (!isMember) {
    room.members.push(userId);
    await room.save();
  }

  // Update invitation status
  invitation.status = 'accepted';
  await invitation.save();

  return await ChatRoom.findById(invitation.groupId)
    .populate('members', 'username avatarUrl isOnline lastSeen');
};

export const declineGroupInvitation = async (invitationId, userId) => {
  const invitation = await GroupInvitation.findById(invitationId);
  if (!invitation) {
    throw new Error('Invitation not found');
  }

  if (invitation.toUser.toString() !== userId.toString()) {
    throw new Error('Unauthorized to decline this invitation');
  }

  invitation.status = 'declined';
  await invitation.save();

  return invitation;
};

export const getGroupInvitations = async (userId) => {
  const invitations = await GroupInvitation.find({
    toUser: userId,
    status: 'pending',
  })
    .populate('groupId', 'name type')
    .populate('fromUser', 'username avatarUrl')
    .sort({ createdAt: -1 });

  return invitations;
};

export const updateGroupName = async (roomId, userId, newName) => {
  const room = await ChatRoom.findById(roomId);
  if (!room) {
    throw new Error('Room not found');
  }

  if (room.type !== 'group') {
    throw new Error('Only group chats can have their names updated');
  }

  // Only admin or managers can update group name
  const isAdmin = room.admin && room.admin.toString() === userId.toString();
  const isManager = room.managers && room.managers.some(
    managerId => managerId.toString() === userId.toString()
  );
  
  if (!isAdmin && !isManager) {
    throw new Error('Only group admin or managers can update the group name');
  }

  room.name = newName.trim();
  await room.save();

  return await ChatRoom.findById(roomId)
    .populate('members', 'username avatarUrl isOnline lastSeen')
    .populate('admin', 'username avatarUrl')
    .populate('managers', 'username avatarUrl');
};

export const makeManager = async (roomId, userId, memberIdToPromote) => {
  const room = await ChatRoom.findById(roomId);
  if (!room) {
    throw new Error('Room not found');
  }

  if (room.type !== 'group') {
    throw new Error('Only group chats have managers');
  }

  // Only admin can make managers
  if (!room.admin || room.admin.toString() !== userId.toString()) {
    throw new Error('Only group admin can make managers');
  }

  // Check if member is already a manager
  const isAlreadyManager = room.managers && room.managers.some(
    managerId => managerId.toString() === memberIdToPromote.toString()
  );
  
  if (isAlreadyManager) {
    throw new Error('User is already a manager');
  }

  // Check if member is in the group
  const isMember = room.members.some(
    memberId => memberId.toString() === memberIdToPromote.toString()
  );
  
  if (!isMember) {
    throw new Error('User is not a member of this group');
  }

  // Add to managers array
  if (!room.managers) {
    room.managers = [];
  }
  room.managers.push(memberIdToPromote);
  await room.save();

  return await ChatRoom.findById(roomId)
    .populate('members', 'username avatarUrl isOnline lastSeen')
    .populate('admin', 'username avatarUrl')
    .populate('managers', 'username avatarUrl');
};

export const removeManager = async (roomId, userId, managerIdToRemove) => {
  const room = await ChatRoom.findById(roomId);
  if (!room) {
    throw new Error('Room not found');
  }

  if (room.type !== 'group') {
    throw new Error('Only group chats have managers');
  }

  // Only admin can remove managers
  if (!room.admin || room.admin.toString() !== userId.toString()) {
    throw new Error('Only group admin can remove managers');
  }

  // Cannot remove admin from managers
  if (room.admin.toString() === managerIdToRemove.toString()) {
    throw new Error('Cannot remove admin from managers');
  }

  // Remove from managers array
  if (room.managers) {
    room.managers = room.managers.filter(
      managerId => managerId.toString() !== managerIdToRemove.toString()
    );
    await room.save();
  }

  return await ChatRoom.findById(roomId)
    .populate('members', 'username avatarUrl isOnline lastSeen')
    .populate('admin', 'username avatarUrl')
    .populate('managers', 'username avatarUrl');
};
