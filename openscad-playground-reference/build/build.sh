#!/bin/bash
# Local build script for testing

set -e

echo "Installing dependencies..."
pip install -r requirements.txt

echo "Building executable with PyInstaller..."
pyinstaller 3d2scad.spec

echo "Build complete!"
echo "Executable location: dist/3d2scad"

# Make the executable runnable
chmod +x dist/3d2scad

# On macOS, remove quarantine attributes to prevent Gatekeeper issues
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "Removing macOS quarantine attributes..."
    xattr -cr dist/3d2scad 2>/dev/null || true
    echo "✓ macOS quarantine attributes removed"
fi

echo ""
echo "To test the executable, run:"
echo "  ./dist/3d2scad --help"
echo ""
echo "Note: The executable is in one-file mode. First run may take a few seconds while it extracts to a temp directory."
