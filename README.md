# OpenSCAD Playground

OpenSCAD in the browser - A React component for 3D CAD modeling with WebAssembly.

## Features

- **Full OpenSCAD in the browser** - No installation required
- **Monaco Editor** - VSCode-like editing experience with syntax highlighting
- **3D Viewer** - Real-time rendering with Google's model-viewer
- **20+ Libraries** - BOSL2, MCAD, NopSCADlib, and more pre-bundled
- **Multiple Export Formats** - STL, 3MF, GLB, SVG, DXF, and more
- **Customizer** - Interactive parameter controls
- **React Component** - Easy integration into your React apps

## Installation

```bash
npm install openscad-playground
```

## Quick Start

```tsx
import { OpenSCADPlayground } from 'openscad-playground';
import 'openscad-playground/styles';

function App() {
  return (
    <OpenSCADPlayground
      initialFiles={{
        'main.scad': 'cube([10, 10, 10]);'
      }}
      layout="multi"
    />
  );
}
```

## Documentation

### Basic Usage

```tsx
import { OpenSCADPlayground } from 'openscad-playground';
import 'openscad-playground/styles';

function MyCADApp() {
  return (
    <div style={{ height: '100vh' }}>
      <OpenSCADPlayground
        initialFiles={{
          'main.scad': `
            // Your OpenSCAD code
            cube([20, 20, 20], center=true);
            sphere(r=10);
          `
        }}
        layout="multi"
        onRender={(output) => {
          console.log('Rendered:', output);
        }}
      />
    </div>
  );
}
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `initialFiles` | `Record<string, string>` | - | Initial file contents |
| `initialState` | `Partial<State>` | - | Full initial state |
| `layout` | `'single' \| 'multi'` | `'multi'` | Layout mode |
| `defaultFocus` | `'editor' \| 'viewer' \| 'customizer'` | `'editor'` | Default focused panel |
| `libraries` | `LibraryConfig[]` | - | Custom library configurations |
| `onStateChange` | `(state: State) => void` | - | State change callback |
| `onRender` | `(output: any) => void` | - | Render complete callback |
| `onError` | `(error: Error) => void` | - | Error callback |
| `statePersister` | `StatePersister` | - | Custom state persistence |
| `className` | `string` | - | CSS class for container |
| `style` | `React.CSSProperties` | - | Inline styles for container |

### Required Assets

You need to host these files publicly (available in the `public/` folder):

1. **OpenSCAD WASM** (~10MB)
   - `public/wasm/openscad.js`
   - `public/wasm/openscad.wasm`

2. **External Libraries**
   - `public/browserfs.min.js` - Virtual filesystem
   - `public/model-viewer.min.js` - 3D viewer

3. **OpenSCAD Libraries** (optional)
   - `public/libraries/*.zip` - 20+ OpenSCAD libraries

4. **Other Assets**
   - `public/fonts/` - Font files
   - `public/axes.glb` - 3D axes model
   - `public/skybox-lights.jpg` - Environment lighting

## Development

### Project Structure

```
openscad-component/
├── src/              # Source code
├── demo/             # Demo app (npm run dev)
├── test-app/         # Test consumer app
├── public/           # Static assets
└── dist/             # Built package
```

### Commands

```bash
# Development (runs demo app)
npm run dev

# Build the component
npm run build

# Build with watch mode
npm run build:watch
```

### Testing the Built Package

```bash
# Build and setup test app
bash scripts/build-and-test.sh

# Run test app
cd test-app
npm run dev  # Opens on port 3001
```

## Advanced Usage

### Custom State Management

```tsx
import { OpenSCADPlayground, State } from 'openscad-playground';
import { useState } from 'react';

function App() {
  const [state, setState] = useState<Partial<State>>({
    params: {
      activePath: 'main.scad',
      sources: [
        { path: 'main.scad', content: 'cube([10,10,10]);' }
      ]
    }
  });

  return (
    <OpenSCADPlayground
      initialState={state}
      onStateChange={(newState) => {
        setState(newState);
        // Save to localStorage, database, etc.
      }}
    />
  );
}
```

### Using Hooks

```tsx
import { useOpenSCAD } from 'openscad-playground';

function MyComponent() {
  const { model, fs, isReady, error } = useOpenSCAD({
    initialState: getInitialState()
  });

  if (!isReady) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return <div>OpenSCAD is ready!</div>;
}
```


## Credits

- Original OpenSCAD Playground by [Olivier Chafik](https://github.com/ochafik)
- OpenSCAD project: [openscad.org](https://openscad.org)
- BOSL2 and other bundled libraries by their respective authors
