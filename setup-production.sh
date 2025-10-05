#!/bin/bash

# Production Environment Variables Setup Script
# Run this to generate environment variables for your production deployment

echo "🚀 Twitch Extension - Production Environment Setup"
echo "=================================================="
echo ""

# Check if .env already exists
if [ -f "backend/.env.production" ]; then
    echo "⚠️  backend/.env.production already exists."
    read -p "Overwrite? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo "Let's set up your production environment variables..."
echo ""

# Prompt for Twitch credentials
echo "📋 Twitch Credentials"
echo "Get these from: https://dev.twitch.tv/console"
echo ""

read -p "Twitch Client ID: " TWITCH_CLIENT_ID
read -p "Twitch Client Secret: " TWITCH_CLIENT_SECRET
read -p "Extension Client ID: " TWITCH_EXTENSION_CLIENT_ID
read -p "Extension Secret (Base64): " TWITCH_EXTENSION_SECRET

echo ""
echo "📋 Backend Configuration"
echo ""

read -p "Backend URL (e.g., https://your-app.railway.app): " BACKEND_URL
read -p "MongoDB URI (leave empty to use Railway/Heroku default): " MONGODB_URI

if [ -z "$MONGODB_URI" ]; then
    MONGODB_URI='${{MONGOURL}}' # Railway/Render variable
fi

# Generate JWT secret
echo ""
echo "🔐 Generating JWT Secret..."
JWT_SECRET=$(openssl rand -base64 32)
echo "Generated: $JWT_SECRET"

# Determine frontend origin
FRONTEND_ORIGIN="https://${TWITCH_EXTENSION_CLIENT_ID}.ext-twitch.tv"

# Create production .env file
cat > backend/.env.production << EOF
# Production Environment Variables
# Generated: $(date)

# Server Configuration
NODE_ENV=production
PORT=8081

# MongoDB Connection
MONGODB_URI=${MONGODB_URI}

# Twitch Configuration
TWITCH_CLIENT_ID=${TWITCH_CLIENT_ID}
TWITCH_CLIENT_SECRET=${TWITCH_CLIENT_SECRET}
TWITCH_EXTENSION_SECRET=${TWITCH_EXTENSION_SECRET}
TWITCH_EXTENSION_CLIENT_ID=${TWITCH_EXTENSION_CLIENT_ID}

# JWT Secret
JWT_SECRET=${JWT_SECRET}

# CORS Origins
ALLOWED_ORIGINS=${FRONTEND_ORIGIN}

# WebSocket Configuration
WS_HEARTBEAT_INTERVAL=30000
EOF

# Create frontend production env
cat > frontend/.env.production << EOF
# Frontend Production Environment Variables
# Generated: $(date)

VITE_API_URL=${BACKEND_URL}/api
VITE_WS_URL=${BACKEND_URL/https/wss}/ws
EOF

echo ""
echo "✅ Environment files created!"
echo ""
echo "📁 Files created:"
echo "  - backend/.env.production"
echo "  - frontend/.env.production"
echo ""
echo "📋 Next Steps:"
echo ""
echo "1. Deploy Backend:"
echo "   - Copy variables from backend/.env.production to your hosting platform"
echo "   - Railway: Settings → Variables"
echo "   - Heroku: heroku config:set KEY=VALUE"
echo "   - Render: Environment tab"
echo ""
echo "2. Build Frontend:"
echo "   cd frontend"
echo "   npm run build"
echo ""
echo "3. Upload to Twitch:"
echo "   - Go to: https://dev.twitch.tv/console/extensions/${TWITCH_EXTENSION_CLIENT_ID}"
echo "   - Files tab → Upload dist/ contents"
echo ""
echo "4. Update Extension URLs:"
echo "   - Panel: panel.html"
echo "   - Config: config.html"
echo "   - Video Component: video_component.html"
echo "   - Video Overlay: video_overlay.html"
echo "   - Mobile: mobile.html"
echo ""
echo "5. Test on your channel!"
echo ""
echo "🎉 Ready to deploy!"
