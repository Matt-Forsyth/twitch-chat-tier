# Changelog

All notable changes to the Twitch Chat Tier List Extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.0.22] - 2024-12-XX

### 🌟 Added - Template System
- **Community Template Sharing**: Streamers can publish completed tier lists as public templates
- **Template Browser**: Browse and discover tier lists created by other streamers with search, filters, and sorting
- **One-Click Cloning**: Clone any public template to use on your own channel
- **Star Rating System**: Rate templates 1-5 stars with visual star display and average calculations
- **Template Organization**: Categories (Gaming, Movies, TV Shows, Music, Food & Drink, Sports, Other)
- **Custom Tags**: Add comma-separated tags to templates for better discoverability
- **Template Descriptions**: Add detailed descriptions (up to 500 characters) to published templates
- **Usage Tracking**: Track how many times each template has been cloned
- **Privacy Controls**: Toggle tier lists between public and private
- **Public Badge**: Visual indicator (🌐 PUBLIC) for published tier lists

### 🔧 Backend
- New `Template` MongoDB model with ratings, usage tracking, and metadata
- 10 new API endpoints:
  - `GET /api/templates` - Browse templates with filters, search, sort, pagination
  - `GET /api/templates/:id` - Get single template details
  - `POST /api/templates/publish/:tierListId` - Publish tier list as template
  - `POST /api/templates/unpublish/:tierListId` - Make template private
  - `POST /api/templates/:id/clone` - Clone template to new tier list
  - `POST /api/templates/:id/rate` - Rate template (1-5 stars)
  - `GET /api/templates/:id/myrating` - Get user's current rating
  - `GET /api/templates/meta/categories` - Get available categories
  - `GET /api/templates/meta/tags` - Get popular tags with usage counts
- Compound database indexes for efficient querying on category, rating, usage, date
- Rating aggregation system with average calculation

### 🎨 Frontend
- **TemplateBrowser Component** (330 lines): Full-featured modal with grid layout
  - Real-time search across titles, descriptions, and tags
  - Category filter dropdown
  - Sort options (Top Rated, Most Used, Most Recent)
  - Pagination with "Load More" button
  - Star rating display with half-star precision
  - Usage count and item count badges
  - Category and tag chips
  - Clone button with loading state
- **Config Panel Updates**:
  - "� Browse Templates" button for streamers to discover community templates
  - "�📤 Publish as Template" button for completed tier lists
  - "🔒 Make Private" button for published templates
  - Publish modal with description, category, and tags form
  - Display template metadata (description, category, tags) on tier list cards
  - Character counter for description field (500 max)
  - **Collapsible Sections**: "Viewer Suggestions", "Manage Items", and "All Tier Lists" sections can now be collapsed/expanded for better organization
  - Item counts shown in section headers (e.g., "Manage Items (12)")
- **Panel Updates**:
  - "🔍 Browse Community Templates" button when no active tier list
  - Template browser integration with clone callback
- Extended `TierListConfig` type with `description`, `category`, `tags[]`, `isPublic` fields
- New `Template`, `TemplateSearchParams`, `TemplatesResponse` TypeScript interfaces
- 10 new API client methods for template management

### ✨ UI/UX Improvements
- Config panel sections are now collapsible with ▶/▼ icons
- Cleaner layout with more room for future features
- Better visual hierarchy with expandable sections
- Template browser accessible from both streamer config and viewer panel
- **Removed viewer results view** - Viewers now only see their own vote after submitting (keeps voting more private and reduces spoilers)

### 📚 Documentation
- Added comprehensive Template System User Guide
- Added Release Notes for v0.0.22
- Added Deployment Summary with testing scenarios

---

## [0.0.21-fixed] - 2024-10-XX

### 🔧 Fixed - Deployment Package
- **HOTFIX**: Fixed deployment package structure
- Removed development HTML files that referenced non-existent source files
- Created correct package with only production-built files from `dist` folder
- Fixed "NS_ERROR_CORRUPTED_CONTENT" error when loading extension panels
- Package reduced from 108 KB to 105 KB (production files only)

### 📦 Changed
- Deployment package now includes only:
  - Production HTML files with proper asset references
  - Bundled JavaScript files
  - Compiled CSS
  - Optimized assets

---

## [0.0.21] - 2024-10-XX

### 🌟 Added - Streamer Item Management
- **Accept Viewer Suggestions**: Broadcasters can accept/reject viewer suggestions from Config panel
- **Add Items to Active Tier Lists**: Add new items to tier lists even after activation
- **Edit Existing Items**: Update item names and image URLs inline
- **Delete Items**: Remove items from tier lists with safety confirmation
- Real-time item management with immediate updates for all viewers
- Automatic vote cleanup when items are deleted

### 🔧 Backend
- New API endpoints:
  - `POST /api/tierlists/:id/items` - Add item to tier list
  - `PUT /api/tierlists/:id/items/:itemId` - Update item details
  - `DELETE /api/tierlists/:id/items/:itemId` - Remove item and associated votes
- Vote cleanup logic when items are deleted
- Item validation and duplicate checking

### 🎨 Frontend
- **Config Panel Enhancements**:
  - "Viewer Suggestions" section showing pending suggestions with accept/reject buttons
  - "Manage Items" section with add/edit/delete functionality
  - Inline item editing with cancel functionality
  - Image preview for suggestions and items
  - Confirmation dialogs for destructive actions
- Real-time suggestion loading for active tier lists
- Visual feedback for all item operations

### 📋 Use Cases
- Live stream interaction: Accept viewer suggestions in real-time
- Dynamic tier lists: Add items as stream progresses
- Quality control: Edit names, update images, remove inappropriate items

