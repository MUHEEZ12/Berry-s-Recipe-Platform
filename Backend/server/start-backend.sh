#!/bin/bash

# Berry Recipes - Backend Server Startup Script
# Run this from Git Bash in Backend/server directory

echo "🚀 Starting MongoDB..."
# Make sure MongoDB is running
mongod --dbpath /c/data/db &
sleep 3

echo "🔧 Installing dependencies..."
npm install

echo "📝 Setting up .env..."
if [ ! -f .env ]; then
  cp .env.example .env
  echo "✅ .env created from .env.example"
fi

echo "🚀 Starting Backend Server..."
echo "Server will listen on http://localhost:4000"
echo ""
echo "Health Check: http://localhost:4000/health"
echo "MongoDB Check: http://localhost:4000/health/db"
echo ""

npm run dev
