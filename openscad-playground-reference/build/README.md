# Building 3d2scad Executables

This directory contains the configuration files needed to build standalone executables of the `3d2scad.py` script for macOS and Linux.

## Files

- **requirements.txt** - Python dependencies needed for building
- **3d2scad.spec** - PyInstaller specification file
- **build.sh** - Local build script for testing
- **fix-macos-permissions.sh** - Helper script to fix macOS Gatekeeper issues
- **README.md** - This file

## Build Configuration

The build is configured for **one-file mode** which provides:
- **Simple distribution** - Single executable file
- **Easy to use** - Just download and run
- No need to manage multiple files

Note: First run may take a few seconds as the executable extracts libraries to a temp directory.

## Local Building

To build the executable locally on your machine:

```bash
cd build
./build.sh
```

The executable will be created at `build/dist/3d2scad`.

### Manual Build

If you prefer to build manually:

```bash
cd build
pip install -r requirements.txt
pyinstaller 3d2scad.spec
```

## GitHub Actions

The GitHub Actions workflow is configured to automatically build executables for both macOS and Linux when:

1. **Manual trigger**: You can manually trigger the workflow from the Actions tab
2. **Tag push**: When you push a version tag (e.g., `v1.0.0`)

### Triggering a Build

#### Manual Trigger
1. Go to the GitHub repository
2. Click on the "Actions" tab
3. Select "Build Executables" workflow
4. Click "Run workflow"

#### Tag-based Release
```bash
git tag v1.0.0
git push origin v1.0.0
```

This will:
- Build executables for macOS and Linux
- Create a GitHub Release with the tag
- Attach the packaged executables to the release

## Output

The workflow produces three single-file executables:
- `3d2scad-linux-x64` - Linux x64 executable
- `3d2scad-macos-x64` - macOS Intel (x86_64) executable
- `3d2scad-macos-arm64` - macOS Apple Silicon (M1/M2/M3) executable

## Using the Executable

After building locally, test the executable:

```bash
./dist/3d2scad --help
```

Or with a real file:

```bash
./dist/3d2scad input.stl output.scad
```

### For End Users

After downloading from a GitHub release:

**For macOS Apple Silicon (M1/M2/M3):**
```bash
# Make executable (if needed)
chmod +x 3d2scad-macos-arm64

# Run
./3d2scad-macos-arm64 input.stl output.scad
```

**For macOS Intel:**
```bash
# Make executable (if needed)
chmod +x 3d2scad-macos-x64

# Run
./3d2scad-macos-x64 input.stl output.scad
```

**For Linux:**
```bash
# Make executable (if needed)
chmod +x 3d2scad-linux-x64

# Run
./3d2scad-linux-x64 input.stl output.scad
```

You can optionally move the executable to a location in your PATH:

```bash
# Example: Add to PATH (adjust filename as needed)
sudo mv 3d2scad-macos-arm64 /usr/local/bin/3d2scad
```

**Note:** To check your Mac's architecture, run `uname -m`:
- `arm64` = Apple Silicon (use `3d2scad-macos-arm64`)
- `x86_64` = Intel (use `3d2scad-macos-x64`)

## Dependencies

The executable bundles all required Python packages:
- numpy
- scipy
- trimesh
- open3d
- networkx
- lxml

Users do not need to install Python or these packages to run the executable.

## Troubleshooting

### Startup Time
The executable is in one-file mode, which means:
- First run extracts to a temp directory (may take 5-10 seconds)
- Subsequent runs reuse the extracted files (faster)
- This is normal behavior and provides simpler distribution

### Missing Dependencies
If the executable fails due to missing libraries, you may need to add them to the `hiddenimports` list in `3d2scad.spec`. The spec file already excludes unnecessary GUI libraries (tkinter, matplotlib, Qt) to reduce size.

### File Size
The executable is large (~200-300 MB) due to the inclusion of scientific libraries like numpy, scipy, and open3d. This is normal for PyInstaller builds with these dependencies.

### Platform-Specific Issues

#### macOS Gatekeeper Issues

If you see an error like `"Python.framework" is damaged and can't be opened`, this is macOS Gatekeeper blocking unsigned executables. There are several solutions:

**Solution 1: Remove quarantine attributes (Recommended)**
```bash
# Remove the quarantine flag (adjust filename for your architecture)
xattr -cr 3d2scad-macos-arm64
# or for Intel Macs:
xattr -cr 3d2scad-macos-x64
```

Or use the helper script:
```bash
cd build
./fix-macos-permissions.sh
```

**Solution 2: Allow in System Preferences**
1. Try to run the executable
2. When blocked, go to System Preferences → Security & Privacy → General
3. Click "Open Anyway" next to the blocked message
4. Try running again and click "Open" in the dialog

**Solution 3: Use spctl**
```bash
# Allow the executable (adjust filename for your architecture)
sudo spctl --master-disable  # Disables Gatekeeper temporarily
./3d2scad-macos-arm64 --help
sudo spctl --master-enable   # Re-enable Gatekeeper
```

**Note**: The GitHub Actions build automatically removes quarantine attributes before packaging, so releases should work without these steps.

#### Linux
- Ensure the executable has execute permissions: `chmod +x 3d2scad-linux-x64`

### Architecture Compatibility

**macOS:**
- Apple Silicon (M1/M2/M3) Macs should use `3d2scad-macos-arm64`
- Intel Macs should use `3d2scad-macos-x64`
- Rosetta 2 can run x64 executables on ARM Macs, but native ARM is faster

**Linux:**
- Most modern Linux systems are x64 compatible
- Run `uname -m` to verify (should show `x86_64`)
