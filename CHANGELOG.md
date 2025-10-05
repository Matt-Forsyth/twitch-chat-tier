# Changelog

All notable changes to the Twitch Chat Tier List Extension will be documented in this file.

## [0.0.18] - 2024-10-05

### Removed
- **OBS Streaming Features**: Removed all OBS overlay functionality and references
  - Deleted `obs_overlay.tsx` component
  - Deleted `obs_overlay.html` entry point
  - Deleted `test-obs.html` debugging tool
  - Removed OBS URL display from broadcaster config panel
  - Removed OBS configuration from vite build
  - Updated documentation to remove OBS setup instructions
  - Cleaned up OBS-related code comments

### Changed
- Public API endpoints (`GET /tierlists` and `GET /tierlists/:id/results`) retained for potential future use
- Updated deployment checklist to reflect simplified Twitch-only experience

## [0.0.17] - 2024-10-04

### Fixed
- **Delete Modal**: Replaced browser `confirm()` with custom React modal (browser confirm was blocked in Twitch iframe)
- **Reset Votes Modal**: Replaced browser `confirm()` with custom React modal for consistency

### Added
- Custom confirmation modals for delete and reset actions
- Better UX with styled modals matching Twitch theme

## [0.0.16] - 2024-10-03

### Added
- **OBS Overlay**: Created live view for streamers to use in OBS
- OBS browser source URL display in config panel
- Public API endpoints for OBS access (no authentication required)
- Channel parameter support for OBS overlay
- Real-time tier list updates in OBS view

### Changed
- Updated database channel ID from dev placeholder to real Twitch channel (1002733764)

## [0.0.15] - 2024-10-02

### Added
- **Delete Functionality**: Broadcasters can now delete old tier lists
- Custom delete modal with confirmation
- Safety checks to prevent deleting active tier list
- Cascade deletion of associated votes when tier list is deleted

### Enhanced
- Enhanced logging for debugging tier list status
- Better error handling in API endpoints

## [0.0.14] - 2024-10-01

### Added
- **Buy Me a Coffee**: Added attribution link to config and panel
- Support link at bottom of all panels

## [0.0.13] - 2024-09-30

### Fixed
- Twitch JWT authentication working with proper Extension Secret
- Role extraction by decoding JWT payload
- Trust proxy configuration for Railway deployment

### Changed
- Updated Extension Secret to correct base64 value
- Improved authentication logging for debugging

## [0.0.12] - 2024-09-29

### Deployed
- Backend deployed to Railway (https://twitch-chat-tier-production.up.railway.app)
- Frontend deployed to Twitch CDN
- MongoDB hosted on Railway
- WebSocket server operational
- All 12 API endpoints live

## [0.0.11] - 2024-09-28

### Added
- Real-time updates via WebSocket
- Tier calculation algorithm (weighted average S=6 to F=1)
- Vote aggregation and results display
- Reset votes functionality

## [0.0.10] - 2024-09-27

### Added
- Broadcaster config panel with tier list management
- Viewer voting panel
- Video overlay and video component views
- Mobile responsive view

### Implemented
- Create tier lists with custom items
- Activate/deactivate tier lists
- Vote on items
- View aggregated results

## [0.0.9] - 2024-09-26

### Added
- MongoDB integration with Mongoose schemas
- TierListConfig and Vote models
- Compound indexes for performance
- Vote tracking per user

## [0.0.8] - 2024-09-25

### Added
- Express backend with TypeScript
- 12 REST API endpoints
- Twitch Extension JWT authentication
- Rate limiting and security headers
- CORS configuration

## [0.0.7] - 2024-09-24

### Added
- React frontend with TypeScript
- Vite build configuration
- API client with Axios
- Zustand state management
- Twitch Extension Helper integration

## [0.0.6] - 2024-09-23

### Added
- Project scaffolding
- Backend and frontend folder structure
- TypeScript configuration
- Environment variable setup

## [0.0.5] - 2024-09-22

### Added
- Initial project requirements
- Documentation (README, SETUP_GUIDE, API_DOCUMENTATION)
- Git repository initialization
