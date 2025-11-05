#!/bin/bash

echo "🚀 Starting Bimora Backend Server..."
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  Warning: .env file not found!"
    echo "📝 Please create a .env file with your environment variables."
    echo "   You can copy .env.example and update the values."
    echo ""
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 node_modules not found. Installing dependencies..."
    npm install --production
    echo "✅ Dependencies installed!"
    echo ""
fi

# Start the server
echo "🎯 Starting server with Node.js..."
node index.js
