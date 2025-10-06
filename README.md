# Twitch Chat Tier List Extension# Twitch Chat Tier List Extension# Twitch Chat Tier List Extension



An interactive Twitch.tv Extension that enables streamers to create tier lists and let viewers vote in real-time with drag-and-drop.



## 🎮 FeaturesAn interactive Twitch.tv Extension that enables streamers to create tier lists and let viewers vote in real-time with drag-and-drop.A comprehensive Twitch.tv Extension that enables streamers to create interactive tier lists for their viewers with real-time voting and aggregation.



### For Streamers

- ✅ Create and manage tier lists with custom items

- ✅ Accept/reject viewer suggestions## 🎮 Features## Features

- ✅ Add, edit, and delete items dynamically

- ✅ Publish tier lists as public templates

- ✅ View real-time voting results

- ✅ Reset votes or complete sessions### For Streamers✅ **Streamer Dashboard** - Create and manage tier lists with custom items



### For Viewers- ✅ Create and manage tier lists with custom items✅ **Viewer Voting** - Each viewer can assign tiers to items

- ✅ Drag-and-drop tier list voting

- ✅ Submit item suggestions- ✅ Accept/reject viewer suggestions✅ **Real-time Updates** - WebSocket integration for live vote tracking

- ✅ Toggle between "My Vote" and "Current Results"

- ✅ Browse and clone community templates- ✅ Add, edit, and delete items dynamically✅ **Vote Aggregation** - Automatic calculation of average tiers

- ✅ Rate templates with 1-5 stars

- ✅ Real-time updates via WebSocket- ✅ View real-time voting results✅ **Results Display** - Visual representation of community rankings



### Community Features (v0.0.22)- ✅ Reset votes or complete sessions✅ **Multiple Rounds** - Run multiple tier list sessions

- ✅ **Template Browser** - Browse tier lists from other streamers

- ✅ **One-Click Clone** - Copy templates to your channel- ✅ Historical analytics (coming soon)✅ **Vote Reset** - Clear votes and start fresh

- ✅ **Star Ratings** - Rate and discover the best templates

- ✅ **Categories & Tags** - Organize and find templates easily✅ **Secure Authentication** - Twitch OAuth and JWT verification

- ✅ **Search & Filter** - Find exactly what you're looking for

### For Viewers✅ **Responsive Design** - Works on desktop and mobile

## 🏗️ Architecture

- ✅ Drag-and-drop tier list voting✅ **Dark Mode** - Twitch-native styling

### Backend (Node.js + Express + MongoDB)

- **Server**: Express.js REST API with 25+ endpoints- ✅ Submit item suggestions

- **WebSocket**: Real-time communication using `ws`

- **Database**: MongoDB with Mongoose ODM- ✅ Toggle between "My Vote" and "Current Results"## Architecture

- **Authentication**: Twitch Extension JWT verification

- **Security**: Helmet, CORS, rate limiting- ✅ Real-time updates via WebSocket

- **Deployment**: Railway (auto-deploy from GitHub)

- ✅ Mobile-friendly interface### Backend (Node.js + Express + MongoDB)

### Frontend (React + TypeScript)

- **Framework**: React 18 with TypeScript- **Server**: Express.js REST API

- **Build Tool**: Vite for fast development

- **Drag & Drop**: react-beautiful-dnd## 🚀 Quick Start- **WebSocket**: Real-time communication using `ws`

- **Styling**: CSS with Twitch design tokens

- **Views**: Config panel, Viewer panel, Video overlay, Mobile- **Database**: MongoDB with Mongoose ODM

- **Deployment**: Twitch CDN

### Prerequisites- **Authentication**: Twitch Extension JWT verification

## 📊 Project Structure

- Node.js 18+- **Security**: Helmet, CORS, rate limiting

```

twitch-chat-tier/- MongoDB database

├── backend/

│   ├── src/- Twitch Developer account### Frontend (React + TypeScript)

│   │   ├── models/              # MongoDB schemas

│   │   │   ├── TierListConfig.ts- **Framework**: React 18 with TypeScript

│   │   │   ├── Vote.ts

│   │   │   ├── Suggestion.ts### Installation- **Build Tool**: Vite for fast development

│   │   │   ├── Template.ts

│   │   │   └── Analytics.ts- **State Management**: React hooks + Zustand (optional)

│   │   ├── routes/              # API endpoints

│   │   │   ├── tierListRoutes.ts1. **Clone the repository**- **Styling**: CSS with Twitch design tokens

│   │   │   ├── voteRoutes.ts

│   │   │   ├── suggestionRoutes.ts   ```bash- **Views**: Config panel, Viewer panel, Video overlay, Mobile

