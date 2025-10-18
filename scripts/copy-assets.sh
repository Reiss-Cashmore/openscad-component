#!/bin/bash

# Script to copy assets from main public to test-app public

echo "Copying assets to test-app..."

cp -r public/wasm test-app/public/
cp -r public/libraries test-app/public/
cp -r public/fonts test-app/public/
cp public/browserfs.min.js test-app/public/
cp public/model-viewer.min.js test-app/public/
cp public/axes.glb test-app/public/
cp public/skybox-lights.jpg test-app/public/
cp public/openscad-worker.js test-app/public/

# Copy worker chunks
cp public/filesystem-*.js test-app/public/ 2>/dev/null || true
cp public/utils-*.js test-app/public/ 2>/dev/null || true
cp public/zip-archives-*.js test-app/public/ 2>/dev/null || true

echo "Assets copied successfully!"
