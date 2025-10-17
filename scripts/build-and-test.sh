#!/bin/bash

# Build the component and prepare test-app

set -e

echo "🔨 Building openscad-playground component..."
npm run build

echo ""
echo "📦 Installing in test-app..."
cd test-app
npm install

echo ""
echo "📋 Copying assets to test-app..."
cd ..
bash scripts/copy-assets.sh

echo ""
echo "✅ Build complete!"
echo ""
echo "To test the component:"
echo "  cd test-app && npm run dev"
echo ""
echo "To develop with hot reload:"
echo "  Terminal 1: npm run build:watch"
echo "  Terminal 2: cd test-app && npm run dev"
