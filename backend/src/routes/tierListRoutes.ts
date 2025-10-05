import { Router, Response } from 'express';
import { authenticateTwitch, requireBroadcaster, AuthRequest } from '../middleware/auth';
import TierListConfig from '../models/TierListConfig';
import Vote from '../models/Vote';

const router = Router();

/**
 * Create a new tier list (broadcaster only)
 */
router.post('/', authenticateTwitch, requireBroadcaster, async (req: AuthRequest, res: Response) => {
  try {
    const { title, items, tiers } = req.body;
    const channelId = req.twitchAuth!.channel_id;
    
    const tierList = new TierListConfig({
      channelId,
      channelName: req.twitchAuth!.user_id,
      title,
      items,
      tiers: tiers || ['S', 'A', 'B', 'C', 'D', 'F'],
      status: 'draft',
      allowRealTimeUpdates: true,
    });
    
    await tierList.save();
    
    res.status(201).json(tierList);
  } catch (error) {
    console.error('Error creating tier list:', error);
    res.status(500).json({ error: 'Failed to create tier list' });
  }
});

/**
 * Get all tier lists for a channel
 * Supports both authenticated (from Twitch extension) and public access (for OBS with ?channelId=...)
 */
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    let channelId: string;
    
    console.log('[TierList GET] Query params:', req.query);
    console.log('[TierList GET] Auth header:', req.headers.authorization);
    
    // Check if channelId is provided as query parameter (for OBS/public access)
    if (req.query.channelId) {
      channelId = req.query.channelId as string;
      console.log('[TierList GET] Using channelId from query:', channelId);
    } else {
      // Otherwise, authenticate and use the auth channelId
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No authorization token provided' });
      }
      
      const token = authHeader.substring(7);
      const { verifyTwitchToken } = await import('../services/twitchAuth');
      const decoded = await verifyTwitchToken(token);
      
      if (!decoded) {
        return res.status(401).json({ error: 'Invalid token' });
      }
      
      channelId = decoded.channel_id;
      console.log('[TierList GET] Using channelId from auth:', channelId);
    }
    
    const tierLists = await TierListConfig.find({ channelId }).sort({ createdAt: -1 });
    console.log('[TierList GET] Found tier lists:', tierLists.length, 'for channel:', channelId);
    
    res.json(tierLists);
  } catch (error) {
    console.error('Error fetching tier lists:', error);
    res.status(500).json({ error: 'Failed to fetch tier lists' });
  }
});

/**
 * Get a specific tier list by ID
 */
router.get('/:id', authenticateTwitch, async (req: AuthRequest, res: Response) => {
  try {
    const tierList = await TierListConfig.findById(req.params.id);
    
    if (!tierList) {
      res.status(404).json({ error: 'Tier list not found' });
      return;
    }
    
    res.json(tierList);
  } catch (error) {
    console.error('Error fetching tier list:', error);
    res.status(500).json({ error: 'Failed to fetch tier list' });
  }
});

/**
 * Update a tier list (broadcaster only)
 */
router.put('/:id', authenticateTwitch, requireBroadcaster, async (req: AuthRequest, res: Response) => {
  try {
    const { title, items, tiers, status } = req.body;
    const channelId = req.twitchAuth!.channel_id;
    
    const tierList = await TierListConfig.findOneAndUpdate(
      { _id: req.params.id, channelId },
      { title, items, tiers, status },
      { new: true }
    );
    
    if (!tierList) {
      res.status(404).json({ error: 'Tier list not found' });
      return;
    }
    
    res.json(tierList);
  } catch (error) {
    console.error('Error updating tier list:', error);
    res.status(500).json({ error: 'Failed to update tier list' });
  }
});

/**
 * Delete a tier list (broadcaster only)
 */
router.delete('/:id', authenticateTwitch, requireBroadcaster, async (req: AuthRequest, res: Response) => {
  try {
    const channelId = req.twitchAuth!.channel_id;
    
    const tierList = await TierListConfig.findOneAndDelete({
      _id: req.params.id,
      channelId
    });
    
    if (!tierList) {
      res.status(404).json({ error: 'Tier list not found' });
      return;
    }
    
    // Also delete all votes associated with this tier list
    await Vote.deleteMany({ tierListId: req.params.id });
    
    res.json({ message: 'Tier list deleted successfully', tierList });
  } catch (error) {
    console.error('Error deleting tier list:', error);
    res.status(500).json({ error: 'Failed to delete tier list' });
  }
});

