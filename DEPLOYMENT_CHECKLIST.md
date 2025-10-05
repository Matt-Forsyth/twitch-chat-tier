# Twitch Extension Deployment Checklist

## ✅ Ready for Testing - Version 0.0.15

### What's New in This Version
- ✨ **Delete Functionality**: Broadcasters can now delete old tier lists with confirmation dialog
- 🐛 **Enhanced Logging**: Added detailed status logging to help debug any display issues
- 🔒 **Safe Deletion**: Cannot delete the currently active tier list
- 🧹 **Clean Deletion**: Deleting a tier list also removes all associated votes

### Files Ready for Upload

**Location**: `/Users/matthew/src/matt-f/twitch-chat-tier/frontend/twitch-extension.zip`

This zip contains:
- `config.html` - Broadcaster configuration panel (with delete buttons)
- `panel.html` - Viewer voting panel
- `video_overlay.html` - Video overlay component
- `video_component.html` - Video component
- `mobile.html` - Mobile view
- `obs_overlay.html` - OBS browser source overlay
- `assets/` - All compiled JavaScript and CSS

### Backend Status
✅ **Deployed and Running**: https://twitch-chat-tier-production.up.railway.app
- MongoDB connected
- All 12 API endpoints operational including new DELETE endpoint
- WebSocket server running
- Public endpoints for OBS overlay access

### Upload to Twitch Steps

1. **Go to Twitch Developer Console**
   - Visit: https://dev.twitch.tv/console/extensions
   - Select your extension: `or6ehrdoc9gzasby1hmhhtw4wa0qdm`

2. **Upload New Version**
   - Click "Files" or "Versions" tab
   - Click "Upload Assets"
   - Select: `/Users/matthew/src/matt-f/twitch-chat-tier/frontend/twitch-extension.zip`
   - Version: `0.0.15` (or next available)

3. **Configure Version Settings**
   - **Testing Base URI**: Leave blank (uses CDN)
   - **Panel Viewer Path**: `panel.html`
   - **Config Path**: `config.html`
   - **Live Config Path**: `config.html`
   - **Video Overlay Path**: `video_overlay.html`
   - **Video Component Path**: `video_component.html`
   - **Mobile Path**: `mobile.html`

4. **Review Extension Capabilities**
   - ✅ Config Service (required for broadcaster panel)
   - ✅ Panel (required for viewer voting)
   - ✅ Video Overlay (optional)
   - ✅ Video Component (optional)

5. **Set Extension Views**
   - **Viewer**: Can install as Panel (300x500px recommended)
   - **Config**: Available to broadcaster for setup
   - **Video Overlay**: Optional for stream overlay
   - **Video Component**: Optional for in-stream integration

6. **Move to Testing**
   - Click "Save" on the version
   - Click "Move to Testing" or "Submit for Review"
   - Extension Secret is already configured: `GsSchcHiwhu4clfliUcxT2VPzMVdijFoq2RXxOsJ//w=`

### Testing the Extension

#### As Broadcaster (Config Panel)
1. Install extension on your channel
2. Go to Extensions Manager on your dashboard
3. Activate the extension as a Panel
4. Click "Configure" to open config panel
5. Test creating a tier list:
   - Add items with names and optional image URLs
   - Click "Create Tier List"
   - Click "Activate" to make it live
6. Test delete functionality:
   - Create a second tier list
   - Try deleting the non-active one
   - Confirm the deletion works

#### As Viewer (Panel)
1. Open your channel in an incognito window
2. Scroll to the Extensions panel below the video
3. You should see the active tier list
4. Vote on items by selecting a tier (S, A, B, C, D, F)
5. Submit your vote
6. Verify it shows your vote was recorded

#### OBS Overlay
1. Add Browser Source in OBS
2. URL: `https://or6ehrdoc9gzasby1hmhhtw4wa0qdm.ext-twitch.tv/or6ehrdoc9gzasby1hmhhtw4wa0qdm/0.0.15/obs_overlay.html?channel=1002733764`
3. Width: 1920, Height: 1080 (or your stream resolution)
4. Custom CSS: (optional for positioning)
5. ✅ Check "Shutdown source when not visible"
6. Should display the active tier list with transparent background

### Troubleshooting

#### If OBS Overlay Shows "No Active Tier List"
1. Check browser console in OBS (right-click source → Interact → F12)
2. Verify the channel parameter in URL matches your Twitch channel ID
3. Check API logs at Railway for any errors
4. Verify tier list status is "active" in MongoDB

#### If Delete Button Doesn't Appear
1. Refresh the config panel
2. Check browser console for errors
3. Verify you're not trying to delete the active tier list

#### If Votes Don't Update
1. Check WebSocket connection in browser console
2. Verify MongoDB connection in Railway logs
3. Check that tier list is in "active" status

### Database Status
**Current State** (as of last check):
- 1 tier list in database
- Channel ID: `1002733764`
- Title: "Best games of all time"
- Status: "active"

### API Endpoints Available
1. `POST /api/tierlists` - Create tier list (broadcaster only)
2. `GET /api/tierlists` - Get all tier lists (public with channelId param)
3. `GET /api/tierlists/:id` - Get specific tier list (public)
4. `PUT /api/tierlists/:id` - Update tier list (broadcaster only)
5. `DELETE /api/tierlists/:id` - **NEW** Delete tier list (broadcaster only)
6. `POST /api/tierlists/:id/activate` - Activate tier list (broadcaster only)
7. `POST /api/tierlists/:id/complete` - Complete tier list (broadcaster only)
8. `POST /api/tierlists/:id/reset-votes` - Reset votes (broadcaster only)
9. `POST /api/votes` - Submit vote (any authenticated user)
10. `GET /api/votes/:tierListId/user` - Get user's vote (authenticated)
11. `GET /api/tierlists/:id/results` - Get aggregated results (public)
12. `DELETE /api/votes/:tierListId` - Delete user's vote (authenticated)

### Environment Variables (Railway)
```
MONGODB_URI=<your-mongodb-connection-string>
JWT_SECRET=GsSchcHiwhu4clfliUcxT2VPzMVdijFoq2RXxOsJ//w=
NODE_ENV=production
PORT=8081
```

### Next Steps After Upload
1. ✅ Upload `twitch-extension.zip` to Twitch Developer Console
2. ✅ Move version to Testing
3. ✅ Install on your channel
4. ✅ Test all functionality (create, activate, vote, delete)
5. ✅ Test OBS overlay
6. ✅ If everything works, submit for review for public release

### Support Links
- **Backend API**: https://twitch-chat-tier-production.up.railway.app
- **GitHub Repo**: https://github.com/Matt-Forsyth/twitch-chat-tier
- **Buy Me a Coffee**: https://buymeacoffee.com/matthewforsyth

---

## Deployment Complete! 🎉

Your extension is ready for testing on Twitch. Upload the zip file and test all the new features!
