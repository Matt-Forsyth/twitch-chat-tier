# Template System User Guide

## 📚 Table of Contents
- [Overview](#overview)
- [Publishing Templates](#publishing-templates)
- [Browsing Templates](#browsing-templates)
- [Cloning Templates](#cloning-templates)
- [Rating Templates](#rating-templates)
- [Managing Published Templates](#managing-published-templates)
- [Best Practices](#best-practices)

## Overview

The Template System allows streamers to share their tier lists with the entire Twitch community. Other broadcasters can browse, clone, and rate these templates, making it easy to get started with popular tier list formats.

### Key Benefits
- 🚀 **Quick Start**: Clone existing templates instead of creating from scratch
- 🌐 **Community Sharing**: Share your tier lists with other streamers
- ⭐ **Quality Ratings**: Find the best templates through community ratings
- 🏷️ **Easy Discovery**: Search and filter by categories and tags

## Publishing Templates

### Prerequisites
- You must be a broadcaster
- The tier list must be in "completed" status
- The tier list should have at least some items

### Steps to Publish

1. **Navigate to Config Panel**
   - Go to your Twitch Extension config page
   - Find your completed tier list in the "All Tier Lists" section

2. **Click "📤 Publish as Template"**
   - This button appears only on completed tier lists
   - Opens the publish modal

3. **Fill in Template Details**
   
   **Title** (Required, Auto-filled)
   - Uses your tier list's existing title
   - Cannot be changed during publish (edit the tier list first if needed)
   
   **Description** (Optional)
   - Add a detailed description of your tier list
   - Explain what it ranks, any special criteria, etc.
   - Max 500 characters
   - Example: "Ranking all Apex Legends characters by viability in Season 19 competitive play"
   
   **Category** (Required)
   - Select from predefined categories:
     - Gaming
     - Movies
     - TV Shows
     - Music
     - Food & Drink
     - Sports
     - Other
   - Helps users find templates in their area of interest
   
   **Tags** (Optional)
   - Add comma-separated tags
   - Max 10 tags
   - Use relevant keywords for better discoverability
   - Examples: "apex-legends, fps, competitive, season-19"

4. **Click "Publish"**
   - Template is immediately available to the community
   - You'll see a "🌐 PUBLIC" badge on your tier list
   - Usage counter starts at 0

### What Gets Published
- **Tier List Structure**: All tiers (S, A, B, C, D, F) and their colors
- **Items**: All items with names and images
- **Metadata**: Title, description, category, tags
- **Configuration**: Voting settings, tier structure

### What Doesn't Get Published
- **Votes**: User votes are NOT included (templates start fresh)
- **Activity Status**: Clone is always in "draft" status
- **Private Data**: Channel information stays private

## Browsing Templates

### Accessing the Template Browser

**Option 1: From Panel (No Active Tier List)**
- When no tier list is active, click "🔍 Browse Community Templates"

**Option 2: From Config Panel** (Coming in future update)
- Currently only accessible when no tier list is active

### Using the Browser

**Search Bar**
- Type keywords to search across:
  - Template titles
  - Descriptions
  - Tags
- Real-time filtering as you type

**Category Filter**
- Dropdown to filter by specific category
- Select "All Categories" to see everything

**Sort Options**
- **Top Rated**: Highest average star ratings first
- **Most Used**: Most cloned templates first
- **Most Recent**: Newest templates first

**Template Cards**
Each template shows:
- ⭐ Star rating (e.g., ★★★★☆ 4.2)
- 📊 Total ratings count
- 👥 Usage count (times cloned)
- 📦 Item count
- 🏷️ Category badge
- #️⃣ Tag chips
- 📝 Description (if provided)
- 📅 Published date

**Load More**
- Click "Load More" at the bottom to see additional results
- Loads 12 templates at a time

## Cloning Templates

### How to Clone

1. **Find a Template**
   - Browse or search for a template you like
   - Review the rating, usage count, and items

2. **Click "Clone Template"**
   - Button turns to "Cloning..." while processing
   - Takes 1-2 seconds to complete

3. **Success**
   - You'll see "Template cloned successfully!"
   - The new tier list appears in your Config Panel as a draft
   - Template's usage count increments by 1

### After Cloning

The cloned tier list is a **complete copy** with:
- ✅ All items and images
- ✅ All tiers and colors
- ✅ All configuration settings
- ✅ Status: Draft (not active yet)

You can:
- Edit the title
- Add/remove/modify items
- Change tier structure
- Activate it for voting
- Publish it again (if you make significant changes)

**Note**: Clones are independent. Changes you make won't affect the original template.

## Rating Templates

### How to Rate

1. **Clone or Use a Template**
   - You should use the template first to give a fair rating

2. **Return to Template Browser**
   - Find the same template again

3. **Click the Stars** (Coming in future update)
   - Currently, use the API endpoint directly
   - Future UI will allow direct star clicking

4. **Your Rating Updates**
   - Average rating recalculates immediately
   - Total ratings count increases
   - If you rate again, it updates your previous rating

### Rating Guidelines
- ⭐ **1 Star**: Poor quality, broken, or misleading
- ⭐⭐ **2 Stars**: Below average, needs work
- ⭐⭐⭐ **3 Stars**: Average, usable but nothing special
- ⭐⭐⭐⭐ **4 Stars**: Good quality, well-organized
- ⭐⭐⭐⭐⭐ **5 Stars**: Excellent, highly recommended

### What Makes a Good Rating
- **Use It First**: Clone and actually use the tier list
- **Be Fair**: Consider effort, organization, and usefulness
- **Be Honest**: Ratings help others make good decisions
- **Update If Needed**: If you rate too early, you can change it

## Managing Published Templates

### Viewing Your Published Templates

In the Config Panel, published templates show:
- 🌐 **PUBLIC** badge next to the title
- Category label
- Tag chips
- Description (if added)

### Unpublishing a Template

1. **Find Your Published Tier List**
   - Look for the 🌐 PUBLIC badge

2. **Click "🔒 Make Private"**
   - Confirmation dialog appears
   - "Are you sure you want to unpublish this template?"

3. **Confirm**
   - Template is immediately removed from public browse
   - Existing clones remain (they're independent copies)
   - Usage count and ratings are preserved (in case you republish)

### Republishing

To republish after unpublishing:
1. The tier list must still be "completed"
2. Click "📤 Publish as Template" again
3. Fill in details (previous details are not saved)
4. Usage count continues from where it was

### Editing Published Templates

**Can You Edit Published Templates?**
- ❌ No, templates are immutable snapshots
- ✅ But you can unpublish, edit the original tier list, and republish
- ⚠️ This creates a new template (loses ratings and usage count)

**Recommended Workflow:**
1. Unpublish the template
2. Reactivate the tier list if needed
3. Make your changes
4. Complete the tier list again
5. Publish as a new template
6. Consider adding "v2" or "updated" to the title

## Best Practices

### For Publishers

**Before Publishing:**
- ✅ Complete the tier list fully
- ✅ Ensure all items have proper names and images
- ✅ Review tier placements one more time
- ✅ Choose an accurate, descriptive title
- ✅ Write a helpful description
- ✅ Select the most relevant category
- ✅ Add specific, searchable tags

**Naming Conventions:**
- Use clear, specific titles
- Include game/show names
- Include season/year if relevant
- Examples:
  - ✅ "Elden Ring Bosses - Difficulty Ranking"
  - ✅ "Best Marvel Movies (2008-2024)"
  - ❌ "My Tier List"
  - ❌ "Random Stuff"

**Description Tips:**
- Explain what you're ranking
- Mention any special criteria
- Note if it's subjective or data-driven
- Include relevant context (season, patch, version)

**Tag Strategy:**
- Use lowercase
- Use hyphens for multi-word tags (apex-legends)
- Include game/show name
- Include genre
- Include specific features (pvp, pve, etc.)
- Aim for 3-7 relevant tags

**Category Selection:**
- Choose the most specific category
- If it spans multiple, pick the primary one
- Use "Other" only if truly doesn't fit elsewhere

### For Browsers/Cloners

**Finding Quality Templates:**
- Check star ratings (4+ stars is usually good)
- Look at usage count (popular = proven useful)
- Read descriptions carefully
- Check tags to ensure relevance
- Preview item count (more isn't always better)

**After Cloning:**
- Customize it to your needs
- Give credit if you stream it (optional but nice)
- Rate it fairly after use
- Consider publishing your modified version

**Rating Etiquette:**
- Only rate templates you've actually used
- Be fair and constructive
- Don't rate 1-star just because it's not your taste
- Update your rating if you change your mind

### For Community Health

**Do:**
- ✅ Share diverse, creative tier lists
- ✅ Rate honestly and fairly
- ✅ Use descriptive titles and tags
- ✅ Keep descriptions accurate
- ✅ Clone and build upon others' work

**Don't:**
- ❌ Publish spam or joke templates
- ❌ Use misleading titles/descriptions
- ❌ Rate bomb templates (all 1-stars)
- ❌ Republish others' exact templates
- ❌ Use offensive content in any field

## Troubleshooting

### Can't See Publish Button
- ✅ Ensure tier list is "completed" status
- ✅ Check you're on the broadcaster config panel
- ✅ Refresh the page

### Clone Failed
- ✅ Check your internet connection
- ✅ Ensure you're authenticated with Twitch
- ✅ Try again in a moment (might be temporary)

### Template Not Appearing in Browse
- ✅ Wait a few seconds after publishing
- ✅ Refresh the template browser
- ✅ Check filters (category might be filtered out)
- ✅ Try searching for it by title

### Can't Unpublish
- ✅ Ensure you're the original publisher
- ✅ Check you're on the right channel
- ✅ Refresh and try again

### Rating Not Updating
- ✅ Check you're logged in with Twitch
- ✅ Ensure template still exists
- ✅ Try rating again (it updates your previous rating)

## API Reference (Advanced)

For developers and advanced users, here are the API endpoints:

```
GET /api/templates
  ?search=keywords
  &category=Gaming
  &sort=rating|usage|recent
  &skip=0
  &limit=12

GET /api/templates/:id
POST /api/templates/publish/:tierListId
  body: { description, category, tags }
POST /api/templates/unpublish/:tierListId
POST /api/templates/:id/clone
POST /api/templates/:id/rate
  body: { rating: 1-5 }
GET /api/templates/:id/myrating
GET /api/templates/meta/categories
GET /api/templates/meta/tags
```

See [API Documentation](../guides/API_DOCUMENTATION.md) for full details.

---

## Questions or Issues?

If you encounter problems or have suggestions for the template system, please:
1. Check this guide first
2. Review the [release notes](RELEASE_NOTES_v0.0.22.md)
3. Check existing GitHub issues
4. Create a new issue with details

Happy tier listing! 🎉