│   │   │   └── templateRoutes.ts

│   │   ├── middleware/          # Auth & error handling   git clone https://github.com/Matt-Forsyth/twitch-chat-tier.git

│   │   ├── websocket/           # WebSocket logic

│   │   └── server.ts   cd twitch-chat-tier## Project Structure

│   └── package.json

│   ```

├── frontend/

│   ├── src/```

│   │   ├── utils/               # API & WebSocket clients

│   │   ├── config.tsx           # Broadcaster config panel2. **Install dependencies**twitch-chat-tier/

│   │   ├── panel.tsx            # Viewer panel

│   │   ├── TemplateBrowser.tsx  # Template browser component   ```bash├── backend/

│   │   └── types.ts             # TypeScript types

│   └── package.json   npm run install:all│   ├── src/

│

├── docs/   ```│   │   ├── config/

│   ├── CHANGELOG.md             # Version history

│   ├── DEPLOYMENT_SUMMARY_v0.0.22.md│   │   │   └── database.ts          # MongoDB connection

│   └── README.md

│3. **Configure environment**│   │   ├── models/

└── package.json

```   - Backend: Copy `backend/.env.example` to `backend/.env` and configure│   │   │   ├── TierListConfig.ts    # Tier list schema



## 📚 Documentation   - Frontend: Create `frontend/.env.production` with API URLs│   │   │   └── Vote.ts              # Vote schema



- **[CHANGELOG.md](docs/CHANGELOG.md)** - Complete version history and release notes for all versions│   │   ├── routes/

- **[Deployment Summary](docs/DEPLOYMENT_SUMMARY_v0.0.22.md)** - Latest deployment details

4. **Development**│   │   │   ├── authRoutes.ts        # Authentication endpoints

## 🎯 Current Version

   ```bash│   │   │   ├── tierListRoutes.ts    # Tier list CRUD

**v0.0.22** - Community Template System

   npm run dev│   │   │   └── voteRoutes.ts        # Voting endpoints

- Browse and share tier list templates across the community

- Publish completed tier lists as public templates   ```│   │   ├── services/

- Clone templates from other streamers with one click

- Rate templates with 1-5 stars│   │   │   └── twitchAuth.ts        # Twitch API integration

- Search, filter by category, sort by rating/usage/date

- Add descriptions, categories, and tags to templates5. **Production build**│   │   ├── middleware/



[Full Changelog →](docs/CHANGELOG.md)   ```bash│   │   │   ├── auth.ts              # Auth middleware



## 🔧 Technology Stack   npm run build│   │   │   └── errorHandler.ts      # Error handling



**Backend:**   ```│   │   ├── websocket/

- Node.js 18+

- Express.js│   │   │   └── websocketHandler.ts  # WebSocket logic

- MongoDB with Mongoose

- WebSocket (`ws`)## 📦 Deployment│   │   └── server.ts                # Main server file

- Twitch Extension JWT

- Railway hosting│   ├── .env.example                 # Environment variables template



**Frontend:**### Backend (Railway)│   ├── package.json

- React 18

- TypeScript- Automatically deploys from GitHub main branch│   └── tsconfig.json

- Vite

- react-beautiful-dnd- Environment variables configured in Railway dashboard│

- Twitch Extension Helper

├── frontend/

## 📈 Key Endpoints

### Frontend (Twitch)│   ├── src/

### Tier Lists

- `GET /api/tierlists` - List all tier lists for channel- Build production package: `npm run build:frontend`│   │   ├── utils/

- `POST /api/tierlists` - Create new tier list

- `GET /api/tierlists/active` - Get active tier list- Upload `frontend/twitch-extension-v0.0.21-fixed.zip` to Twitch Developer Console│   │   │   ├── api.ts               # API client

- `PUT /api/tierlists/:id/status` - Update tier list status

- `POST /api/tierlists/:id/items` - Add item to tier list- Test in hosted test mode before going live│   │   │   ├── websocket.ts         # WebSocket client

- `PUT /api/tierlists/:id/items/:itemId` - Update item

