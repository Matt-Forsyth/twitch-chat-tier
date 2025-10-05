import { Router, Response } from 'express';
import { authenticateTwitch, requireBroadcaster, AuthRequest } from '../middleware/auth';
import Suggestion from '../models/Suggestion';
import TierListConfig from '../models/TierListConfig';

const router = Router();

/**
 * Create a new suggestion (authenticated viewers)
 */
router.post('/', authenticateTwitch, async (req: AuthRequest, res: Response) => {
  try {
    const { tierListId, itemName, imageUrl } = req.body;
    const userId = req.twitchAuth!.user_id;
    const channelId = req.twitchAuth!.channel_id;
    
    if (!itemName || !itemName.trim()) {
      res.status(400).json({ error: 'Item name is required' });
      return;
    }
    
    // Check if tier list exists and is active
    const tierList = await TierListConfig.findById(tierListId);
    if (!tierList) {
      res.status(404).json({ error: 'Tier list not found' });
      return;
    }
    
    if (tierList.status !== 'active') {
      res.status(400).json({ error: 'Can only suggest items for active tier lists' });
      return;
    }
    
    const suggestion = new Suggestion({
      tierListId,
      channelId,
      userId,
      username: req.twitchAuth!.user_id,
      itemName: itemName.trim(),
      imageUrl: imageUrl?.trim(),
      status: 'pending',
    });
    
    await suggestion.save();
    
    res.status(201).json(suggestion);
  } catch (error: any) {
    if (error.code === 11000) {
      res.status(400).json({ error: 'You have already suggested this item' });
      return;
    }
    console.error('Error creating suggestion:', error);
    res.status(500).json({ error: 'Failed to create suggestion' });
  }
});

/**
 * Get all suggestions for a tier list (broadcaster or public)
 */
router.get('/tierlist/:tierListId', authenticateTwitch, async (req: AuthRequest, res: Response) => {
  try {
    const { tierListId } = req.params;
    const { status } = req.query;
    
    const query: any = { tierListId };
    if (status) {
      query.status = status;
    }
    
    const suggestions = await Suggestion.find(query).sort({ createdAt: -1 });
    
    res.json(suggestions);
  } catch (error) {
    console.error('Error fetching suggestions:', error);
    res.status(500).json({ error: 'Failed to fetch suggestions' });
  }
});

/**
 * Approve a suggestion and add to tier list (broadcaster only)
 */
router.post('/:id/approve', authenticateTwitch, requireBroadcaster, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    const suggestion = await Suggestion.findById(id);
    if (!suggestion) {
      res.status(404).json({ error: 'Suggestion not found' });
      return;
    }
    
    if (suggestion.status !== 'pending') {
      res.status(400).json({ error: 'Suggestion already processed' });
      return;
    }
    
    // Add item to tier list
    const tierList = await TierListConfig.findById(suggestion.tierListId);
    if (!tierList) {
      res.status(404).json({ error: 'Tier list not found' });
      return;
    }
    
    const newItem = {
      id: Date.now().toString(),
      name: suggestion.itemName,
      imageUrl: suggestion.imageUrl,
    };
    
    tierList.items.push(newItem);
    await tierList.save();
    
    // Update suggestion status
    suggestion.status = 'approved';
    await suggestion.save();
    
    res.json({ suggestion, tierList });
  } catch (error) {
    console.error('Error approving suggestion:', error);
    res.status(500).json({ error: 'Failed to approve suggestion' });
  }
});

/**
 * Reject a suggestion (broadcaster only)
 */
router.post('/:id/reject', authenticateTwitch, requireBroadcaster, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    const suggestion = await Suggestion.findById(id);
    if (!suggestion) {
      res.status(404).json({ error: 'Suggestion not found' });
      return;
    }
    
    if (suggestion.status !== 'pending') {
      res.status(400).json({ error: 'Suggestion already processed' });
      return;
    }
    
    suggestion.status = 'rejected';
    await suggestion.save();
    
    res.json(suggestion);
  } catch (error) {
    console.error('Error rejecting suggestion:', error);
    res.status(500).json({ error: 'Failed to reject suggestion' });
  }
});

/**
 * Delete a suggestion (broadcaster only)
 */
router.delete('/:id', authenticateTwitch, requireBroadcaster, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    const suggestion = await Suggestion.findByIdAndDelete(id);
    if (!suggestion) {
      res.status(404).json({ error: 'Suggestion not found' });
      return;
    }
    
    res.json({ message: 'Suggestion deleted successfully' });
  } catch (error) {
    console.error('Error deleting suggestion:', error);
    res.status(500).json({ error: 'Failed to delete suggestion' });
  }
});

export default router;
