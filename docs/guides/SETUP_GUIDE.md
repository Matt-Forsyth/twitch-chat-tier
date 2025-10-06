# Quick Setup Guide

## Prerequisites Check

Before starting, ensure you have:
- ✅ Node.js 18+ installed: `node --version`
- ✅ npm installed: `npm --version`
- ✅ MongoDB installed and running (or MongoDB Atlas account)
- ✅ Twitch Developer Account

## Quick Start (5 minutes)

### 1. Install MongoDB (if not already installed)

**macOS:**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Windows:** Download from https://www.mongodb.com/try/download/community

**Linux:**
```bash
sudo apt-get install mongodb
sudo systemctl start mongodb
```

### 2. Install Dependencies

All dependencies are already installed! If you need to reinstall:
```bash
npm run install:all
```

### 3. Configure Environment

The backend `.env` file has been created. You need to add your Twitch credentials:

**Edit `backend/.env`:**
```bash
# Keep these as-is for local development
PORT=8081
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/twitch-tier-list

# TODO: Add your Twitch credentials from https://dev.twitch.tv/console
TWITCH_CLIENT_ID=your_client_id_here
TWITCH_CLIENT_SECRET=your_client_secret_here
TWITCH_EXTENSION_SECRET=your_extension_secret_base64_here
TWITCH_EXTENSION_CLIENT_ID=your_extension_client_id_here

# Generate a random secret for JWT
JWT_SECRET=$(openssl rand -base64 32)

ALLOWED_ORIGINS=http://localhost:3000,https://localhost:3000
```

### 4. Get Twitch Extension Credentials

1. Go to https://dev.twitch.tv/console/extensions
2. Click "Create Extension"
3. Fill in:
   - **Name**: My Tier List Extension
   - **Category**: Panel
   - Check: Panel, Video Component, Video Overlay, Mobile
4. After creation, go to "Extension Settings":
   - Copy **Client ID** → `TWITCH_EXTENSION_CLIENT_ID`
   - Generate and copy **Extension Secret (Base64)** → `TWITCH_EXTENSION_SECRET`
5. Go to "API Settings" and create an app at https://dev.twitch.tv/console/apps:
   - Copy **Client ID** → `TWITCH_CLIENT_ID`
   - Copy **Client Secret** → `TWITCH_CLIENT_SECRET`

### 5. Start Development Servers

```bash
# From the root directory, run both servers:
npm run dev
```

This will start:
- Backend API on http://localhost:8081
- Frontend on http://localhost:3000

### 6. Test the Extension

**Option A: Local Development (Simple)**
1. Open http://localhost:3000/config.html (Config panel)
2. Open http://localhost:3000/panel.html (Viewer panel)

Note: Authentication will use mock data in development mode.

**Option B: Twitch Extension Developer Rig (Full Testing)**
1. Download: https://dev.twitch.tv/docs/extensions/rig/
2. Install and run the Developer Rig
3. Add your extension using your Extension Client ID
4. Configure local test:
   - Frontend: https://localhost:3000
   - Backend: http://localhost:8081

## Testing Checklist

### Broadcaster Flow
- [ ] Open config panel: http://localhost:3000/config.html
- [ ] Click "Create New Tier List"
- [ ] Add a title and several items
- [ ] Click "Create Tier List"
- [ ] Click "Activate" on the created tier list

### Viewer Flow
- [ ] Open panel: http://localhost:3000/panel.html
- [ ] See the active tier list
- [ ] Assign tiers to each item
- [ ] Click "Submit Your Vote"
- [ ] See success message

### Results Check
- [ ] Go back to config panel
- [ ] Click "View Results" on the active tier list
- [ ] See aggregated votes displayed in tiers

## Common Issues & Solutions

### MongoDB Connection Error
```
Error: MongoDB connection error
```
**Solution:**
- Check MongoDB is running: `brew services list` (macOS)
- Or: `mongosh` to test connection
- Verify `MONGODB_URI` in `backend/.env`

### Port Already in Use
```
Error: Port 8081 is already in use
```
**Solution:**
- Kill the process: `lsof -ti:8081 | xargs kill -9`
- Or change PORT in `backend/.env`

### Twitch Auth Errors
```
Error: Invalid Twitch token
```
**Solution:**
- Verify Extension Secret is correct in `backend/.env`
- Ensure it's the Base64-encoded version
- Check Extension Client ID matches

### Build Errors
```
Cannot find module 'react'
```
**Solution:**
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

## Next Steps

### For Development
1. **Add More Features**: Edit files in `backend/src/` or `frontend/src/`
2. **Hot Reload**: Changes auto-reload in development mode
3. **Debug**: Use VS Code debugger or `console.log()`

### For Production
1. **Build**: `npm run build`
2. **Deploy Backend**: Heroku, Railway, Render, or AWS
3. **Upload Frontend**: Twitch Extension Asset Hosting
4. **Update URLs**: In Twitch Developer Console

### Test with Real Twitch Data
1. Configure extension URLs in Twitch Developer Console
2. Activate extension on your test channel
3. Test as broadcaster and viewer

## Project Structure Recap

```
twitch-chat-tier/
├── backend/          # Node.js + Express API
│   ├── src/
│   │   ├── models/   # MongoDB schemas
│   │   ├── routes/   # API endpoints
│   │   ├── services/ # Business logic
│   │   └── server.ts # Entry point
│   └── .env          # Configuration
│
├── frontend/         # React + TypeScript
│   ├── src/
│   │   ├── config.tsx    # Broadcaster dashboard
│   │   ├── panel.tsx     # Viewer voting panel
│   │   ├── utils/        # API, WebSocket, Twitch helpers
│   │   └── types.ts      # TypeScript definitions
│   └── *.html            # Entry points
│
└── package.json      # Root scripts
```

## Available Scripts

```bash
# Development
npm run dev              # Start both backend & frontend
npm run dev:backend      # Start backend only
npm run dev:frontend     # Start frontend only

# Build
npm run build            # Build both
npm run build:backend    # Build backend
npm run build:frontend   # Build frontend

# Production
cd backend && npm start  # Run built backend
```

## Getting Help

- Check the main README.md for detailed documentation
- Review API endpoints in backend/src/routes/
- Check frontend components in frontend/src/
- See database models in backend/src/models/

## Success! 🎉

You now have:
- ✅ Backend API running
- ✅ Frontend panels built
- ✅ WebSocket for real-time updates
- ✅ MongoDB for data persistence
- ✅ Twitch authentication ready

Start creating tier lists and let your viewers vote!