- `DELETE /api/tierlists/:id/items/:itemId` - Delete item│   │   │   └── twitch.ts            # Twitch Extension Helper



### Voting## 📚 Documentation

- `POST /api/votes` - Submit vote

- `GET /api/votes/:tierListId` - Get user's voteAll documentation is in the `/docs` folder:

- `GET /api/results/:tierListId` - Get aggregated results

- **[Setup Guide](docs/guides/SETUP_GUIDE.md)** - Initial setup and configuration

### Suggestions- **[API Documentation](docs/guides/API_DOCUMENTATION.md)** - Complete API reference

- `POST /api/suggestions` - Submit suggestion- **[Template System Guide](docs/guides/TEMPLATE_SYSTEM_GUIDE.md)** - Template features and best practices

- `GET /api/suggestions/:tierListId` - Get suggestions- **[CHANGELOG.md](CHANGELOG.md)** - Complete version history and release notes

- `PUT /api/suggestions/:id/status` - Accept/reject suggestion

│   ├── *.html                       # Entry HTML files

### Templates (v0.0.22)

- `GET /api/templates` - Browse public templates with filters## 🏗️ Architecture│   ├── package.json

- `POST /api/templates/publish/:tierListId` - Publish as template

- `POST /api/templates/:id/clone` - Clone template│   ├── tsconfig.json

- `POST /api/templates/:id/rate` - Rate template

### Backend│   └── vite.config.ts

## 🗄️ Database Schema

- **Runtime**: Node.js 18+ with TypeScript│

**TierListConfig**

```typescript- **Framework**: Express.js├── package.json                     # Root package.json

{

  channelId: String,- **Database**: MongoDB with Mongoose└── README.md                        # This file

  title: String,

  items: [{ id, name, imageUrl }],- **WebSocket**: ws library for real-time updates```

  tiers: [String],

  status: 'draft' | 'active' | 'completed',- **Authentication**: Twitch JWT verification

  description: String,

  category: String,- **Deployment**: Railway## Database Schema

  tags: [String],

  isPublic: Boolean

}

```### Frontend### TierListConfig Collection



**Template**- **Framework**: React 18 with TypeScript```javascript

```typescript

{- **Build Tool**: Vite{

  tierListId: ObjectId,

  channelId: String,- **Drag & Drop**: react-beautiful-dnd  _id: ObjectId,

  title: String,

  description: String,- **API Client**: Axios  channelId: String,           // Twitch channel ID

  category: String,

  tags: [String],- **Deployment**: Twitch CDN  channelName: String,          // Twitch channel name

  items: [{ id, name, imageUrl }],

  tiers: [String],  title: String,                // Tier list title

  usageCount: Number,

  averageRating: Number,## 🎯 Current Version

  ratings: [{ userId, rating }]

}**v0.0.22** - Community Template System

```

- Browse and share tier list templates across the community

**Vote**- Publish completed tier lists as public templates

```typescript- Clone templates from other streamers

{- Rate templates with 1-5 stars

  tierListId: ObjectId,- Search, filter by category, sort by rating/usage/date

  userId: String,- Add descriptions, categories, and tags to templates

  votes: [{ itemId, tier }]

}[Full Changelog →](CHANGELOG.md)

```

  allowRealTimeUpdates: Boolean,

## 📦 Deployment Packages

## 📊 Project Structure  createdAt: Date,

- **Frontend**: `twitch-chat-tier-v0.0.22.zip` (Twitch CDN)

- **Backend**: Auto-deployed from GitHub to Railway  updatedAt: Date

- **Extension ID**: `or6ehrdoc9gzasby1hmhhtw4wa0qdm`

## 📊 Project Structure

## 🌐 Links

```

- **GitHub**: [Matt-Forsyth/twitch-chat-tier](https://github.com/Matt-Forsyth/twitch-chat-tier)

- **Changelog**: [docs/CHANGELOG.md](docs/CHANGELOG.md)twitch-chat-tier/```



---├── backend/               # Node.js + Express backend



**Status**: ✅ Production Ready | **Version**: 0.0.22 | **Last Updated**: October 2025│   ├── src/### Vote Collection



---│   │   ├── config/       # Database configuration```javascript



**Note**: This repository is for viewing the source code and changelog. It is not intended for setting up your own copy of the extension.│   │   ├── models/       # MongoDB models{


