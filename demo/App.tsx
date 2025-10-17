import { OpenSCADPlayground } from '../src/OpenSCADPlayground';

function App() {
  return (
    <OpenSCADPlayground
      initialFiles={{
        'main.scad': `// Welcome to OpenSCAD Playground!
// Edit this code to see your 3D model update

// Simple cube example
cube([20, 20, 20], center=true);

// Sphere on top
translate([0, 0, 15])
  sphere(r=10);

// Cylinder at the bottom
translate([0, 0, -15])
  cylinder(h=10, r=8, center=true);
`
      }}
      layout="multi"
      onStateChange={(state) => {
        console.log('State changed:', state);
      }}
      onRender={(output) => {
        console.log('Render complete:', output);
      }}
      onError={(error) => {
        console.error('OpenSCAD error:', error);
      }}
    />
  );
}

export default App;
