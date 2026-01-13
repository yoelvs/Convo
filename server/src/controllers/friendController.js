import {
  sendFriendRequest,
  acceptFriendRequest,
  declineFriendRequest,
  getFriendRequests,
  removeFriend,
} from '../services/friendService.js';

export const request = async (req, res, next) => {
  try {
    const fromUserId = req.user._id;
    const { toUserId } = req.body;

    const friendRequest = await sendFriendRequest(fromUserId, toUserId);
    res.status(201).json(friendRequest);
  } catch (error) {
    next(error);
  }
};

export const accept = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { requestId } = req.body;

    const friendRequest = await acceptFriendRequest(requestId, userId);
    res.json(friendRequest);
  } catch (error) {
    next(error);
  }
};

export const decline = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { requestId } = req.body;

    const friendRequest = await declineFriendRequest(requestId, userId);
    res.json(friendRequest);
  } catch (error) {
    next(error);
  }
};

export const requests = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const result = await getFriendRequests(userId);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const remove = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { friendId } = req.body;

    if (!friendId) {
      return res.status(400).json({ error: 'Friend ID is required' });
    }

    await removeFriend(userId, friendId);
    res.json({ success: true, message: 'Friend removed successfully' });
  } catch (error) {
    next(error);
  }
};

