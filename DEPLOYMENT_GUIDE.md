# Twitch Extension Deployment Guide

## 🎯 Getting Your Extension Live on Twitch

This guide walks you through deploying your extension so other streamers can use it.

---

## Phase 1: Local Development to Twitch Testing (You Are Here ✓)

### Current Status
- ✅ Backend running locally (port 8081)
- ✅ Frontend running locally (port 3000)
- ✅ Mock authentication working
- ✅ MongoDB connected

---

## Phase 2: Deploy to Production

### Step 1: Deploy Backend to Cloud

#### Option A: Railway (Recommended - Easy)

1. **Sign up**: https://railway.app
2. **Create New Project** → Deploy from GitHub
3. **Add MongoDB**: 
   - Click "New" → Database → MongoDB
   - Railway will provide connection string automatically
4. **Configure Environment Variables**:
   ```bash
   NODE_ENV=production
   PORT=8081
   MONGODB_URI=<railway-mongodb-url>
   TWITCH_CLIENT_ID=<your-client-id>
   TWITCH_CLIENT_SECRET=<your-client-secret>
   TWITCH_EXTENSION_SECRET=<your-extension-secret>
   TWITCH_EXTENSION_CLIENT_ID=<your-extension-client-id>
   JWT_SECRET=<your-jwt-secret>
   ALLOWED_ORIGINS=https://<your-extension-id>.ext-twitch.tv
   ```
5. **Deploy**: Railway auto-deploys from GitHub
6. **Get your URL**: https://your-project.railway.app

#### Option B: Heroku

1. **Install Heroku CLI**: `brew install heroku`
2. **Login**: `heroku login`
3. **Create app**: 
   ```bash
   cd backend
   heroku create your-tier-list-backend
   ```
4. **Add MongoDB**: 
   ```bash
   heroku addons:create mongolab:sandbox
   ```
5. **Set environment variables**:
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set TWITCH_CLIENT_ID=<your-id>
   heroku config:set TWITCH_CLIENT_SECRET=<your-secret>
   # ... etc
   ```
6. **Deploy**:
   ```bash
   git push heroku main
   ```

#### Option C: Render

1. **Sign up**: https://render.com
2. **New Web Service** → Connect GitHub
3. **Configure**:
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
4. **Add MongoDB**:
   - New → MongoDB instance
5. **Environment Variables**: Add all from Railway example
6. **Deploy**: Automatic

---

### Step 2: Build and Upload Frontend to Twitch

#### Build Frontend
```bash
cd frontend
npm run build
```

This creates a `dist/` folder with:
- config.html
- panel.html
- video_component.html
- video_overlay.html
- mobile.html
- JavaScript and CSS files

#### Upload to Twitch Extension Assets

1. **Go to Extension Settings**:
   https://dev.twitch.tv/console/extensions/[your-extension-id]

2. **Go to "Files" tab** (Extension Asset Hosting)

3. **Create a version** (e.g., 0.0.1)

4. **Upload files**:
   - Upload ALL files from `frontend/dist/` folder
   - Maintain folder structure
   - Twitch will host these at: `https://[extension-id].ext-twitch.tv/[version]/`

5. **Update Extension URLs** in "Extension Capabilities":
   - **Viewer Path**: `panel.html`
   - **Config Path**: `config.html`
   - **Live Config Path**: (leave empty or same as config)
   - **Video - Component**: `video_component.html`
   - **Video - Overlay**: `video_overlay.html`
   - **Mobile Path**: `mobile.html`

---

## Phase 3: Configure Twitch Extension for Production

### Update Extension Settings

1. **Go to Extension Settings**: https://dev.twitch.tv/console/extensions/[your-id]

2. **Extension Capabilities**:
   - ✅ Panel
   - ✅ Video - Component
   - ✅ Video - Overlay
   - ✅ Mobile
   - Panel Height: 300px (or auto)

3. **Asset Hosting**:
   - Use Twitch CDN (recommended)
   - Upload all built files

4. **Extension Configuration Service** (Backend):
   - **Required**: Yes
   - **Service URL**: `https://your-backend.railway.app`
   
5. **Allowlist**:
   - Add your backend domain: `https://your-backend.railway.app`

6. **Testing Domain Allowlist** (for local testing):
   - `http://localhost:3000`
   - `http://localhost:8081`

---

## Phase 4: Update Frontend to Use Production Backend

### Update API URLs

Create a `.env` file in `frontend/`:

```bash
# frontend/.env.production
VITE_API_URL=https://your-backend.railway.app/api
VITE_WS_URL=wss://your-backend.railway.app/ws
```

### Update vite.config.ts

```typescript
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:8081',
        changeOrigin: true,
      },
    },
  },
  define: {
    'import.meta.env.VITE_API_URL': JSON.stringify(
      process.env.VITE_API_URL || '/api'
    ),
    'import.meta.env.VITE_WS_URL': JSON.stringify(
      process.env.VITE_WS_URL || 'ws://localhost:8081/ws'
    ),
  },
})
```

### Rebuild and Re-upload

```bash
cd frontend
npm run build
# Upload dist/ to Twitch Extension Assets again
```

---

## Phase 5: Enable Real Twitch Authentication

### Backend is Already Ready!

Your backend already handles real Twitch JWT tokens. The mock token bypass only works in development mode.

In production (`NODE_ENV=production`), it will:
- ✅ Verify real Twitch Extension JWT tokens
- ✅ Extract user_id, channel_id, and role
- ✅ Enforce broadcaster-only routes
- ❌ Reject mock tokens

### Frontend is Already Ready!

Your frontend checks for `window.Twitch.ext` and uses it when available.

When running on Twitch:
- ✅ Twitch Extension Helper loads automatically
- ✅ Real JWT tokens are provided
- ✅ User authentication is automatic
- ❌ Mock tokens are never used

