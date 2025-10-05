# Twitch Chat Tier List Extension

A comprehensive Twitch.tv Extension that enables streamers to create interactive tier lists for their viewers with real-time voting and aggregation.

## Features

✅ **Streamer Dashboard** - Create and manage tier lists with custom items
✅ **Viewer Voting** - Each viewer can assign tiers to items
✅ **Real-time Updates** - WebSocket integration for live vote tracking
✅ **Vote Aggregation** - Automatic calculation of average tiers
✅ **Results Display** - Visual representation of community rankings
✅ **Multiple Rounds** - Run multiple tier list sessions
✅ **Vote Reset** - Clear votes and start fresh
✅ **Secure Authentication** - Twitch OAuth and JWT verification
✅ **Responsive Design** - Works on desktop and mobile
✅ **Dark Mode** - Twitch-native styling

## Architecture

### Backend (Node.js + Express + MongoDB)
- **Server**: Express.js REST API
- **WebSocket**: Real-time communication using `ws`
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: Twitch Extension JWT verification
- **Security**: Helmet, CORS, rate limiting

### Frontend (React + TypeScript)
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development
- **State Management**: React hooks + Zustand (optional)
- **Styling**: CSS with Twitch design tokens
- **Views**: Config panel, Viewer panel, Video overlay, Mobile

## Project Structure

```
twitch-chat-tier/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.ts          # MongoDB connection
│   │   ├── models/
│   │   │   ├── TierListConfig.ts    # Tier list schema
│   │   │   └── Vote.ts              # Vote schema
│   │   ├── routes/
│   │   │   ├── authRoutes.ts        # Authentication endpoints
│   │   │   ├── tierListRoutes.ts    # Tier list CRUD
│   │   │   └── voteRoutes.ts        # Voting endpoints
│   │   ├── services/
│   │   │   └── twitchAuth.ts        # Twitch API integration
│   │   ├── middleware/
│   │   │   ├── auth.ts              # Auth middleware
│   │   │   └── errorHandler.ts      # Error handling
│   │   ├── websocket/
│   │   │   └── websocketHandler.ts  # WebSocket logic
│   │   └── server.ts                # Main server file
│   ├── .env.example                 # Environment variables template
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── utils/
│   │   │   ├── api.ts               # API client
│   │   │   ├── websocket.ts         # WebSocket client
│   │   │   └── twitch.ts            # Twitch Extension Helper
│   │   ├── styles/
│   │   │   └── global.css           # Global styles
│   │   ├── types.ts                 # TypeScript types
│   │   ├── config.tsx               # Broadcaster config panel
│   │   ├── panel.tsx                # Viewer panel
│   │   ├── video_component.tsx      # Video component
│   │   ├── video_overlay.tsx        # Video overlay
│   │   └── mobile.tsx               # Mobile view
│   ├── *.html                       # Entry HTML files
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── package.json                     # Root package.json
└── README.md                        # This file
```

## Database Schema

