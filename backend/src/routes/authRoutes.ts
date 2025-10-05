import { Router, Response } from 'express';
import { authenticateTwitch, AuthRequest } from '../middleware/auth';

const router = Router();

/**
 * Verify authentication and return user info
 */
router.get('/verify', authenticateTwitch, (req: AuthRequest, res: Response) => {
  res.json({
    authenticated: true,
    user: {
      userId: req.twitchAuth?.user_id,
      channelId: req.twitchAuth?.channel_id,
      role: req.twitchAuth?.role,
    },
  });
});

export default router;
