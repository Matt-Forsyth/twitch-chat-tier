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
    
    console.log('[Vote] Submit/update vote:', {
      tierListId,
      userId,
      newVotesCount: votes.length
    });
    
    // Find existing vote if any
    const existingVote = await Vote.findOne({ tierListId, userId });
    
    let finalVotes = votes;
    
    // If user has existing votes, merge them with new votes
    if (existingVote && existingVote.votes) {
      console.log('[Vote] Found existing vote with', existingVote.votes.length, 'items');
      
      // Create a map of new votes for quick lookup
      const newVotesMap = new Map(votes.map((v: any) => [v.itemId, v.tier]));
      
      // Start with existing votes
      const mergedVotesMap = new Map(
        existingVote.votes.map((v: any) => [v.itemId, v.tier])
      );
      
      // Override/add new votes
      newVotesMap.forEach((tier, itemId) => {
        mergedVotesMap.set(itemId, tier);
      });
      
      // Convert back to array
      finalVotes = Array.from(mergedVotesMap.entries()).map(([itemId, tier]) => ({
        itemId,
        tier
      }));
      
      console.log('[Vote] Merged votes:', {
        existingCount: existingVote.votes.length,
        newCount: votes.length,
        finalCount: finalVotes.length
      });
    } else {
      console.log('[Vote] No existing vote, creating new');
    }
    
    // Upsert vote (update if exists, create if not)
    const vote = await Vote.findOneAndUpdate(
      { tierListId, userId },
      {
        tierListId,
        channelId,
        userId,
        username: userId, // In production, fetch actual username from Twitch
        votes: finalVotes,
      },
      { upsert: true, new: true }
    );
    
    console.log('[Vote] Vote saved successfully with', vote.votes.length, 'items');
    
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
