#!/bin/bash

# Clika Dashboard Deployment Script

echo "🚀 Starting Clika Dashboard deployment..."

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Build the project
echo "🔨 Building the project..."
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    
    # Deploy to Vercel
    echo "🌐 Deploying to Vercel..."
    
    # Check if Vercel CLI is installed
    if ! command -v vercel &> /dev/null; then
        echo "❌ Vercel CLI not found. Installing..."
        npm i -g vercel
    fi
    
    # Deploy
    vercel --prod
else
    echo "❌ Build failed. Please check the errors above."
    exit 1
fi