### TierListConfig Collection
```javascript
{
  _id: ObjectId,
  channelId: String,           // Twitch channel ID
  channelName: String,          // Twitch channel name
  title: String,                // Tier list title
  items: [{
    id: String,
    name: String,
    imageUrl: String (optional)
  }],
  tiers: [String],              // e.g., ['S', 'A', 'B', 'C', 'D', 'F']
  status: String,               // 'draft' | 'active' | 'completed'
  startTime: Date,
  endTime: Date,
  allowRealTimeUpdates: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Vote Collection
```javascript
{
  _id: ObjectId,
  tierListId: String,           // Reference to TierListConfig
  channelId: String,
  userId: String,               // Twitch user ID
  username: String,
  votes: [{
    itemId: String,
    tier: String
  }],
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `TierListConfig`: `{channelId: 1, status: 1}`
- `Vote`: `{tierListId: 1, userId: 1}` (unique)

## Setup Instructions

### Prerequisites
- Node.js 18+ and npm
- MongoDB (local or Atlas)
- Twitch Developer Account
- VS Code (recommended)

### 1. Install Dependencies

```bash
# Install root dependencies
npm install

# Install all project dependencies
npm run install:all
```

### 2. Setup MongoDB

**Option A: Local MongoDB**
```bash
# Install MongoDB (macOS with Homebrew)
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB
brew services start mongodb-community
```

**Option B: MongoDB Atlas**
1. Create a free cluster at https://www.mongodb.com/cloud/atlas
2. Get your connection string
3. Use it in the `.env` file

### 3. Create Twitch Extension

1. Go to https://dev.twitch.tv/console/extensions
2. Click "Create Extension"
3. Fill in the details:
   - **Name**: Twitch Chat Tier List
   - **Description**: Interactive tier list voting for viewers
   - **Extension Type**: Panel, Video Component, Video Overlay, Mobile
4. After creation, note down:
   - **Client ID**
   - **Extension Secret** (Base64 encoded)
5. Configure Extension URLs (for local development):
   - **Config**: `https://localhost:3000/config.html`
   - **Panel**: `https://localhost:3000/panel.html`
   - **Video Component**: `https://localhost:3000/video_component.html`
   - **Video Overlay**: `https://localhost:3000/video_overlay.html`
   - **Mobile**: `https://localhost:3000/mobile.html`

### 4. Configure Environment Variables

```bash
# Copy the example env file
cp backend/.env.example backend/.env

# Edit backend/.env with your values
```

Required environment variables:
```bash
PORT=8081
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/twitch-tier-list

# Get these from Twitch Developer Console
TWITCH_CLIENT_ID=your_client_id_here
TWITCH_CLIENT_SECRET=your_client_secret_here
TWITCH_EXTENSION_SECRET=your_extension_secret_base64_here
TWITCH_EXTENSION_CLIENT_ID=your_extension_client_id_here

JWT_SECRET=your_random_secret_here
ALLOWED_ORIGINS=http://localhost:3000,https://localhost:3000
```

### 5. Development

```bash
# Run both backend and frontend concurrently
npm run dev

# Or run them separately:
npm run dev:backend  # Backend on port 8081
npm run dev:frontend # Frontend on port 3000
```

### 6. Testing Locally

1. Install Twitch Extension Developer Rig:
   https://dev.twitch.tv/docs/extensions/rig/

2. Load your extension in the rig with local hosting

3. Or use the Twitch Extension Helper Library test harness

### 7. Build for Production

```bash
# Build both backend and frontend
npm run build

# Build separately
npm run build:backend
npm run build:frontend
```

## API Endpoints

### Authentication
- `GET /api/auth/verify` - Verify Twitch token

### Tier Lists
- `POST /api/tierlists` - Create tier list (broadcaster only)
- `GET /api/tierlists` - Get all tier lists for channel
- `GET /api/tierlists/:id` - Get specific tier list
- `PUT /api/tierlists/:id` - Update tier list (broadcaster only)
- `POST /api/tierlists/:id/activate` - Activate tier list
- `POST /api/tierlists/:id/complete` - Complete tier list
- `GET /api/tierlists/:id/results` - Get aggregated results
- `POST /api/tierlists/:id/reset` - Reset votes (broadcaster only)

### Votes
- `POST /api/votes` - Submit/update vote
- `GET /api/votes/:tierListId` - Get user's vote

## WebSocket Events

### Client → Server
```javascript
{ type: 'auth', token: 'jwt_token' }
{ type: 'vote_update', data: { tierListId: 'id' } }
```

### Server → Client
```javascript
{ type: 'auth_success', userId: 'id', channelId: 'id', role: 'broadcaster' }
{ type: 'vote_update', data: { ... } }
{ type: 'error', message: 'error message' }
```

## Usage Guide

### For Streamers

1. **Open Config Panel**: Go to your Extension configuration page
2. **Create Tier List**:
   - Click "Create New Tier List"
   - Enter a title (e.g., "Best Video Games of All Time")
   - Add items with names and optional image URLs
   - Click "Create Tier List"
3. **Activate**: Click "Activate" on a tier list to start voting
4. **View Results**: Click "View Results" to see live aggregated votes
5. **Complete**: Click "Complete" when you're done
6. **Reset**: Click "Reset Votes" to start fresh

### For Viewers

1. **Open Panel**: Click on the extension panel below the stream
2. **Vote**: Select a tier for each item using the dropdowns
3. **Submit**: Click "Submit Your Vote" when you've voted for all items
4. **Watch**: See the aggregated results on the video overlay

## Deployment

### Backend (Heroku/Railway/Render)

1. Set environment variables
2. Connect to MongoDB Atlas
3. Deploy with:
```bash
cd backend
npm install
npm run build
npm start
```

### Frontend (Twitch Extension Hosting)

1. Build the frontend:
```bash
cd frontend
npm run build
```

2. Upload the `dist/` folder contents to Twitch Extension Assets

3. Update Extension URLs in Twitch Developer Console

## Security Considerations

- ✅ Twitch JWT validation for all requests
- ✅ Rate limiting to prevent abuse
- ✅ CORS configured for Twitch domains
- ✅ Helmet.js for security headers
- ✅ Environment variables for secrets
- ✅ MongoDB injection protection via Mongoose
- ✅ One vote per user per tier list

## Troubleshooting

**MongoDB Connection Issues:**
- Ensure MongoDB is running: `brew services list`
- Check connection string in `.env`
- Verify network access if using Atlas

**Twitch Auth Errors:**
- Verify Extension Secret is correct (Base64 encoded)
- Check that Twitch Client ID matches
- Ensure extension is activated in your channel

**WebSocket Not Connecting:**
- Check WS_URL in frontend environment
- Verify backend server is running
- Check CORS and firewall settings

**Build Errors:**
- Clear node_modules: `rm -rf node_modules package-lock.json`
- Reinstall: `npm install`
- Check Node.js version: `node --version` (18+ required)

## Future Enhancements

- [ ] Drag-and-drop tier assignment
- [ ] Custom tier names and colors
- [ ] Export results as image
- [ ] Historical tier list analytics
- [ ] Viewer tier list suggestions
- [ ] Time-limited voting windows
- [ ] Bracket-style tournaments
- [ ] Integration with Twitch Channel Points

## License

MIT License - feel free to use and modify for your own projects!

## Support

For issues, questions, or contributions:
- Create an issue on GitHub
- Join our Discord community
- Check Twitch Extension documentation: https://dev.twitch.tv/docs/extensions

---

Built with ❤️ for the Twitch community