/**
 * Activate a tier list (broadcaster only)
 */
router.post('/:id/activate', authenticateTwitch, requireBroadcaster, async (req: AuthRequest, res: Response) => {
  try {
    const channelId = req.twitchAuth!.channel_id;
    
    // Deactivate all other tier lists for this channel
    await TierListConfig.updateMany(
      { channelId, status: 'active' },
      { status: 'completed' }
    );
    
    // Activate the selected tier list
    const tierList = await TierListConfig.findOneAndUpdate(
      { _id: req.params.id, channelId },
      { status: 'active', startTime: new Date() },
      { new: true }
    );
    
    if (!tierList) {
      res.status(404).json({ error: 'Tier list not found' });
      return;
    }
    
    res.json(tierList);
  } catch (error) {
    console.error('Error activating tier list:', error);
    res.status(500).json({ error: 'Failed to activate tier list' });
  }
});

/**
 * Complete a tier list (broadcaster only)
 */
router.post('/:id/complete', authenticateTwitch, requireBroadcaster, async (req: AuthRequest, res: Response) => {
  try {
    const channelId = req.twitchAuth!.channel_id;
    
    const tierList = await TierListConfig.findOneAndUpdate(
      { _id: req.params.id, channelId },
      { status: 'completed', endTime: new Date() },
      { new: true }
    );
    
    if (!tierList) {
      res.status(404).json({ error: 'Tier list not found' });
      return;
    }
    
    res.json(tierList);
  } catch (error) {
    console.error('Error completing tier list:', error);
    res.status(500).json({ error: 'Failed to complete tier list' });
  }
});

/**
 * Get aggregated results for a tier list
 * Public endpoint - no authentication required (for OBS overlay)
 */
router.get('/:id/results', async (req: AuthRequest, res: Response) => {
  try {
    const tierListId = req.params.id;
    
    const tierList = await TierListConfig.findById(tierListId);
    if (!tierList) {
      res.status(404).json({ error: 'Tier list not found' });
      return;
    }
    
    // Get all votes for this tier list
    const votes = await Vote.find({ tierListId });
    
    // Aggregate votes by item
    const itemResults = new Map();
    
    tierList.items.forEach(item => {
      itemResults.set(item.id, {
        item,
        tierCounts: {},
        totalVotes: 0,
        averageTier: '',
      });
    });
    
    // Count votes for each item
    votes.forEach(vote => {
      vote.votes.forEach(itemVote => {
        const result = itemResults.get(itemVote.itemId);
        if (result) {
          result.tierCounts[itemVote.tier] = (result.tierCounts[itemVote.tier] || 0) + 1;
          result.totalVotes++;
        }
      });
    });
    
    // Calculate average tier for each item
    const tierValues = { S: 6, A: 5, B: 4, C: 3, D: 2, F: 1 };
    const tierNames = ['F', 'D', 'C', 'B', 'A', 'S'];
    
    itemResults.forEach(result => {
      if (result.totalVotes > 0) {
        let weightedSum = 0;
        Object.entries(result.tierCounts).forEach(([tier, count]) => {
          weightedSum += tierValues[tier as keyof typeof tierValues] * (count as number);
        });
        const avgValue = Math.round(weightedSum / result.totalVotes);
        result.averageTier = tierNames[avgValue - 1] || 'C';
      } else {
        result.averageTier = 'C';
      }
    });
    
    res.json({
      tierList,
      results: Array.from(itemResults.values()),
      totalVoters: votes.length,
    });
  } catch (error) {
    console.error('Error fetching results:', error);
    res.status(500).json({ error: 'Failed to fetch results' });
  }
});

/**
 * Reset votes for a tier list (broadcaster only)
 */
router.post('/:id/reset', authenticateTwitch, requireBroadcaster, async (req: AuthRequest, res: Response) => {
  try {
    const tierListId = req.params.id;
    const channelId = req.twitchAuth!.channel_id;
    
    const tierList = await TierListConfig.findOne({ _id: tierListId, channelId });
    if (!tierList) {
      res.status(404).json({ error: 'Tier list not found' });
      return;
    }
    
    // Delete all votes for this tier list
    await Vote.deleteMany({ tierListId });
    
    res.json({ message: 'Votes reset successfully' });
  } catch (error) {
    console.error('Error resetting votes:', error);
    res.status(500).json({ error: 'Failed to reset votes' });
  }
});

export default router;
