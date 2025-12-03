import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { logger } from './logger';

const JWT_SECRET = process.env.JWT_SECRET || 'sim-flow-secret-key-change-in-production';

interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  name: string;
}

// Extend Express Request to include user info
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

/**
 * Middleware to authenticate requests using JWT tokens
 * Extracts token from Authorization header and verifies it
 */
export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      // For backwards compatibility during development, check for legacy headers
      const userId = req.headers['x-user-id'] as string;
      const userRole = req.headers['x-user-role'] as string;
      const userName = req.headers['x-user-name'] as string;

      if (userId && userRole) {
        // Legacy header authentication (will be removed after migration)
        req.user = {
          userId,
          email: '', // Not available in legacy format
          role: userRole,
          name: userName || 'Unknown',
        };
        return next();
      }

      logger.warn('Authentication failed: No token provided');
      return res.status(401).json({ error: 'Authentication required' });
    }

    const token = authHeader.replace('Bearer ', '');

    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;

    // Attach user info to request
    req.user = decoded;

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      logger.warn('Authentication failed: Invalid token');
      return res.status(401).json({ error: 'Invalid token' });
    }
    if (error instanceof jwt.TokenExpiredError) {
      logger.warn('Authentication failed: Token expired');
      return res.status(401).json({ error: 'Token expired' });
    }
    logger.error('Authentication error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};

/**
 * Optional authentication - doesn't fail if no token provided
 * Useful for endpoints that work both authenticated and unauthenticated
 */
export const optionalAuthenticate = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return next();
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    req.user = decoded;

    next();
  } catch (error) {
    // Silently fail and continue without authentication
    next();
  }
};
