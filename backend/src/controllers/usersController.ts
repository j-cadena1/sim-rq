import { Request, Response } from 'express';
import { query } from '../db';
import { logger } from '../middleware/logger';

// Helper to convert snake_case to camelCase
/* eslint-disable @typescript-eslint/no-explicit-any */
const toCamelCase = <T>(obj: any): T => {
  if (Array.isArray(obj)) {
    return obj.map(v => toCamelCase(v)) as any;
  }
  if (obj !== null && typeof obj === 'object' && obj.constructor === Object) {
    return Object.keys(obj).reduce((result, key) => {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      (result as any)[camelKey] = toCamelCase((obj as any)[key]);
      return result;
    }, {} as T);
  }
  return obj as T;
};
/* eslint-enable @typescript-eslint/no-explicit-any */

// Get all users
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const { role } = req.query;

    let queryText = 'SELECT id, name, email, role, avatar_url FROM users';
    const params: string[] = [];

    if (role && typeof role === 'string') {
      queryText += ' WHERE role = $1';
      params.push(role);
    }

    queryText += ' ORDER BY name ASC';

    const result = await query(queryText, params);

    res.json({ users: toCamelCase(result.rows) });
  } catch (error) {
    logger.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

// Get current user (for session)
export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    const userId = req.headers['x-user-id'] as string;

    if (!userId) {
      // Return default qAdmin user
      const result = await query(
        "SELECT id, name, email, role, avatar_url FROM users WHERE email = 'qadmin@simflow.local'"
      );

      if (result.rows.length > 0) {
        return res.json({ user: toCamelCase(result.rows[0]) });
      }

      return res.status(404).json({ error: 'User not found' });
    }

    const result = await query(
      'SELECT id, name, email, role, avatar_url FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: toCamelCase(result.rows[0]) });
  } catch (error) {
    logger.error('Error fetching current user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};
