/*
  Hello there!

  If you're new to OpenSCAD, please learn the basics here:
  https://openscad.org/documentation.html

  There are lots of amazing libraries in the OpenSCAD ecosystem
  (see this list: https://openscad.org/libraries.html).

  Some of these libraries are bundled with this playground
  (search for "demo" or "example" in the file explorer above)
  and can be included directly from your models.

  Any bugs (this is an Alpha!) or ideas of features?
  https://github.com/openscad/openscad-playground/issues/new
*/

// ===== CUSTOMIZABLE PARAMETERS =====

/* [Title] */
// Title text to display
title = "OpenSCAD";
// Title color
title_color = "gray";
// Title rotation X
title_rotation_x = 90;
// Title rotation Y
title_rotation_y = 0;
// Title rotation Z
title_rotation_z = 0;
// Title extrude height
title_extrude_height = 1;

/* [Main Geometry - Body] */
// Body sphere radius
body_radius = 10;
// Body color
body_color = "Blue";

/* [Main Geometry - Intersector] */
// Intersector cube size
intersector_size = 15;
// Intersector color
intersector_color = "Red";

/* [Main Geometry - Holes] */
// Hole cylinder height
hole_height = 20;
// Hole cylinder radius
hole_radius = 5;
// Hole color
hole_color = "Lime";
// Hole A rotation X
hole_a_rotation_x = 0;
// Hole A rotation Y
hole_a_rotation_y = 90;
// Hole A rotation Z
hole_a_rotation_z = 0;
// Hole B rotation X
hole_b_rotation_x = 90;
// Hole B rotation Y
hole_b_rotation_y = 0;
// Hole B rotation Z
hole_b_rotation_z = 0;
// Hole C rotation X
hole_c_rotation_x = 0;
// Hole C rotation Y
hole_c_rotation_y = 0;
// Hole C rotation Z
hole_c_rotation_z = 0;

/* [Debug Helpers] */
// Show helper geometry
debug = true;
// Helper line radius
helper_line_radius = 1;
// Helper line height
helper_line_height = 10;
// Helper line color
helper_line_color = "Black";
// Helper scale factor
helper_scale = 0.5;

/* [Resolution] */
// Minimum facet size (mm) - smaller = higher quality
facet_size = 1; // [0.1:0.1:2]
// Maximum facet angle (degrees) - smaller = higher quality
facet_angle = 15; // [1:1:30]

// ===== END CUSTOMIZABLE PARAMETERS =====

// Global resolution
$fs = $preview ? facet_size : 0.1;  // Don't generate smaller facets than 0.1 mm
$fa = $preview ? facet_angle : 5;    // Don't generate larger angles than 5 degrees

// Title text
color(title_color)
    rotate([title_rotation_x, title_rotation_y, title_rotation_z])
        translate([0, debug ? -60 : -20, 0])
            linear_extrude(title_extrude_height)
                text(title,
                    halign="center",
                    valign="center");

// Main geometry
difference() {
    intersection() {
        body();
        intersector();
    }
    holes();
}

// Helpers
if (debug) helpers();

// Core geometric primitives.
// These can be modified to create variations of the final object

module body() {
    color(body_color) sphere(body_radius);
}

module intersector() {
    color(intersector_color) cube(intersector_size, center=true);
}

module holeObject() {
    color(hole_color) cylinder(h=hole_height, r=hole_radius, center=true);
}

// Various modules for visualizing intermediate components

module intersected() {
    intersection() {
        body();
        intersector();
    }
}

module holeA() rotate([hole_a_rotation_x, hole_a_rotation_y, hole_a_rotation_z]) holeObject();
module holeB() rotate([hole_b_rotation_x, hole_b_rotation_y, hole_b_rotation_z]) holeObject();
module holeC() rotate([hole_c_rotation_x, hole_c_rotation_y, hole_c_rotation_z]) holeObject();

module holes() {
    union() {
        holeA();
        holeB();
        holeC();
    }
}

module helpers() {
    // Inner module since it's only needed inside helpers
    module line() color(helper_line_color) cylinder(r=helper_line_radius, h=helper_line_height, center=true);

    scale(helper_scale) {
        translate([-30,0,-40]) {
            intersected();
            translate([-15,0,-35]) body();
            translate([15,0,-35]) intersector();
            translate([-7.5,0,-17.5]) rotate([0,30,0]) line();
            translate([7.5,0,-17.5]) rotate([0,-30,0]) line();
        }
        translate([30,0,-40]) {
            holes();
            translate([-10,0,-35]) holeA();
            translate([10,0,-35]) holeB();
            translate([30,0,-35]) holeC();
            translate([5,0,-17.5]) rotate([0,-20,0]) line();
            translate([-5,0,-17.5]) rotate([0,30,0]) line();
            translate([15,0,-17.5]) rotate([0,-45,0]) line();
        }
        translate([-20,0,-22.5]) rotate([0,45,0]) line();
        translate([20,0,-22.5]) rotate([0,-45,0]) line();
    }
}

echo(version=version());
// Written by Marius Kintel <marius@kintel.net>
//
// To the extent possible under law, the author(s) have dedicated all
// copyright and related and neighboring rights to this software to the
// public domain worldwide. This software is distributed without any
// warranty.
//
// You should have received a copy of the CC0 Public Domain
// Dedication along with this software.
// If not, see <http://creativecommons.org/publicdomain/zero/1.0/>.