---

## [0.0.20] - 2024-10-XX

### 🌟 Added - Vote/Results Toggle
- **View Mode Toggle**: Viewers can switch between "My Vote" and "Results" views
- **Live Results**: Real-time aggregated voting results visible to viewers
- **Average Tier Display**: Shows average tier placement for each item
- **Vote Count**: Displays total number of votes for each item
- **Percentage Bars**: Visual representation of tier distribution

### 🎨 Frontend
- Toggle buttons in Panel for switching views
- Results view with tier-based item grouping
- Color-coded tier display matching voting interface
- Vote statistics for each item
- Responsive results layout

### 🔧 Backend
- Results endpoint returns aggregated vote data
- Average tier calculation across all votes
- Vote count and percentage calculations

---

## [0.0.19] - 2024-10-XX

### 🌟 Added - Core Voting System
- **Drag-and-Drop Voting**: Viewers can drag items into tier rows (S, A, B, C, D, F)
- **Viewer Suggestions**: Users can suggest new items with name and optional image URL
- **Analytics Backend**: Historical tier list analytics (backend only, UI pending)
- **WebSocket Support**: Real-time updates for voting and suggestions
- **Vote Persistence**: User votes saved and retrievable

### 🔧 Backend
- MongoDB models:
  - `TierListConfig` - Tier list configuration and items
  - `Vote` - User vote storage with tier placements
  - `Suggestion` - Viewer item suggestions
  - `Analytics` - Historical tier list data
- API endpoints:
  - `GET /api/tierlists` - List all tier lists for channel
  - `POST /api/tierlists` - Create new tier list
  - `GET /api/tierlists/active` - Get active tier list
  - `PUT /api/tierlists/:id/status` - Update tier list status
  - `POST /api/votes` - Submit vote
  - `GET /api/votes/:tierListId` - Get user's vote
  - `GET /api/results/:tierListId` - Get aggregated results
  - `POST /api/suggestions` - Submit suggestion
  - `GET /api/suggestions/:tierListId` - Get suggestions for tier list
  - `PUT /api/suggestions/:id/status` - Accept/reject suggestion
  - `GET /api/analytics/:tierListId` - Get analytics (backend only)
- Twitch JWT authentication middleware
- Rate limiting for API protection
- WebSocket server for real-time updates

### 🎨 Frontend
- **Config Panel** (Broadcaster):
  - Create new tier lists with custom titles
  - Define items with names and image URLs
  - Activate/deactivate tier lists
  - View all tier lists (draft, active, completed)
  - Delete tier lists with confirmation
  - Reset votes with confirmation
- **Panel** (Viewer):
  - Drag-and-drop interface using react-beautiful-dnd
  - Six-tier system (S, A, B, C, D, F) with color coding
  - Unvoted items section
  - Submit vote button
  - Suggestion form for new items
- React 18 with TypeScript
- Vite build system
- Twitch Extension Helper integration
- WebSocket client for real-time updates

### 🏗️ Infrastructure
- Node.js 18 Express backend
- MongoDB database
- Railway deployment configuration
- CORS configuration for Twitch extension
- Environment variable management
- Production and development builds

---

## [0.0.18 and earlier] - 2024-09-XX

### Added - Initial Setup
- Project scaffolding and structure
- Basic Twitch Extension configuration
- Development environment setup
- Build and deployment scripts
- Documentation structure

### 🔧 Technical Foundation
- TypeScript configuration for both frontend and backend
- ESLint and code quality tools
- Git repository initialization
- Package management with npm
- Twitch Developer Console setup

### 🐛 Fixed
- Auth logging improvements for debugging
- Rate limiter configuration for Railway
- Trust proxy settings for Railway deployment
- iframe blocking issues with custom modal dialogs (replaced browser `confirm()`)
- Delete button visibility and disabled state handling
- Channel ID parameter handling
- Various deployment and configuration fixes

### 🗑️ Removed
- OBS streaming features (scope reduction)
- OBS overlay support
- Public API access for OBS
- Browser channel parameter

---

## Version History Summary

| Version | Date | Key Feature |
|---------|------|-------------|
| 0.0.22 | Dec 2024 | Template System - Share and browse community tier lists |
| 0.0.21-fixed | Oct 2024 | Deployment package hotfix |
| 0.0.21 | Oct 2024 | Streamer item management (add/edit/delete, accept suggestions) |
| 0.0.20 | Oct 2024 | Vote/results toggle for viewers |
| 0.0.19 | Oct 2024 | Core voting system with drag-and-drop |
| 0.0.18 | Sep 2024 | Initial project setup and infrastructure |

---

## Upcoming Features

### Planned for v0.0.23+
- Direct rating UI in template browser (click stars to rate)
- Template reporting and moderation tools
- Template analytics for creators
- Featured/curated templates section
- Template collections and playlists
- Import templates from external sources
- Export templates to JSON
- Social features (follow creators, comments)
- Mobile responsive improvements
- Accessibility enhancements

---

## Development Notes

### Breaking Changes
- **v0.0.21**: Added new item management endpoints - frontend must be updated to v0.0.21+ to use these features
- **v0.0.22**: Extended TierListConfig schema with template fields - backward compatible but new fields are optional

### Deprecations
- None currently

### Security Updates
- All versions include Twitch JWT authentication
- Rate limiting on all public endpoints
- CORS properly configured for Twitch extension domain
- Input validation on all user-submitted data

---

## Links

- [GitHub Repository](https://github.com/Matt-Forsyth/twitch-chat-tier)
- [Documentation](README.md)

---

**Note**: This changelog is maintained going forward from v0.0.22. Previous version information has been consolidated from release notes and git history.
