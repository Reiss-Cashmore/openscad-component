import { OpenSCADPlayground } from '../../src/OpenSCADPlayground';

export function BasicPlaygroundPage() {
  return (
    <div style={{ flex: 1, minHeight: 0 }}>
      <OpenSCADPlayground
        initialFiles={{
          'main.scad': `// Welcome to OpenSCAD Playground!
// Edit this code to see your 3D model update

/* [Dimensions] */
base_width = 50;
base_depth = 30;
base_height = 20;

/* [Features] */
round_radius = 4;
add_holes = true;
hole_radius = 4;

module rounded_box() {
  minkowski() {
    cube([base_width - round_radius * 2, base_depth - round_radius * 2, base_height - round_radius], center=true);
    sphere(r=round_radius);
  }
}

module holes() {
  if (add_holes) {
    translate([0,0,-base_height/2]) {
      for (x=[-base_width/4, base_width/4]) {
        for (y=[-base_depth/4, base_depth/4]) {
          translate([x,y,0]) cylinder(h=base_height, r=hole_radius, center=false);
        }
      }
    }
  }
}

difference() {
  rounded_box();
  holes();
}
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
    </div>
  );
}

export default BasicPlaygroundPage;

