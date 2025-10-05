import { Request, Response, NextFunction } from 'express';
import { verifyTwitchToken, TwitchTokenPayload } from '../services/twitchAuth';

export interface AuthRequest extends Request {
  twitchAuth?: TwitchTokenPayload;
}

/**
 * Middleware to authenticate Twitch Extension JWT tokens
 */
export const authenticateTwitch = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;
    console.log('[Auth Middleware] Authorization header:', authHeader?.substring(0, 50));
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('[Auth Middleware] No Bearer token found');
      res.status(401).json({ error: 'No authorization token provided' });
      return;
    }
    
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    console.log('[Auth Middleware] Extracted token:', token?.substring(0, 50));
    console.log('[Auth Middleware] Token length:', token?.length);
    
    const decoded = verifyTwitchToken(token);
    
    req.twitchAuth = decoded;
    next();
  } catch (error) {
    console.error('[Auth Middleware] Error:', error);
    res.status(401).json({ error: 'Invalid authorization token' });
  }
};

/**
 * Middleware to check if user is a broadcaster
 */
export const requireBroadcaster = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (req.twitchAuth?.role !== 'broadcaster') {
    res.status(403).json({ error: 'Broadcaster access required' });
    return;
  }
  next();
};

/**
 * Middleware to check if user is broadcaster or moderator
 */
export const requireModerator = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  const role = req.twitchAuth?.role;
  if (role !== 'broadcaster' && role !== 'moderator') {
    res.status(403).json({ error: 'Moderator or broadcaster access required' });
    return;
  }
  next();
};
