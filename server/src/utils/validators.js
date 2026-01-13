import Joi from 'joi';

export const signupSchema = Joi.object({
  username: Joi.string().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export const updateProfileSchema = Joi.object({
  username: Joi.string().min(3).max(30),
  bio: Joi.string().max(500),
  avatarUrl: Joi.string().uri(),
  theme: Joi.string().valid('light', 'dark'),
  showOnlineStatus: Joi.alternatives().try(
    Joi.boolean(),
    Joi.string().valid('true', 'false')
  ),
});

export const createPostSchema = Joi.object({
  text: Joi.string().max(5000).allow(''),
  mediaUrls: Joi.array().items(Joi.string().uri()),
});

export const sendMessageSchema = Joi.object({
  content: Joi.string().max(5000).required(),
  toUserId: Joi.string().when('roomId', {
    is: Joi.exist(),
    then: Joi.optional(),
    otherwise: Joi.required(),
  }),
  roomId: Joi.string(),
});

export const groupMessageSchema = Joi.object({
  roomId: Joi.string().required(),
  content: Joi.string().max(5000).required(),
});

