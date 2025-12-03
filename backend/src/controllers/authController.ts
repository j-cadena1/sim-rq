import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { query } from '../db';
import { logger } from '../middleware/logger';
import { toCamelCase } from '../utils/caseConverter';

// JWT secret - in production, this should be in environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'sim-flow-secret-key-change-in-production';
const JWT_EXPIRATION = '24h';

interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: string;
  avatarUrl: string;
}

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user by email
    const result = await query(
      'SELECT id, name, email, password_hash, role, avatar_url FROM users WHERE email = $1',
      [email.toLowerCase().trim()]
    );

    if (result.rows.length === 0) {
      // Generic error message to prevent user enumeration
      logger.warn(`Failed login attempt for email: ${email}`);
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = toCamelCase<User>(result.rows[0]);

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      logger.warn(`Failed login attempt for user: ${user.id} (${email})`);
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRATION }
    );

    // Return user info and token (exclude password hash)
    const userResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatarUrl: user.avatarUrl,
    };

    logger.info(`User logged in: ${user.id} (${email}) - Role: ${user.role}`);

    res.json({
      user: userResponse,
      token,
    });
  } catch (error) {
    logger.error('Error during login:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};

export const verifyToken = async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: string;
      email: string;
      role: string;
      name: string;
    };

    // Optionally verify user still exists in database
    const result = await query(
      'SELECT id, name, email, role, avatar_url FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'User not found' });
    }

    const user = toCamelCase(result.rows[0]);

    res.json({ user, valid: true });
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ error: 'Invalid token', valid: false });
    }
    logger.error('Error verifying token:', error);
    res.status(500).json({ error: 'Token verification failed' });
  }
};
