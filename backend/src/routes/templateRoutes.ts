import { Router, Request, Response } from 'express';
import { authenticateTwitch, AuthRequest } from '../middleware/auth';
import Template from '../models/Template';
import TierListConfig from '../models/TierListConfig';

const router = Router();

// Get all public templates (with filtering and sorting)
router.get('/', async (req: Request, res: Response) => {
  try {
    const { 
      category, 
      tags, 
      search, 
      sort = 'rating', // rating, usage, recent
      limit = 20,
      skip = 0 
    } = req.query;

    console.log('[Templates] Fetch request:', { category, tags, search, sort, limit, skip });

    const query: any = { isPublic: true };

    // Filter out 'undefined' string and empty values
    const cleanCategory = category && category !== 'undefined' ? category : null;
    const cleanTags = tags && tags !== 'undefined' ? tags : null;
    const cleanSearch = search && search !== 'undefined' ? search : null;

    if (cleanCategory) {
      query.category = cleanCategory;
    }

    if (cleanTags) {
      const tagArray = typeof cleanTags === 'string' ? cleanTags.split(',') : cleanTags;
      query.tags = { $in: tagArray };
    }

    if (cleanSearch) {
      query.$or = [
        { title: { $regex: cleanSearch, $options: 'i' } },
        { description: { $regex: cleanSearch, $options: 'i' } },
        { channelName: { $regex: cleanSearch, $options: 'i' } },
      ];
    }

    let sortQuery: any = {};
    switch (sort) {
      case 'rating':
      case 'popularity':
        sortQuery = { voteScore: -1, usageCount: -1 };
        break;
      case 'usage':
        sortQuery = { usageCount: -1 };
        break;
      case 'recent':
        sortQuery = { createdAt: -1 };
        break;
      default:
        sortQuery = { voteScore: -1, usageCount: -1 };
    }

    const templates = await Template.find(query)
      .sort(sortQuery)
      .limit(Number(limit))
      .skip(Number(skip))
      .select('-votes.userId'); // Hide user IDs from public view

    const total = await Template.countDocuments(query);

    console.log('[Templates] Fetch results:', {
      query,
      sortQuery,
      foundCount: templates.length,
      total,
      hasMore: Number(skip) + templates.length < total
    });

    res.json({
      templates,
      total,
      hasMore: Number(skip) + templates.length < total,
    });
  } catch (error: any) {
    console.error('[Templates] Get templates error:', error);
    res.status(500).json({ error: 'Failed to fetch templates' });
  }
});

// ===================================================================
// IMPORTANT: Specific routes must come BEFORE generic /:id route
// to prevent Express from matching "clone", "vote", "meta", etc. as IDs
// ===================================================================

