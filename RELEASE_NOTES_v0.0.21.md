# Release Notes - v0.0.21

## 🎉 New Features: Streamer Item Management

This release adds powerful item management capabilities for broadcasters, allowing them to dynamically manage tier list items and respond to viewer suggestions in real-time.

### ✨ What's New

#### 1. **Accept Viewer Suggestions**
- Broadcasters can now see pending viewer suggestions directly in the Config panel
- Each suggestion shows:
  - Item name and optional image
  - Username of the viewer who suggested it
  - Accept/Reject buttons
- Accepting a suggestion automatically:
  - Adds the item to the active tier list
  - Marks the suggestion as approved
  - Refreshes the tier list for all viewers
  - Makes the item immediately available for voting

#### 2. **Add Items to Active Tier Lists**
- Add new items to tier lists even after they're activated
- Simple form with item name and optional image URL
- Items are immediately available for viewers to vote on
- Perfect for responding to viewer requests or adding forgotten items

#### 3. **Edit Existing Items**
- Click "Edit" on any item to modify:
  - Item name
  - Item image URL
- Changes are reflected immediately for all viewers
- Useful for fixing typos or updating images

#### 4. **Delete Items**
- Remove items that shouldn't be in the tier list
- Safety confirmation before deletion
- Automatically removes all associated votes for that item
- Keeps your tier list clean and relevant

### 🎨 UI Improvements

- **Suggestions Section**: New dedicated area in the active tier list showing pending suggestions
- **Item Management Section**: Clean interface for adding, editing, and deleting items
- **Inline Editing**: Edit items directly in the list without modal dialogs
- **Visual Feedback**: Images preview in both suggestions and item lists

### 🔧 Technical Details

#### Backend Updates
- **New Endpoints**:
  - `POST /api/tierlists/:id/items` - Add item to tier list
  - `PUT /api/tierlists/:id/items/:itemId` - Update item details
  - `DELETE /api/tierlists/:id/items/:itemId` - Remove item and associated votes

#### Frontend Updates
- **Config Panel Enhancements**:
  - Real-time suggestion loading for active tier lists
  - Item management UI with add/edit/delete functionality
  - Inline editing with cancel functionality
  - Confirmation dialogs for destructive actions

### 📊 Use Cases

1. **Live Stream Interaction**
   - Viewers suggest items during stream
   - Broadcaster reviews and accepts good suggestions
   - Viewers immediately vote on newly added items

2. **Dynamic Tier Lists**
   - Start with a few items
   - Add more as stream progresses
   - Remove items that don't fit

3. **Quality Control**
   - Edit item names for consistency
   - Update images with better quality versions
   - Remove duplicate or inappropriate items

### 🚀 Getting Started

1. **Upload to Twitch**:
   - Use `twitch-extension-v0.0.21.zip` from the frontend folder
   - Upload via Twitch Developer Console
   - Test in hosted test mode

2. **Using the Features**:
   - Activate a tier list
   - Check the "Viewer Suggestions" section for pending suggestions
   - Use the "Manage Items" section to add/edit/delete items
   - All changes apply immediately to the active tier list

### 🔄 Previous Features (Still Available)

- Drag-and-drop tier list voting (v0.0.19)
- Vote/Results toggle for viewers (v0.0.20)
- Viewer suggestion submission (v0.0.19 backend, now with UI)
- Historical analytics (v0.0.19 backend, UI pending)

### 📝 Notes

- Only broadcasters can manage items and accept suggestions
- Deleting an item also removes all votes for that item
- Changes to active tier lists are visible to viewers immediately
- Suggestions remain pending until accepted or rejected

### 🐛 Bug Fixes

- Fixed TypeScript type errors in config panel
- Improved error handling for item operations
- Better UI feedback for destructive actions

---

**Deployment File**: `frontend/twitch-extension-v0.0.21.zip`

**Backend Compatibility**: Requires backend deployed with v0.0.19+ endpoints

**Testing**: Test all features in Twitch's hosted test environment before going live
