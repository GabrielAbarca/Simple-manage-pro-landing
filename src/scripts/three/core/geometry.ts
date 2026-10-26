// Ports of `rrShape` and the two `slab` builders from design_handoff_smp_landing/
// design/desktop/{Home,Producto}.dc.html. Home and Producto each define their own
// `slab` with different segment counts and face rules, so both are exported under
// distinct names rather than merged. Constants must not be "tidied".

import * as THREE from "three";

/** Port of `rrShape`: centred on the origin, quadratic corners. */
export function roundedRectShape(width: number, height: number, radius: number): THREE.Shape {
  const shape = new THREE.Shape();
  const x0 = -width / 2;
  const y0 = -height / 2;
  shape.moveTo(x0 + radius, y0);
  shape.lineTo(x0 + width - radius, y0);
  shape.quadraticCurveTo(x0 + width, y0, x0 + width, y0 + radius);
  shape.lineTo(x0 + width, y0 + height - radius);
  shape.quadraticCurveTo(x0 + width, y0 + height, x0 + width - radius, y0 + height);
  shape.lineTo(x0 + radius, y0 + height);
  shape.quadraticCurveTo(x0, y0 + height, x0, y0 + height - radius);
  shape.lineTo(x0, y0 + radius);
  shape.quadraticCurveTo(x0, y0, x0 + radius, y0);
  return shape;
}

// ShapeGeometry's default UVs are the raw shape coordinates; the canvas
// textures need the face mapped 0..1 across its own width and height.
function mapUvsToBounds(geometry: THREE.ShapeGeometry, width: number, height: number): void {
  const positions = geometry.attributes.position;
  const uvs = geometry.attributes.uv;
  for (let i = 0; i < positions.count; i++) {
    uvs.setXY(i, (positions.getX(i) + width / 2) / width, (positions.getY(i) + height / 2) / height);
  }
}

function extrudedBody(
  shape: THREE.Shape,
  depth: number,
  bevel: number,
  bevelSegments: number,
  curveSegments: number,
): THREE.ExtrudeGeometry {
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments,
    curveSegments,
  });
  geometry.translate(0, 0, -depth / 2);
  return geometry;
}

/** Port of Home's `slab`: 5 bevel / 24 curve segments, optional full-size face. */
export function homeSlab(
  width: number,
  height: number,
  radius: number,
  depth: number,
  bodyMaterial: THREE.Material,
  faceMaterial: THREE.Material | null,
  bevel: number,
): THREE.Group {
  const shape = roundedRectShape(width, height, radius);
  const group = new THREE.Group();
  group.add(new THREE.Mesh(extrudedBody(shape, depth, bevel, 5, 24), bodyMaterial));
  if (!faceMaterial) return group;
  const faceGeometry = new THREE.ShapeGeometry(shape, 24);
  mapUvsToBounds(faceGeometry, width, height);
  const face = new THREE.Mesh(faceGeometry, faceMaterial);
  face.position.z = depth / 2 + bevel + 0.004;
  group.add(face);
  return group;
}

/** Port of Producto's `slab`: 4 bevel / 20 curve segments, required face shrunk by `inset`. */
export function productoSlab(
  width: number,
  height: number,
  radius: number,
  depth: number,
  bodyMaterial: THREE.Material,
  faceMaterial: THREE.Material,
  bevel: number,
  inset = 0,
): THREE.Group {
  const group = new THREE.Group();
  group.add(new THREE.Mesh(extrudedBody(roundedRectShape(width, height, radius), depth, bevel, 4, 20), bodyMaterial));
  const faceWidth = width - 2 * inset;
  const faceHeight = height - 2 * inset;
  const faceGeometry = new THREE.ShapeGeometry(
    roundedRectShape(faceWidth, faceHeight, Math.max(0.02, radius - inset)),
    20,
  );
  mapUvsToBounds(faceGeometry, faceWidth, faceHeight);
  const face = new THREE.Mesh(faceGeometry, faceMaterial);
  face.position.z = depth / 2 + bevel + 0.004;
  group.add(face);
  return group;
}
