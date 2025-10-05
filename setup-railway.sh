#!/bin/bash

echo "🚂 Railway Environment Setup"
echo "=============================="
echo ""

# Read from local .env file
if [ -f .env ]; then
    source .env
fi

# Generate JWT secret if not exists
if [ -z "$JWT_SECRET" ]; then
    JWT_SECRET=$(openssl rand -base64 32)
fi

echo "Setting Railway environment variables..."
echo ""

# Set environment variables
railway variables --set NODE_ENV=production
railway variables --set PORT=8081
railway variables --set JWT_SECRET="$JWT_SECRET"

# MongoDB will be auto-set by Railway, but we can reference it
echo ""
echo "⚠️  IMPORTANT: Set these manually in Railway dashboard:"
echo "   1. TWITCH_CLIENT_ID=<your-client-id>"
echo "   2. TWITCH_CLIENT_SECRET=<your-client-secret>"
echo "   3. TWITCH_EXTENSION_SECRET=<your-extension-secret>"
echo "   4. TWITCH_EXTENSION_CLIENT_ID=<your-extension-client-id>"
echo ""
echo "MongoDB connection (MONGODB_URI) will be automatically set by Railway."
echo ""
echo "✅ Basic variables set! Now set your Twitch credentials:"
echo "   Run: railway open"
echo "   Then go to Variables tab and add the Twitch values above"
