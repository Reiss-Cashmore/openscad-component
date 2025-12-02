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
| `customizerValues` | `CustomizerValuesInput` | - | Override customizer parameter values |
| `onCustomizerValuesChange` | `(values: CustomizerValues) => void` | - | Callback when values change |
| `onParametersChange` | `(parameters: Parameter[]) => void` | - | Callback when parameter schema changes |

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

### Custom Customizer Panel

Build your own customizer UI by using the `customizerValues`, `onCustomizerValuesChange`, and `onParametersChange` props. This allows you to create a completely custom parameter interface while the playground handles rendering.

#### Types

```typescript
// Simple input format for setting values
type CustomizerValuesInput = Record<string, number | string | boolean | number[]>;

// Rich output format with full metadata
type CustomizerValues = Record<string, {
  value: number | string | boolean | number[];
  type: 'number' | 'string' | 'boolean';
  initial: number | string | boolean | number[];
  group: string;      // From OpenSCAD /* [Group Name] */ syntax
  caption?: string;
  min?: number;
  max?: number;
  step?: number;
  options?: { name: string; value: number | string }[];
}>;

// Parameter schema from OpenSCAD file
type Parameter = {
  name: string;
  type: 'number' | 'string' | 'boolean';
  initial: number | string | boolean | number[];
  group: string;
  caption?: string;
  min?: number;
  max?: number;
  step?: number;
  options?: { name: string; value: number | string }[];
};
```

#### Example

```tsx
import { OpenSCADPlayground } from 'openscad-playground';
import type { CustomizerValues, CustomizerValuesInput, Parameter } from 'openscad-playground';
import { useState, useCallback } from 'react';

function CustomCustomizerApp() {
  // Parameter schema from the OpenSCAD file
  const [parameters, setParameters] = useState<Parameter[]>([]);
  // Current values with full metadata
  const [values, setValues] = useState<CustomizerValues>({});
  // Your overrides to send back to the playground
  const [overrides, setOverrides] = useState<CustomizerValuesInput>({});

  const handleChange = useCallback((name: string, value: number | string | boolean) => {
    setOverrides(prev => ({ ...prev, [name]: value }));
  }, []);

  // Group parameters by their /* [Group] */ annotations
  const grouped = parameters.reduce((acc, param) => {
    (acc[param.group] ??= []).push(param);
    return acc;
  }, {} as Record<string, Parameter[]>);

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      {/* Your custom UI */}
      <aside style={{ width: 300, padding: 16, overflow: 'auto' }}>
        {Object.entries(grouped).map(([group, params]) => (
          <section key={group}>
            <h3>{group}</h3>
            {params.map(param => (
              <div key={param.name}>
                <label>{param.caption || param.name}</label>
                {param.type === 'boolean' ? (
                  <input
                    type="checkbox"
                    checked={Boolean(overrides[param.name] ?? values[param.name]?.value ?? param.initial)}
                    onChange={e => handleChange(param.name, e.target.checked)}
                  />
                ) : param.type === 'number' ? (
                  <input
                    type="number"
                    value={Number(overrides[param.name] ?? values[param.name]?.value ?? param.initial)}
                    min={param.min}
                    max={param.max}
                    step={param.step}
                    onChange={e => handleChange(param.name, Number(e.target.value))}
                  />
                ) : (
                  <input
                    type="text"
                    value={String(overrides[param.name] ?? values[param.name]?.value ?? param.initial)}
                    onChange={e => handleChange(param.name, e.target.value)}
                  />
                )}
              </div>
            ))}
          </section>
        ))}
      </aside>

      {/* Playground with bindings */}
      <div style={{ flex: 1 }}>
        <OpenSCADPlayground
          initialFiles={{
            'main.scad': `
              /* [Dimensions] */
              width = 20;
              height = 10;
              
              /* [Options] */
              rounded = true;
              
              cube([width, width, height], center=true);
            `
          }}
          customizerValues={overrides}
          onCustomizerValuesChange={setValues}
          onParametersChange={setParameters}
          initialState={{
            view: {
              layout: { mode: 'multi', editor: true, viewer: true, customizer: false }
            }
          }}
        />
      </div>
    </div>
  );
}
```

#### How It Works

1. **`onParametersChange`** fires when the OpenSCAD file is parsed, providing the parameter schema with types, groups, and constraints
2. **`onCustomizerValuesChange`** fires whenever values change, providing the current state with full metadata
3. **`customizerValues`** accepts simple key-value pairs to override parameter values - changes trigger instant re-renders

The OpenSCAD `/* [Group Name] */` syntax is used to organize parameters into groups in your custom UI.

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
