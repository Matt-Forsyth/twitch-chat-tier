import { Router, Response } from 'express';
import { authenticateTwitch, AuthRequest } from '../middleware/auth';
import Analytics from '../models/Analytics';
import TierListConfig from '../models/TierListConfig';
import Vote from '../models/Vote';

const router = Router();

/**
 * Generate analytics for a completed tier list
 */
async function generateAnalytics(tierListId: string) {
  const tierList = await TierListConfig.findById(tierListId);
  if (!tierList) {
    throw new Error('Tier list not found');
  }
  
  // Get all votes for this tier list
  const votes = await Vote.find({ tierListId });
  const totalVoters = votes.length;
  
  // Calculate tier distribution and item statistics
  const tierDistribution: Record<string, number> = {};
  const itemStats: Record<string, { tiers: string[]; totalVotes: number }> = {};
  
  let totalVotes = 0;
  
  votes.forEach((vote) => {
    vote.votes.forEach((itemVote) => {
      totalVotes++;
      
      // Track tier distribution
      tierDistribution[itemVote.tier] = (tierDistribution[itemVote.tier] || 0) + 1;
      
      // Track item stats
      if (!itemStats[itemVote.itemId]) {
        itemStats[itemVote.itemId] = { tiers: [], totalVotes: 0 };
      }
      itemStats[itemVote.itemId].tiers.push(itemVote.tier);
      itemStats[itemVote.itemId].totalVotes++;
    });
  });
  
  // Calculate average tier for each item
  const tierValues: Record<string, number> = { S: 6, A: 5, B: 4, C: 3, D: 2, F: 1 };
  const topItems = Object.entries(itemStats)
    .map(([itemId, stats]) => {
      const item = tierList.items.find((i) => i.id === itemId);
      if (!item) return null;
      
      const tierSum = stats.tiers.reduce((sum, tier) => sum + (tierValues[tier] || 0), 0);
      const avgValue = tierSum / stats.tiers.length;
      const avgTier = Object.entries(tierValues).reduce((closest, [tier, value]) => {
        return Math.abs(value - avgValue) < Math.abs(tierValues[closest] - avgValue) ? tier : closest;
      }, 'C');
      
      return {
        itemName: item.name,
        averageTier: avgTier,
        voteCount: stats.totalVotes,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null)
    .sort((a, b) => tierValues[b.averageTier] - tierValues[a.averageTier])
    .slice(0, 10); // Top 10 items
  
  // Calculate percentage distribution
  const tierPercentages: Record<string, number> = {};
  Object.entries(tierDistribution).forEach(([tier, count]) => {
    tierPercentages[tier] = totalVotes > 0 ? (count / totalVotes) * 100 : 0;
  });
  
  const analytics = await Analytics.findOneAndUpdate(
    { tierListId },
    {
      tierListId,
      channelId: tierList.channelId,
      title: tierList.title,
      totalVotes,
      totalVoters,
      itemCount: tierList.items.length,
      completedAt: tierList.endTime || new Date(),
      averageTierDistribution: tierPercentages,
      topItems,
    },
    { upsert: true, new: true }
  );
  
  return analytics;
}

/**
 * Get analytics for a specific tier list
 */
router.get('/tierlist/:tierListId', authenticateTwitch, async (req: AuthRequest, res: Response) => {
  try {
    const { tierListId } = req.params;
    
    let analytics = await Analytics.findOne({ tierListId });
    
    // If analytics don't exist, generate them
    if (!analytics) {
      const tierList = await TierListConfig.findById(tierListId);
      if (!tierList) {
        res.status(404).json({ error: 'Tier list not found' });
        return;
      }
      
      if (tierList.status === 'completed') {
        analytics = await generateAnalytics(tierListId);
      } else {
        res.status(400).json({ error: 'Analytics only available for completed tier lists' });
        return;
      }
    }
    
    res.json(analytics);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

/**
 * Get all analytics for a channel
 */
router.get('/channel', authenticateTwitch, async (req: AuthRequest, res: Response) => {
  try {
    const channelId = req.twitchAuth!.channel_id;
    
    const analytics = await Analytics.find({ channelId }).sort({ completedAt: -1 });
    
    res.json(analytics);
  } catch (error) {
    console.error('Error fetching channel analytics:', error);
    res.status(500).json({ error: 'Failed to fetch channel analytics' });
  }
});

/**
 * Get aggregated statistics for a channel
 */
router.get('/channel/summary', authenticateTwitch, async (req: AuthRequest, res: Response) => {
  try {
    const channelId = req.twitchAuth!.channel_id;
    
    const allAnalytics = await Analytics.find({ channelId });
    
    const summary = {
      totalTierLists: allAnalytics.length,
      totalVotes: allAnalytics.reduce((sum, a) => sum + a.totalVotes, 0),
      totalVoters: allAnalytics.reduce((sum, a) => sum + a.totalVoters, 0),
      averageVotesPerList: 0,
      averageVotersPerList: 0,
      mostPopularTier: '',
      tierDistribution: {} as Record<string, number>,
    };
    
    if (allAnalytics.length > 0) {
      summary.averageVotesPerList = summary.totalVotes / allAnalytics.length;
      summary.averageVotersPerList = summary.totalVoters / allAnalytics.length;
      
      // Aggregate tier distribution
      const aggregatedTiers: Record<string, number> = {};
      allAnalytics.forEach((analytics) => {
        Object.entries(analytics.averageTierDistribution as Record<string, number>).forEach(([tier, percentage]) => {
          aggregatedTiers[tier] = (aggregatedTiers[tier] || 0) + percentage;
        });
      });
      
      // Calculate average percentage for each tier
      Object.keys(aggregatedTiers).forEach((tier) => {
        aggregatedTiers[tier] /= allAnalytics.length;
      });
      
      summary.tierDistribution = aggregatedTiers;
      summary.mostPopularTier = Object.entries(aggregatedTiers).reduce((a, b) => (b[1] > a[1] ? b : a))[0];
    }
    
    res.json(summary);
  } catch (error) {
    console.error('Error fetching channel summary:', error);
    res.status(500).json({ error: 'Failed to fetch channel summary' });
  }
});

/**
 * Manually trigger analytics generation for a tier list
 */
router.post('/generate/:tierListId', authenticateTwitch, async (req: AuthRequest, res: Response) => {
  try {
    const { tierListId } = req.params;
    
    const tierList = await TierListConfig.findById(tierListId);
    if (!tierList) {
      res.status(404).json({ error: 'Tier list not found' });
      return;
    }
    
    if (tierList.status !== 'completed') {
      res.status(400).json({ error: 'Can only generate analytics for completed tier lists' });
      return;
    }
    
    const analytics = await generateAnalytics(tierListId);
    
    res.json(analytics);
  } catch (error) {
    console.error('Error generating analytics:', error);
    res.status(500).json({ error: 'Failed to generate analytics' });
  }
});

export default router;
