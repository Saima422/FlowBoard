import { Response } from 'express';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth';
import { generateToken } from '../utils/jwt';
import { decryptCredentials, isEncrypted, getPublicKeyPem } from '../utils/crypto';

/**
 * Get public key for client-side credential encryption
 */
export const getPublicKey = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const publicKey = getPublicKeyPem();
    res.status(200).json({
      success: true,
      data: {
        publicKey,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error fetching public key',
      error: error.message,
    });
  }
};

export const register = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    let { name, email, password } = req.body;
    const { role } = req.body;

    // Decrypt credentials if they are encrypted
    if (isEncrypted(password)) {
      try {
        const decrypted = decryptCredentials({ email, password, name });
        email = decrypted.email;
        password = decrypted.password;
        name = decrypted.name || name;
      } catch (decryptError) {
        res.status(400).json({
          success: false,
          message: 'Failed to decrypt credentials',
        });
        return;
      }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({
        success: false,
        message: 'Please provide a valid email address',
      });
      return;
    }

    // Validate password strength
    if (password.length < 8) {
      res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long',
      });
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
    if (!passwordRegex.test(password)) {
      res.status(400).json({
        success: false,
        message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)',
      });
      return;
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({
        success: false,
        message: 'User with this email already exists. Please login instead.',
      });
      return;
    }

    // Create new user
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'editor',
    });

    // Generate token
    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
        },
        token,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error registering user',
      error: error.message,
    });
  }
};

export const login = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    let { email, password } = req.body;

    // Decrypt credentials if they are encrypted
    if (isEncrypted(password)) {
      try {
        const decrypted = decryptCredentials({ email, password });
        email = decrypted.email;
        password = decrypted.password;
      } catch (decryptError) {
        res.status(400).json({
          success: false,
          message: 'Failed to decrypt credentials',
        });
        return;
      }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({
        success: false,
        message: 'Please provide a valid email address',
      });
      return;
    }

    // Find user with password field
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'No account found with this email. Please sign up first.',
      });
      return;
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        message: 'Incorrect password. Please try again.',
      });
      return;
    }

    // Generate token
    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
    });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
        },
        token,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error logging in',
      error: error.message,
    });
  }
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Not authenticated',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: req.user._id,
          name: req.user.name,
          email: req.user.email,
          role: req.user.role,
          avatar: req.user.avatar,
        },
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user',
      error: error.message,
    });
  }
};

