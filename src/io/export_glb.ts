import { Document, NodeIO, Accessor, Primitive } from '@gltf-transform/core';
import { Light as LightDef, KHRLightsPunctual } from '@gltf-transform/extensions';
import { Vertex, Color, Face, IndexedPolyhedron, DEFAULT_FACE_COLOR } from './common';

type Geom = {
    positions: Float32Array;
    indices: Uint32Array;
    colors?: Float32Array;
};

function createPrimitive(doc: Document, baseColorFactor: Color, {positions, indices, colors}: Geom): Primitive {
    const prim = doc.createPrimitive()
        .setMode(Primitive.Mode.TRIANGLES)
        .setMaterial(
            doc.createMaterial()
                .setDoubleSided(true)
                .setAlphaMode(baseColorFactor[3] < 1 ? 'BLEND' : 'OPAQUE')
                .setMetallicFactor(0.0)
                .setRoughnessFactor(0.8)
                .setBaseColorFactor(baseColorFactor))
        .setAttribute('POSITION',
            doc.createAccessor()
                .setType(Accessor.Type.VEC3)
                .setArray(positions))
        .setIndices(
            doc.createAccessor()
                .setType(Accessor.Type.SCALAR)
                .setArray(indices));
    if (colors) {
        prim.setAttribute('COLOR_0',
            doc.createAccessor()
                .setType(Accessor.Type.VEC3)
                .setArray(colors));
    }
    return prim;
}

function getGeom(data: IndexedPolyhedron): Geom {
    let positions = new Float32Array(data.vertices.length * 3);
    const indices = new Uint32Array(data.faces.length * 3);

    const addedVertices = new Map<number, number>();
    let verticesAdded = 0;
    const addVertex = (i: number) => {
        let index = addedVertices.get(i);
        if (index === undefined) {
            const offset = verticesAdded * 3;
            const vertex = data.vertices[i];
            positions[offset] = vertex.x;
            positions[offset + 1] = vertex.y;
            positions[offset + 2] = vertex.z;
            index = verticesAdded++;
            addedVertices.set(i, index);
        }
        return index;
    };

    data.faces.forEach((face, i) => {
        const { vertices } = face;
        if (vertices.length < 3) throw new Error('Face must have at least 3 vertices');

        const offset = i * 3;
        indices[offset] = addVertex(vertices[0]);
        indices[offset + 1] = addVertex(vertices[1]);
        indices[offset + 2] = addVertex(vertices[2]);
    });
    return {
        positions: positions.slice(0, verticesAdded * 3),
        indices
    };
}

// Create a build plate grid mesh with solid base and grid lines
function createBuildPlateGrid(doc: Document): { mesh: any, node: any } {
    try {
        const buffer = doc.getRoot().listBuffers()[0];
        if (!buffer) {
            console.error('No buffer available for build plate');
            throw new Error('Buffer not found');
        }
        
        const buildPlateMesh = doc.createMesh();
        const gridSize = 200; // 200mm x 200mm
        const half = gridSize / 2;
        
        // Create a solid base plane
        const planeVertices = new Float32Array([
            -half, -half, -0.1,  // bottom-left
            half, -half, -0.1,   // bottom-right
            half, half, -0.1,    // top-right
            -half, half, -0.1,   // top-left
        ]);
        
        const planeIndices = new Uint16Array([
            0, 1, 2,  // first triangle
            0, 2, 3   // second triangle
        ]);
        
        // Create base plane primitive (dark gray, slightly transparent)
        const baseMaterial = doc.createMaterial()
            .setBaseColorFactor([0.15, 0.15, 0.15, 0.8])
            .setAlphaMode('BLEND')
            .setDoubleSided(true)
            .setMetallicFactor(0.1)
            .setRoughnessFactor(0.9);
        
        const basePrimitive = doc.createPrimitive()
            .setMode(Primitive.Mode.TRIANGLES)
            .setAttribute('POSITION',
                doc.createAccessor()
                    .setType(Accessor.Type.VEC3)
                    .setArray(planeVertices)
                    .setBuffer(buffer))
            .setIndices(
                doc.createAccessor()
                    .setType(Accessor.Type.SCALAR)
                    .setArray(planeIndices)
                    .setBuffer(buffer))
            .setMaterial(baseMaterial);
        
        buildPlateMesh.addPrimitive(basePrimitive);
        
        // Create grid lines on top of the plane
        const gridSpacing = 10;
        const gridLines = gridSize / gridSpacing;
        const lineVertices: number[] = [];
        const lineIndices: number[] = [];
        let vertexIndex = 0;
        
        // Grid lines along X axis
        for (let i = 0; i <= gridLines; i++) {
            const y = -half + i * gridSpacing;
            lineVertices.push(-half, y, 0, half, y, 0);
            lineIndices.push(vertexIndex, vertexIndex + 1);
            vertexIndex += 2;
        }
        
        // Grid lines along Y axis
        for (let i = 0; i <= gridLines; i++) {
            const x = -half + i * gridSpacing;
            lineVertices.push(x, -half, 0, x, half, 0);
            lineIndices.push(vertexIndex, vertexIndex + 1);
            vertexIndex += 2;
        }
        
        // Create grid lines material (bright blue, more opaque)
        const gridMaterial = doc.createMaterial()
            .setBaseColorFactor([0.4, 0.7, 1.0, 0.7])
            .setAlphaMode('BLEND')
            .setDoubleSided(true)
            .setEmissiveFactor([0.1, 0.2, 0.3]); // Slight glow
        
        const gridPrimitive = doc.createPrimitive()
            .setMode(Primitive.Mode.LINES)
            .setAttribute('POSITION',
                doc.createAccessor()
                    .setType(Accessor.Type.VEC3)
                    .setArray(new Float32Array(lineVertices))
                    .setBuffer(buffer))
            .setIndices(
                doc.createAccessor()
                    .setType(Accessor.Type.SCALAR)
                    .setArray(new Uint16Array(lineIndices))
                    .setBuffer(buffer))
            .setMaterial(gridMaterial);
        
        buildPlateMesh.addPrimitive(gridPrimitive);
        
        const buildPlateNode = doc.createNode()
            .setMesh(buildPlateMesh)
            .setTranslation([0, 0, 0]);
        
        return { mesh: buildPlateMesh, node: buildPlateNode };
    } catch (error) {
        console.error('Error creating build plate:', error);
        throw error;
    }
}

