#!/bin/bash

# AstroAI Deployment Script
# This script helps deploy the AstroAI platform to Vercel

echo "🚀 AstroAI Deployment Script"
echo "============================"

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Check if user is logged in to Vercel
echo "🔐 Checking Vercel login..."
vercel whoami &> /dev/null
if [ $? -ne 0 ]; then
    echo "📝 Please login to Vercel:"
    vercel login
fi

# Deploy Backend
echo "🔧 Deploying Backend API..."
cd api-backend

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  No .env file found. Please create one from .env.example"
    echo "📝 Required environment variables:"
    echo "   - MONGODB_URI"
    echo "   - JWT_SECRET"
    echo "   - GEMINI_API_KEY"
    echo "   - EMAIL_USER"
    echo "   - EMAIL_PASS"
    echo "   - REDIS_URL"
    read -p "Press Enter after setting up .env file..."
fi

echo "🚀 Deploying backend to Vercel..."
BACKEND_URL=$(vercel --prod | grep -o 'https://[^[:space:]]*' | head -1)

if [ -z "$BACKEND_URL" ]; then
    echo "❌ Backend deployment failed"
    exit 1
fi

echo "✅ Backend deployed to: $BACKEND_URL"

# Deploy Frontend
echo "🎨 Deploying Frontend..."
cd ../website

# Create .env file for frontend
echo "📝 Creating frontend .env file..."
cat > .env << EOF
REACT_APP_API_URL=${BACKEND_URL}/api
REACT_APP_ENV=production
EOF

echo "🚀 Deploying frontend to Vercel..."
FRONTEND_URL=$(vercel --prod | grep -o 'https://[^[:space:]]*' | head -1)

if [ -z "$FRONTEND_URL" ]; then
    echo "❌ Frontend deployment failed"
    exit 1
fi

echo "✅ Frontend deployed to: $FRONTEND_URL"

echo ""
echo "🎉 Deployment Complete!"
echo "======================="
echo "🌐 Frontend: $FRONTEND_URL"
echo "🔧 Backend:  $BACKEND_URL"
echo ""
echo "📝 Next Steps:"
echo "1. Visit your frontend URL to test the application"
echo "2. Set up your environment variables in Vercel dashboard"
echo "3. Configure your domain name (optional)"
echo "4. Set up monitoring and analytics (optional)"
echo ""
echo "🎯 Important Notes:"
echo "- Make sure your MongoDB is accessible from the internet"
echo "- Configure your email service for password resets"
echo "- Set up Redis for production caching"
echo "- Monitor your API usage and costs"
echo ""
echo "✨ Your AstroAI platform is now live!"
