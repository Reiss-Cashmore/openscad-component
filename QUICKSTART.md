# 🚀 Quick Start Guide

## Try it now!

```bash
cd /Users/reisscashmore/Development/openscad-component
npm run dev
```

Open your browser to `http://localhost:3000` and you should see the OpenSCAD Playground running!

## What just happened?

You're now running the **demo app** which uses the component source directly with hot module reload. Make changes to any file in `src/` and see them instantly in the browser.

## Build the NPM package

```bash
npm run build
```

This creates the distributable package in `dist/`:
- `dist/index.js` - ESM bundle
- `dist/index.cjs` - CommonJS bundle
- `dist/index.d.ts` - TypeScript types
- `dist/openscad-worker.js` - Web Worker
- `dist/style.css` - Styles

## Test as an NPM package

```bash
# Build and setup test app (automated)
bash scripts/build-and-test.sh

# Run the test app
cd test-app
npm run dev
```

Open `http://localhost:3001` to see the test app importing your built component!

## Development Workflow

### Scenario 1: Developing the component
```bash
npm run dev
```
Edit files in `src/`, see changes immediately.

### Scenario 2: Testing the NPM package
```bash
# Terminal 1
npm run build:watch

# Terminal 2
cd test-app && npm run dev
```
Changes to `src/` rebuild automatically. Refresh browser to see updates in test app.

## File Structure

```
openscad-component/
├── src/                  # Component source
│   ├── index.ts         # Main export
│   ├── OpenSCADPlayground.tsx  # Wrapper component
│   ├── components/      # UI components
│   ├── state/          # State management
│   ├── runner/         # OpenSCAD worker
│   └── ...
├── demo/               # Development app
├── test-app/           # NPM package test
├── public/             # Static assets
└── dist/              # Built package (after build)
```

## Common Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Run demo app with HMR |
| `npm run build` | Build NPM package |
| `npm run build:watch` | Build in watch mode |
| `npm run type-check` | Check TypeScript |
| `npm run preview` | Preview built demo |

## Next Steps

1. ✅ **Test demo app** - Run `npm run dev`
2. ✅ **Build package** - Run `npm run build`
3. ✅ **Test as NPM package** - Follow test app steps
4. 📝 Fix any issues that come up
5. 🎨 Customize and extend
6. 📦 Publish to NPM (when ready)

## Need Help?

- See [SETUP.md](./SETUP.md) for detailed setup info
- See [README.md](./README.md) for API documentation
- See [test-app/README.md](./test-app/README.md) for testing guide

## 🎉 You're all set!

Start developing with:
```bash
npm run dev
```
