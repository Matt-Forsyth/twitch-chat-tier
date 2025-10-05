import { Router, Response } from 'express';
import { authenticateTwitch, AuthRequest } from '../middleware/auth';
import Vote from '../models/Vote';
import TierListConfig from '../models/TierListConfig';

const router = Router();

/**
 * Submit or update a vote
 */
router.post('/', authenticateTwitch, async (req: AuthRequest, res: Response) => {
  try {
    const { tierListId, votes } = req.body;
    const userId = req.twitchAuth!.user_id;
    const channelId = req.twitchAuth!.channel_id;
    
    // Verify tier list exists and is active
    const tierList = await TierListConfig.findById(tierListId);
    if (!tierList) {
      res.status(404).json({ error: 'Tier list not found' });
      return;
    }
    
    if (tierList.status !== 'active') {
      res.status(400).json({ error: 'Tier list is not active' });
      return;
    }
    
    // Upsert vote (update if exists, create if not)
    const vote = await Vote.findOneAndUpdate(
      { tierListId, userId },
      {
        tierListId,
        channelId,
        userId,
        username: userId, // In production, fetch actual username from Twitch
        votes,
      },
      { upsert: true, new: true }
    );
    
    res.json(vote);
  } catch (error) {
    console.error('Error submitting vote:', error);
    res.status(500).json({ error: 'Failed to submit vote' });
  }
});

/**
 * Get user's vote for a tier list
 */
router.get('/:tierListId', authenticateTwitch, async (req: AuthRequest, res: Response) => {
  try {
    const { tierListId } = req.params;
    const userId = req.twitchAuth!.user_id;
    
    const vote = await Vote.findOne({ tierListId, userId });
    
    if (!vote) {
      res.status(404).json({ error: 'No vote found' });
      return;
    }
    
    res.json(vote);
  } catch (error) {
    console.error('Error fetching vote:', error);
    res.status(500).json({ error: 'Failed to fetch vote' });
  }
});

export default router;
