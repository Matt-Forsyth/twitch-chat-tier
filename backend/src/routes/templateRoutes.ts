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

    const query: any = { isPublic: true };

    if (category) {
      query.category = category;
    }

    if (tags) {
      const tagArray = typeof tags === 'string' ? tags.split(',') : tags;
      query.tags = { $in: tagArray };
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { channelName: { $regex: search, $options: 'i' } },
      ];
    }

    let sortQuery: any = {};
    switch (sort) {
      case 'rating':
        sortQuery = { averageRating: -1, totalRatings: -1 };
        break;
      case 'usage':
        sortQuery = { usageCount: -1 };
        break;
      case 'recent':
        sortQuery = { createdAt: -1 };
        break;
      default:
        sortQuery = { averageRating: -1, totalRatings: -1 };
    }

    const templates = await Template.find(query)
      .sort(sortQuery)
      .limit(Number(limit))
      .skip(Number(skip))
      .select('-ratings.userId'); // Hide user IDs from public view

    const total = await Template.countDocuments(query);

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

// Publish tier list as template (broadcaster only)
router.post('/publish/:tierListId', authenticateTwitch, async (req: AuthRequest, res: Response) => {
  try {
    if (req.twitchAuth?.role !== 'broadcaster') {
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

    // Check if template already exists
    let template = await Template.findOne({ tierListId });

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
    }

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

    // Update template to private
    const template = await Template.findOne({ tierListId });
    if (template) {
      console.log('[Templates] Updating template:', template._id);
      template.isPublic = false;
      await template.save();
    } else {
      console.log('[Templates] No template found for tier list:', tierListId);
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
    const template = await Template.findById(req.params.id);

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    if (!template.isPublic) {
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

    // Increment usage count
    template.usageCount += 1;
    await template.save();

    res.json({ message: 'Template cloned successfully', tierList: newTierList });
  } catch (error: any) {
    console.error('[Templates] Clone error:', error);
    res.status(500).json({ error: 'Failed to clone template' });
  }
});

// Rate a template
router.post('/:id/rate', authenticateTwitch, async (req: AuthRequest, res: Response) => {
  try {
    const { rating } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    const template = await Template.findById(req.params.id);

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    if (!template.isPublic) {
      return res.status(403).json({ error: 'Cannot rate private template' });
    }

    const userId = req.twitchAuth!.user_id;

    // Check if user already rated
    const existingRatingIndex = template.ratings.findIndex(
      r => r.userId === userId
    );

    if (existingRatingIndex >= 0) {
      // Update existing rating
      template.ratings[existingRatingIndex].rating = rating;
      template.ratings[existingRatingIndex].createdAt = new Date();
    } else {
      // Add new rating
      template.ratings.push({
        userId,
        username: userId,
        rating,
        createdAt: new Date(),
      });
    }

    // Update average rating
    if (template.ratings.length === 0) {
      template.averageRating = 0;
      template.totalRatings = 0;
    } else {
      const sum = template.ratings.reduce((acc, r) => acc + r.rating, 0);
      template.averageRating = sum / template.ratings.length;
      template.totalRatings = template.ratings.length;
    }
    
    await template.save();

    res.json({ 
      message: 'Rating submitted successfully', 
      averageRating: template.averageRating,
      totalRatings: template.totalRatings,
    });
  } catch (error: any) {
    console.error('[Templates] Rate error:', error);
    res.status(500).json({ error: 'Failed to submit rating' });
  }
});

// Get user's rating for a template
router.get('/:id/myrating', authenticateTwitch, async (req: AuthRequest, res: Response) => {
  try {
    const template = await Template.findById(req.params.id);

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    const userId = req.twitchAuth!.user_id;
    const userRating = template.ratings.find(r => r.userId === userId);

    if (!userRating) {
      return res.json({ rating: null });
    }

    res.json({ rating: userRating.rating });
  } catch (error: any) {
    console.error('[Templates] Get rating error:', error);
    res.status(500).json({ error: 'Failed to fetch rating' });
  }
});

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

export default router;
