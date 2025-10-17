# OpenSCAD Playground Test App

This is a test consumer application to verify that the `openscad-playground` NPM package works correctly when imported.

## Purpose

- Tests that the built component can be imported as an NPM package
- Verifies all props and callbacks work correctly
- Ensures TypeScript types are properly exported
- Validates the component works in a real React application

## Usage

1. Build the parent component:
```bash
cd ..
npm run build
```

2. Install dependencies (will install from ../dist):
```bash
npm install
```

3. Copy assets:
```bash
cd ..
bash scripts/copy-assets.sh
```

4. Run the test app:
```bash
npm run dev
```

The app will open on `http://localhost:3001`

## Quick Setup

Run the automated script from the root:
```bash
cd ..
bash scripts/build-and-test.sh
cd test-app
npm run dev
```

## Development Workflow

For iterative development with hot reloading:

**Terminal 1** (watch build):
```bash
cd ..
npm run build:watch
```

**Terminal 2** (run test app):
```bash
npm run dev
```

Now changes to the parent component will rebuild automatically, and you can refresh the browser to see updates.

## What This Tests

- ✅ NPM package installation from local dist
- ✅ TypeScript types are available
- ✅ Component renders correctly
- ✅ Props work as expected
- ✅ Callbacks fire properly
- ✅ Styles are imported correctly
- ✅ Worker loads and executes
- ✅ WASM initializes properly
- ✅ All external dependencies load
