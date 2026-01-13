import {
  createPost,
  getFeed,
  toggleLike,
  addComment,
  deletePost,
  editComment,
  deleteComment,
} from '../services/postService.js';

export const create = async (req, res, next) => {
  try {
    const authorId = req.user._id;
    const { text, mediaUrls = [] } = req.body;

    const post = await createPost(authorId, text, mediaUrls);
    res.status(201).json(post);
  } catch (error) {
    next(error);
  }
};

export const feed = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const cursor = req.query.cursor || null;
    const limit = parseInt(req.query.limit) || 20;

    const result = await getFeed(userId, cursor, limit);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const like = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { postId } = req.params;

    const post = await toggleLike(postId, userId);
    res.json(post);
  } catch (error) {
    next(error);
  }
};

export const comment = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { postId } = req.params;
    const { text } = req.body;

    const post = await addComment(postId, userId, text);
    res.json(post);
  } catch (error) {
    next(error);
  }
};

export const deletePostController = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { postId } = req.params;

    const result = await deletePost(postId, userId);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const editCommentController = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { postId, commentId } = req.params;
    const { text } = req.body;

    const post = await editComment(postId, commentId, userId, text);
    res.json(post);
  } catch (error) {
    next(error);
  }
};

export const deleteCommentController = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { postId, commentId } = req.params;

    const post = await deleteComment(postId, commentId, userId);
    res.json(post);
  } catch (error) {
    next(error);
  }
};