// Get template categories
router.get('/meta/categories', async (req: Request, res: Response) => {
  try {
    const categories = await Template.distinct('category', { isPublic: true, category: { $ne: null } });
    res.json({ categories });
  } catch (error: any) {
    console.error('[Templates] Get categories error:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Get popular tags
router.get('/meta/tags', async (req: Request, res: Response) => {
  try {
    const tags = await Template.aggregate([
      { $match: { isPublic: true } },
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 50 },
    ]);

    res.json({ tags: tags.map(t => ({ tag: t._id, count: t.count })) });
  } catch (error: any) {
    console.error('[Templates] Get tags error:', error);
    res.status(500).json({ error: 'Failed to fetch tags' });
  }
});

// Debug endpoint - get all templates for a channel (including private)
router.get('/debug/channel/:channelId', authenticateTwitch, async (req: AuthRequest, res: Response) => {
  try {
    const channelId = req.params.channelId;
    
    // Only allow broadcasters to see their own templates
    if (req.twitchAuth?.channel_id !== channelId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const templates = await Template.find({ channelId })
      .select('_id tierListId title isPublic category tags createdAt')
      .sort({ createdAt: -1 });

    console.log('[Templates] Debug channel templates:', {
      channelId,
      count: templates.length,
      templates: templates.map(t => ({
        id: t._id,
        tierListId: t.tierListId,
        title: t.title,
        isPublic: t.isPublic,
        category: t.category
      }))
    });

    res.json({ templates });
  } catch (error: any) {
    console.error('[Templates] Debug error:', error);
    res.status(500).json({ error: 'Failed to fetch debug info' });
  }
});

// Publish tier list as template (broadcaster only)
router.post('/publish/:tierListId', authenticateTwitch, async (req: AuthRequest, res: Response) => {
  try {
    console.log('[Templates] Publish request:', {
      tierListId: req.params.tierListId,
      role: req.twitchAuth?.role,
      channelId: req.twitchAuth?.channel_id,
      body: req.body
    });

    if (req.twitchAuth?.role !== 'broadcaster') {
      console.log('[Templates] Publish denied: not broadcaster');
      return res.status(403).json({ error: 'Only broadcasters can publish templates' });
    }

    const { description, category, tags } = req.body;
    const tierListId = req.params.tierListId;
    const channelId = req.twitchAuth!.channel_id;

    // Get the tier list
    const tierList = await TierListConfig.findById(tierListId);
    if (!tierList) {
      return res.status(404).json({ error: 'Tier list not found' });
    }

    if (tierList.channelId !== channelId) {
      return res.status(403).json({ error: 'Not your tier list' });
    }

    // Mark tier list as public
    tierList.isPublic = true;
    if (description) tierList.description = description;
    if (category && category.trim()) {
      tierList.category = category;
    } else {
      tierList.category = undefined;
    }
    if (tags) tierList.tags = Array.isArray(tags) ? tags : [tags];
    await tierList.save();

    console.log('[Templates] Tier list updated:', {
      id: tierList._id,
      title: tierList.title,
      isPublic: tierList.isPublic,
      category: tierList.category,
      tags: tierList.tags
    });

    // Check if template already exists
    let template = await Template.findOne({ tierListId });

    console.log('[Templates] Existing template check:', {
      found: !!template,
      templateId: template?._id
    });

    if (template) {
      // Update existing template
      template.title = tierList.title;
      template.description = description || template.description;
      template.items = tierList.items;
      template.tiers = tierList.tiers;
      template.category = (category && category.trim()) ? category : template.category;
      template.tags = tags ? (Array.isArray(tags) ? tags : [tags]) : template.tags;
      template.isPublic = true;
      await template.save();
    } else {
      // Create new template
      console.log('[Templates] Creating new template with data:', {
        tierListId,
        channelId: tierList.channelId,
        channelName: tierList.channelName,
        title: tierList.title,
        category: (category && category.trim()) ? category : undefined,
        itemCount: tierList.items.length
      });

      template = new Template({
        tierListId,
        channelId: tierList.channelId,
        channelName: tierList.channelName,
        title: tierList.title,
        description,
        items: tierList.items,
        tiers: tierList.tiers,
        category: (category && category.trim()) ? category : undefined,
        tags: tags ? (Array.isArray(tags) ? tags : [tags]) : [],
        isPublic: true,
      });
      await template.save();
      console.log('[Templates] New template created:', template._id);
    }

    console.log('[Templates] Final template state:', {
      id: template._id,
      isPublic: template.isPublic,
      category: template.category,
      title: template.title
    });

    res.json({ message: 'Template published successfully', template });
  } catch (error: any) {
    console.error('[Templates] Publish error:', error);
    res.status(500).json({ error: 'Failed to publish template' });
  }
});

// Unpublish template (broadcaster only)
router.post('/unpublish/:tierListId', authenticateTwitch, async (req: AuthRequest, res: Response) => {
  try {
    console.log('[Templates] Unpublish request:', {
      tierListId: req.params.tierListId,
      role: req.twitchAuth?.role,
      channelId: req.twitchAuth?.channel_id
    });

    if (req.twitchAuth?.role !== 'broadcaster') {
      console.log('[Templates] Unpublish denied: not broadcaster');
      return res.status(403).json({ error: 'Only broadcasters can unpublish templates' });
    }

    const tierListId = req.params.tierListId;
    const channelId = req.twitchAuth!.channel_id;

    // Get the tier list
    const tierList = await TierListConfig.findById(tierListId);
    if (!tierList) {
      console.log('[Templates] Tier list not found:', tierListId);
      return res.status(404).json({ error: 'Tier list not found' });
    }

    if (tierList.channelId !== channelId) {
      console.log('[Templates] Channel ID mismatch:', { tierListChannel: tierList.channelId, userChannel: channelId });
      return res.status(403).json({ error: 'Not your tier list' });
    }

    console.log('[Templates] Current tier list state:', {
      id: tierList._id,
      isPublic: tierList.isPublic,
      title: tierList.title
    });

    // Mark tier list as private
    tierList.isPublic = false;
    await tierList.save();

    console.log('[Templates] Tier list updated to private, now looking for template...');

    // Update template to private - try both string and ObjectId match
    let template = await Template.findOne({ tierListId: tierListId });
    
    // If not found, try with string conversion
    if (!template) {
      console.log('[Templates] Template not found with direct match, trying ObjectId string...');
      const tierListIdString = String(tierList._id);
      template = await Template.findOne({ tierListId: tierListIdString });
    }

    if (template) {
      console.log('[Templates] Found template:', {
        id: template._id,
        tierListId: template.tierListId,
        title: template.title,
        isPublic: template.isPublic
      });
      template.isPublic = false;
      await template.save();
      console.log('[Templates] Template updated to private');
    } else {
      console.log('[Templates] No template found for tier list. Searched for:', {
        tierListId,
        tierListIdString: String(tierList._id)
      });
    }

    console.log('[Templates] Unpublish successful');
    res.json({ message: 'Template unpublished successfully' });
  } catch (error: any) {
    console.error('[Templates] Unpublish error:', error);
    res.status(500).json({ error: 'Failed to unpublish template' });
  }
});

// Clone template to create new tier list
router.post('/:id/clone', authenticateTwitch, async (req: AuthRequest, res: Response) => {
  try {
    console.log('[Templates] Clone request:', {
      templateId: req.params.id,
      channelId: req.twitchAuth?.channel_id,
      userId: req.twitchAuth?.user_id
    });

    const template = await Template.findById(req.params.id);

    if (!template) {
      console.log('[Templates] Clone failed: template not found');
      return res.status(404).json({ error: 'Template not found' });
    }

    if (!template.isPublic) {
      console.log('[Templates] Clone failed: template is private');
      return res.status(403).json({ error: 'This template is private' });
    }

    const channelId = req.twitchAuth!.channel_id;

    // Create new tier list from template
    const newTierList = new TierListConfig({
      channelId,
      channelName: req.twitchAuth!.user_id,
      title: `${template.title} (Copy)`,
      description: template.description,
      items: template.items,
      tiers: template.tiers,
      status: 'draft',
      isPublic: false,
    });

    await newTierList.save();
    console.log('[Templates] New tier list created:', {
      id: newTierList._id,
      title: newTierList.title
    });

    // Increment usage count
    template.usageCount += 1;
    await template.save();

    res.json({ message: 'Template cloned successfully', tierList: newTierList });
  } catch (error: any) {
    console.error('[Templates] Clone error:', error);
    res.status(500).json({ error: 'Failed to clone template' });
  }
});

// Vote on a template (thumbs up/down)
router.post('/:id/vote', authenticateTwitch, async (req: AuthRequest, res: Response) => {
  try {
    const { vote } = req.body;

    if (!vote || (vote !== 'up' && vote !== 'down')) {
      return res.status(400).json({ error: 'Vote must be "up" or "down"' });
    }

    const template = await Template.findById(req.params.id);

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    if (!template.isPublic) {
      return res.status(403).json({ error: 'Cannot vote on private template' });
    }

    const userId = req.twitchAuth!.user_id;

    // Check if user already voted
    const existingVoteIndex = template.votes.findIndex(
      (v: any) => v.userId === userId
    );

    if (existingVoteIndex >= 0) {
      // Update existing vote
      template.votes[existingVoteIndex].vote = vote;
      template.votes[existingVoteIndex].createdAt = new Date();
    } else {
      // Add new vote
      template.votes.push({
        userId,
        username: userId,
        vote,
        createdAt: new Date(),
      } as any);
    }

    // Update vote counts using the method
    (template as any).updateVoteScore();
    
    await template.save();

    res.json({ 
      message: 'Vote submitted successfully', 
      upvotes: template.upvotes,
      downvotes: template.downvotes,
      voteScore: template.voteScore,
    });
  } catch (error: any) {
    console.error('[Templates] Vote error:', error);
    res.status(500).json({ error: 'Failed to submit vote' });
  }
});

// Get user's vote for a template
router.get('/:id/myvote', authenticateTwitch, async (req: AuthRequest, res: Response) => {
  try {
    const template = await Template.findById(req.params.id);

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    const userId = req.twitchAuth!.user_id;
    const userVote = template.votes.find((v: any) => v.userId === userId);

    if (!userVote) {
      return res.json({ vote: null });
    }

    res.json({ vote: userVote.vote });
  } catch (error: any) {
    console.error('[Templates] Get vote error:', error);
    res.status(500).json({ error: 'Failed to fetch vote' });
  }
});

// ===================================================================
// Generic /:id route MUST come after all specific routes above
// ===================================================================

// Get template by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const template = await Template.findById(req.params.id).select('-ratings.userId');

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    if (!template.isPublic) {
      return res.status(403).json({ error: 'This template is private' });
    }

    res.json(template);
  } catch (error: any) {
    console.error('[Templates] Get template error:', error);
    res.status(500).json({ error: 'Failed to fetch template' });
  }
});

export default router;
