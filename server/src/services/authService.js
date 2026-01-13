import { User } from '../models/User.js';
import { hashPassword } from '../utils/password.js';
import { signAccessToken, signRefreshToken } from '../utils/jwt.js';

export const createUser = async (username, email, password, avatarUrl = null) => {
  const passwordHash = await hashPassword(password);
  
  const user = new User({
    username,
    email,
    passwordHash,
    avatarUrl,
  });

  await user.save();
  return user;
};

export const findUserByEmail = async (email) => {
  return await User.findOne({ email });
};

export const findUserById = async (userId) => {
  return await User.findById(userId).select('-passwordHash');
};

export const issueTokens = (userId) => {
  const payload = { userId };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);
  return { accessToken, refreshToken };
};

export const requestPasswordReset = async (email) => {
  const user = await findUserByEmail(email);
  if (!user) {
    // Don't reveal if user exists or not for security
    return { success: true, message: 'If an account with that email exists, a password reset link has been sent.' };
  }

  // In a production environment, you would:
  // 1. Generate a reset token
  // 2. Store it in the database with an expiration time
  // 3. Send an email with the reset link
  // For now, we'll just return a success message
  
  // TODO: Implement email sending functionality
  // const resetToken = generateResetToken();
  // await saveResetToken(user._id, resetToken);
  // await sendPasswordResetEmail(user.email, resetToken);

  return { success: true, message: 'If an account with that email exists, a password reset link has been sent.' };
};