**No code changes needed!** 🎉

---

## Phase 6: Test Your Extension

### Local Testing with Twitch Developer Rig

1. **Download Developer Rig**: https://dev.twitch.tv/docs/extensions/rig/

2. **Install and Run**

3. **Add Your Extension**:
   - Extension Client ID
   - Extension Version: 0.0.1
   - Views: Panel, Config, Video Overlay

4. **Configure**:
   - Use Local Assets: Point to `http://localhost:3000/`
   - Or use Hosted Assets: Point to Twitch CDN

5. **Test All Views**:
   - Broadcaster can create tier lists
   - Viewer can vote
   - Real Twitch user IDs are used

### Testing on Your Channel

1. **Install Extension** on your channel:
   - Go to your channel dashboard
   - Extensions → Discover
   - Search for your extension (if unlisted, use direct link)
   - Install & Activate

2. **Test as Broadcaster**:
   - Open extension config
   - Create tier lists
   - Activate them

3. **Test as Viewer**:
   - Open stream in incognito window
   - Vote on active tier list

---

## Phase 7: Submit for Review (Optional)

### If You Want Public Release

1. **Go to Extension Console**: https://dev.twitch.tv/console/extensions/[your-id]

2. **Fill Required Information**:
   - **Name**: "Chat Tier List"
   - **Summary**: "Interactive tier list voting for viewers"
   - **Description**: Full description of features
   - **Icon**: 100x100px PNG
   - **Screenshots**: Show broadcaster and viewer views
   - **Categories**: Entertainment, Chat & Community
   - **Support Email**: Your email
   - **Privacy Policy URL**: Your privacy policy

3. **Testing Instructions**:
   - How to test as broadcaster
   - How to test as viewer
   - Test credentials (if needed)

4. **Submit for Review**:
   - Click "Submit for Review"
   - Twitch reviews in 5-10 business days
   - They'll test your extension

5. **After Approval**:
   - Extension becomes available in Extensions Directory
   - All streamers can discover and install it

### If You Want Private Use Only

**Keep extension status as "In Development" or "In Test"**:
- You can install on any channel you manage
- Share direct install link with specific streamers
- No review process needed
- Full functionality works

---

## Quick Deployment Checklist

### Backend Deployment ✅
- [ ] Deploy to Railway/Heroku/Render
- [ ] Add MongoDB
- [ ] Set all environment variables
- [ ] Set `NODE_ENV=production`
- [ ] Test health endpoint: `https://your-backend.app/health`
- [ ] Test API endpoint: `https://your-backend.app/api/tierlists`

### Frontend Deployment ✅
- [ ] Update `.env.production` with backend URL
- [ ] Build: `npm run build`
- [ ] Upload `dist/` to Twitch Extension Assets
- [ ] Update Extension URLs in Twitch console
- [ ] Test all views (panel, config, overlay)

### Twitch Configuration ✅
- [ ] Extension Capabilities enabled (Panel, Config, Video)
- [ ] Backend URL added to allowlist
- [ ] Extension Assets uploaded
- [ ] Version created and activated
- [ ] Testing on your channel

---

## Production URLs Example

After deployment, your architecture looks like this:

```
Streamers/Viewers
       ↓
Twitch Extension Frontend (Twitch CDN)
https://abc123.ext-twitch.tv/0.0.1/panel.html
       ↓
Your Backend (Railway/Heroku/Render)
https://tier-list-backend.railway.app/api
       ↓
MongoDB Database (Railway/Atlas)
mongodb://...
```

---

## Integration Features You Get

### Real Twitch Integration ✅

1. **Automatic User Authentication**:
   - Twitch provides JWT token
   - Contains user_id, channel_id, role
   - No login required!

2. **Per-Channel Data**:
   - Each channel gets separate tier lists
   - Votes tied to channel_id
   - Multi-channel support automatic

3. **Role-Based Access**:
   - Broadcasters: Create, activate, view results
   - Moderators: Can be given access (already supported)
   - Viewers: Vote only

4. **User Identity**:
   - Real Twitch user IDs
   - One vote per user enforced
   - Username display

### Features Already Built In 🎉

- ✅ Twitch Extension JWT verification
- ✅ Channel isolation (multi-channel ready)
- ✅ Role-based permissions
- ✅ Real-time WebSocket updates
- ✅ One vote per user
- ✅ Broadcaster dashboard
- ✅ Viewer voting interface
- ✅ Results aggregation

---

## Costs

### Free Tier Options

**Backend Hosting**:
- Railway: $5/month (free trial available)
- Heroku: $5-7/month (Eco dyno)
- Render: $7/month (Starter)

**Database**:
- MongoDB Atlas: Free tier (512MB)
- Railway MongoDB: $5/month
- Heroku MongoDB: Free tier available

**Frontend**:
- Twitch CDN: **FREE** (included with extension)

**Total**: $0-10/month depending on choices

---

## Next Steps

### Immediate (Deploy Now)

1. **Choose hosting** (Railway recommended)
2. **Deploy backend** with environment variables
3. **Build and upload** frontend to Twitch
4. **Test on your channel**

### Future Enhancements

- Add more tier customization
- Export results as images
- Channel points integration
- Historical analytics
- Viewer suggestions
- Time-limited voting

---

## Need Help?

- **Twitch Extension Docs**: https://dev.twitch.tv/docs/extensions
- **Railway Docs**: https://docs.railway.app
- **MongoDB Atlas**: https://www.mongodb.com/cloud/atlas

---

## Summary

Your extension is **production-ready**! The code already handles:
- ✅ Real Twitch authentication (automatically)
- ✅ Multi-channel support
- ✅ Role-based permissions
- ✅ Secure API endpoints

Just deploy and it works! 🚀
