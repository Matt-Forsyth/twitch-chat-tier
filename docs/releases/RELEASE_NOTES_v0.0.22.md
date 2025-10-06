# Release Notes - v0.0.22

## 🎉 Template System Release

**Release Date:** December 2024
**Status:** ✅ Complete and Deployed

### 🌟 New Features

#### Community Template Sharing
- **Publish Tier Lists**: Streamers can now publish completed tier lists as public templates
- **Template Browser**: Browse and discover tier lists created by other streamers
- **One-Click Cloning**: Clone any public template to use on your own channel
- **Rating System**: Rate templates 1-5 stars to help the community find the best ones

#### Template Organization
- **Categories**: Organize templates by category (Gaming, Movies, TV Shows, Music, Food & Drink, Sports, Other)
- **Tags**: Add custom tags to make templates discoverable (e.g., anime, action, 2023)
- **Descriptions**: Add detailed descriptions to your templates (up to 500 characters)
- **Search**: Full-text search across template titles, descriptions, and tags

#### Template Discovery
- **Filters**: Filter by category and search terms
- **Sorting Options**:
  - Top Rated: See the highest-rated templates
  - Most Used: Find the most popular templates by usage count
  - Most Recent: Discover newly published templates
- **Pagination**: Load more results as you scroll

### 📊 Usage Tracking
- **Usage Counter**: See how many times a template has been cloned
- **Rating Display**: Visual star ratings with half-star precision
- **Item Preview**: See item count and tier structure before cloning

### 🔐 Privacy Controls
- **Public/Private Toggle**: Choose whether to share your tier lists publicly
- **Unpublish Anytime**: Make a public template private whenever you want
- **Public Badge**: Clear visual indicator for published tier lists

### 🎨 UI Improvements

#### Config Panel
- New "📤 Publish as Template" button for completed tier lists
- "🔒 Make Private" button for published templates
- Public badge (🌐 PUBLIC) displays on published tier lists
- Publish modal with:
  - Description field (optional, max 500 chars)
  - Category dropdown
  - Tag input (comma-separated)
  - Character counter

#### Panel (Viewer)
- "🔍 Browse Community Templates" button when no active tier list
- Full template browser with grid layout
- Star rating display
- Category and tag chips
- Clone button with loading state

### 🔧 Technical Details

#### Backend (10 New Endpoints)
```
GET    /api/templates              - Browse public templates (with filters)
GET    /api/templates/:id          - Get template details
POST   /api/templates/publish/:id  - Publish tier list as template
POST   /api/templates/unpublish/:id - Make template private
POST   /api/templates/:id/clone    - Clone template (increments usage)
POST   /api/templates/:id/rate     - Rate template (1-5 stars)
GET    /api/templates/:id/myrating - Get user's rating
GET    /api/templates/meta/categories - Get available categories
GET    /api/templates/meta/tags    - Get popular tags
```

#### Database
- New `Template` collection with:
  - Full tier list snapshot (items, tiers, configuration)
  - Rating system (averageRating, totalRatings, individual ratings)
  - Usage tracking (usageCount)
  - Metadata (category, tags, description, isPublic)
  - Indexes for efficient filtering and sorting

#### Frontend
- New `TemplateBrowser` component (330 lines)
- Extended `TierListConfig` type with template metadata
- 10 new API client methods
- Publish modal in config panel
- Template browser integration in panel

### 📦 Deployment

#### Frontend (Twitch Extension)
1. Download: `twitch-chat-tier-v0.0.22.zip`
2. Upload to Twitch Developer Console
3. Submit for review

#### Backend (Railway)
- ✅ Auto-deployed from GitHub
- Database migrations run automatically
- New routes active immediately

### 🚀 How to Use

#### For Streamers (Broadcaster)
1. Create and complete a tier list as usual
2. Click "📤 Publish as Template" on the completed tier list
3. Add optional description, category, and tags
4. Click "Publish" to share with the community
5. Unpublish anytime with "🔒 Make Private"

#### For Everyone
1. When no tier list is active, click "🔍 Browse Community Templates"
2. Search, filter by category, or sort by rating/usage
3. Click "Clone" on any template to copy it
4. Rate templates you've used to help others find the best ones

### 🎯 Use Cases
- **Gaming**: Share tier lists for game characters, weapons, maps
- **Movies/TV**: Share rankings of shows, movies, actors
- **Music**: Share album rankings, artist comparisons
- **Food**: Share restaurant rankings, menu item tiers
- **Community Building**: Discover what other communities are ranking
- **Quick Start**: Clone popular templates instead of creating from scratch

### ⚠️ Notes
- Only completed tier lists can be published
- Templates are read-only snapshots (clones are independent)
- Ratings are anonymous
- Users can rate the same template multiple times (updates their rating)
- Templates remain published even if the original tier list is deleted

### 🐛 Bug Fixes
- None (new feature release)

### 📈 Stats
- **Lines Added**: ~1,500
- **New Components**: 1 (TemplateBrowser)
- **New Routes**: 10
- **New Database Models**: 1 (Template)

### 🔜 Future Enhancements
- Featured/curated templates
- Template reports/moderation
- Template analytics for creators
- Template collections/playlists
- Template versioning
- Import templates from external sources

---

**Full Changelog**: [v0.0.21...v0.0.22](https://github.com/Matt-Forsyth/twitch-chat-tier/compare/v0.0.21...v0.0.22)
