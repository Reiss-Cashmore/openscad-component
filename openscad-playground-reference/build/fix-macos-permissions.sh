#!/bin/bash
# Helper script to fix macOS Gatekeeper issues with the 3d2scad executable
# Run this after downloading if you get the "damaged" error

set -e

# Check if running on macOS
if [[ "$OSTYPE" != "darwin"* ]]; then
    echo "This script is only needed on macOS"
    exit 0
fi

# Find the 3d2scad executable
if [ -f "3d2scad" ]; then
    EXEC="3d2scad"
elif [ -f "3d2scad-macos-arm64" ]; then
    EXEC="3d2scad-macos-arm64"
elif [ -f "3d2scad-macos-x64" ]; then
    EXEC="3d2scad-macos-x64"
elif [ -f "dist/3d2scad" ]; then
    EXEC="dist/3d2scad"
else
    echo "Error: Could not find 3d2scad executable"
    echo "Please run this script from the directory containing the executable"
    echo "Looking for: 3d2scad, 3d2scad-macos-arm64, 3d2scad-macos-x64, or dist/3d2scad"
    exit 1
fi

echo "Fixing macOS Gatekeeper issues for $EXEC..."
echo ""

# Remove quarantine attributes
echo "Removing quarantine attributes..."
xattr -cr "$EXEC"

# Make executable
echo "Setting execute permissions..."
chmod +x "$EXEC"

echo ""
echo "✓ Done! The executable should now work."
echo ""
echo "Try running:"
echo "  ./$EXEC --help"