export async function exportGlb(data: IndexedPolyhedron, defaultColor: Color = DEFAULT_FACE_COLOR, includeBuildPlate: boolean = true): Promise<Blob> {
    const doc = new Document();
    const lightExt = doc.createExtension(KHRLightsPunctual);
    doc.createBuffer();

    const scene = doc.createScene()
        .addChild(doc.createNode()
            .setExtension('KHR_lights_punctual', lightExt
                .createLight()
                .setType(LightDef.Type.DIRECTIONAL)
                .setIntensity(1.0)
                .setColor([1.0, 1.0, 1.0]))
            .setRotation([-0.3250576, -0.3250576, 0, 0.8880739]))
        .addChild(doc.createNode()
            .setExtension('KHR_lights_punctual', lightExt
                .createLight()
                .setType(LightDef.Type.DIRECTIONAL)
                .setIntensity(1.0)
                .setColor([1.0, 1.0, 1.0]))
            .setRotation([0.6279631, 0.6279631, 0, 0.4597009]));

    const mesh = doc.createMesh();

    const facesByColor = new Map<number, Face[]>();
    data.faces.forEach(face => {
        let faces = facesByColor.get(face.colorIndex);
        if (!faces) facesByColor.set(face.colorIndex, faces = []);
        faces.push(face);
    });
    
    // Calculate model bounds to center it on the build plate
    let minZ = Infinity;
    let maxX = -Infinity, minX = Infinity;
    let maxY = -Infinity, minY = Infinity;
    
    data.vertices.forEach(v => {
        if (v.z < minZ) minZ = v.z;
        if (v.x > maxX) maxX = v.x;
        if (v.x < minX) minX = v.x;
        if (v.y > maxY) maxY = v.y;
        if (v.y < minY) minY = v.y;
    });
    
    const centerX = (maxX + minX) / 2;
    const centerY = (maxY + minY) / 2;
    
    for (let [colorIndex, faces] of facesByColor.entries()) {
        let color = data.colors[colorIndex];
        mesh.addPrimitive(
            createPrimitive(doc, color, getGeom({ vertices: data.vertices, faces, colors: data.colors })));
    }
    
    // Position the model
    const modelNode = doc.createNode().setMesh(mesh);
    
    // Add build plate if enabled (must be after model mesh is created)
    if (includeBuildPlate) {
        try {
            // Only reposition if we have valid bounds
            if (isFinite(minZ) && isFinite(centerX) && isFinite(centerY)) {
                modelNode.setTranslation([-centerX, -centerY, -minZ]); // Center XY and place bottom at Z=0
            }
            
            const { node: buildPlateNode } = createBuildPlateGrid(doc);
            scene.addChild(buildPlateNode);
        } catch (error) {
            console.error('Failed to add build plate:', error);
            // Continue without build plate
        }
    }
    
    scene.addChild(modelNode);

    const glb = await new NodeIO().registerExtensions([KHRLightsPunctual]).writeBinary(doc);
    return new Blob([glb as BlobPart], { type: 'model/gltf-binary' });
}