│   │   ├── routes/       # API routes  _id: ObjectId,

│   │   ├── middleware/   # Auth & error handling  tierListId: String,           // Reference to TierListConfig

│   │   ├── services/     # Twitch API integration  channelId: String,

│   │   └── websocket/    # WebSocket handlers  userId: String,               // Twitch user ID

│   └── package.json  username: String,

│  votes: [{

├── frontend/             # React + TypeScript frontend    itemId: String,

│   ├── src/    tier: String

│   │   ├── utils/        # API & WebSocket clients  }],

│   │   ├── styles/       # CSS styles  createdAt: Date,

│   │   ├── config.tsx    # Broadcaster dashboard  updatedAt: Date

│   │   ├── panel.tsx     # Viewer voting interface}

│   │   └── types.ts      # TypeScript types```

│   ├── dist/             # Production build

│   └── package.json**Indexes:**

│- `TierListConfig`: `{channelId: 1, status: 1}`

├── docs/                 # Documentation
│   ├── guides/          # Setup, API, and feature guides
│   └── archive/         # Historical docs
│
├── CHANGELOG.md         # Version history and release notes
└── package.json         # Root package scripts- Node.js 18+ and npm

```- MongoDB (local or Atlas)

- Twitch Developer Account

## 🔧 Development- VS Code (recommended)



### Available Scripts### 1. Install Dependencies



```bash```bash

npm run dev              # Start both backend and frontend# Install root dependencies

npm run dev:backend      # Start backend onlynpm install

npm run dev:frontend     # Start frontend only

npm run build            # Build both projects# Install all project dependencies

npm run build:backend    # Build backend onlynpm run install:all

npm run build:frontend   # Build frontend only```

npm run install:all      # Install all dependencies

```### 2. Setup MongoDB



### Environment Variables**Option A: Local MongoDB**

```bash

**Backend** (`backend/.env`):# Install MongoDB (macOS with Homebrew)

```envbrew tap mongodb/brew

MONGODB_URI=mongodb://...brew install mongodb-community

TWITCH_CLIENT_ID=your_client_id

TWITCH_EXTENSION_SECRET=your_secret# Start MongoDB

NODE_ENV=developmentbrew services start mongodb-community

PORT=3000```

```

**Option B: MongoDB Atlas**

**Frontend** (`frontend/.env.production`):1. Create a free cluster at https://www.mongodb.com/cloud/atlas

```env2. Get your connection string

VITE_API_URL=https://your-api-url.com/api3. Use it in the `.env` file

VITE_WS_URL=wss://your-api-url.com/ws

```### 3. Create Twitch Extension



## 🤝 Contributing1. Go to https://dev.twitch.tv/console/extensions

2. Click "Create Extension"

This is a personal project, but suggestions and bug reports are welcome via GitHub Issues.3. Fill in the details:

   - **Name**: Twitch Chat Tier List

## 📝 License   - **Description**: Interactive tier list voting for viewers

   - **Extension Type**: Panel, Video Component, Video Overlay, Mobile

MIT License - See LICENSE file for details4. After creation, note down:

   - **Client ID**

## 🔗 Links   - **Extension Secret** (Base64 encoded)

5. Configure Extension URLs (for local development):

- **Twitch Extension**: [or6ehrdoc9gzasby1hmhhtw4wa0qdm](https://dev.twitch.tv/console/extensions/or6ehrdoc9gzasby1hmhhtw4wa0qdm)   - **Config**: `https://localhost:3000/config.html`

- **Backend API**: https://twitch-chat-tier-production.up.railway.app   - **Panel**: `https://localhost:3000/panel.html`

- **Support**: [Buy me a coffee](https://buymeacoffee.com/matthewforsyth) ☕   - **Video Component**: `https://localhost:3000/video_component.html`

   - **Video Overlay**: `https://localhost:3000/video_overlay.html`

## 🙏 Acknowledgments   - **Mobile**: `https://localhost:3000/mobile.html`



- Built with React, TypeScript, and Vite### 4. Configure Environment Variables

- Powered by Railway and MongoDB

- Styled with Twitch design tokens```bash

- Drag & drop by react-beautiful-dnd# Copy the example env file

cp backend/.env.example backend/.env

---

# Edit backend/.env with your values

**Status**: ✅ Production Ready | **Version**: 0.0.22 | **Last Updated**: October 2025```


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
