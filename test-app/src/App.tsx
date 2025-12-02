import { useState } from 'react';
import { OpenSCADPlayground } from 'openscad-playground';

function App() {
  const [lastEvent, setLastEvent] = useState<string>('None');
  const [statePreview, setStatePreview] = useState<string>('');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <header style={{ flexShrink: 0 }}>
        <h1>OpenSCAD Playground Test App</h1>
        <p>Testing the built NPM component - Port 3001</p>
      </header>

      <div className="playground-container" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <OpenSCADPlayground
          wasmUrl="/wasm/openscad.wasm"
          workerUrl="/openscad-worker.js"
          libraries={[
            { name: 'BOSL2', url: '/libraries/BOSL2.zip' },
            { name: 'MCAD', url: '/libraries/MCAD.zip' }
          ]}
          initialFiles={{
            'main.scad': `// Test Consumer App
// This is importing from the built NPM package!

// Create a simple house
difference() {
  // Main body
  cube([30, 30, 20], center=true);

  // Door
  translate([0, -15, -5])
    cube([8, 2, 15]);
}

// Roof
translate([-10, 0, 14])
  rotate([0, -45, 0])
    cube([30, 30, 2], center=true);

translate([10, 0, 14])
  rotate([0, 45, 0])
    cube([30, 30, 2], center=true);

// Chimney
translate([10, 0, 15])
  cube([4, 4, 8]);

`
          }}
          layout="multi"
          onStateChange={(state) => {
            setLastEvent('State Changed');
            setStatePreview(JSON.stringify({
              activePath: state.params.activePath,
              sourceCount: state.params.sources.length,
              layout: state.view.layout.mode
            }, null, 2));
          }}
          onRender={(output) => {
            setLastEvent('Render Complete');
            console.log('Render output:', output);
          }}
          onError={(error) => {
            setLastEvent(`Error: ${error.message}`);
            console.error('OpenSCAD error:', error);
          }}
        />
      </div>

      <footer style={{ flexShrink: 0 }}>
        <h4>Last Event: {lastEvent}</h4>
        {statePreview && <pre>{statePreview}</pre>}
      </footer>
    </div>
  );
}

export default App;
