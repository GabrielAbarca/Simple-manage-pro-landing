// The stacked database (pedestal + three clearcoat disks with LEDs), its
// orbit ring, and the padlock that circles it. From Home.dc.html initPilot.

import * as THREE from "three";
import { drawRadial } from "../../core/canvas2d";
import { homeSlab } from "../../core/geometry";

export const DISK = { radius: 1.55, height: 0.58 } as const;
export const ORBIT = { radiusX: 3.0, radiusZ: 2.35, centerY: 1.05 } as const;

/** A rounded-edge cylinder: a lathe profile with quarter-circle corners. */
function roundedDiskGeometry(radius: number, height: number, corner: number): THREE.LatheGeometry {
  const points = [new THREE.Vector2(0, -height / 2)];
  for (let a = 0; a <= 8; a++) {
    const t = -Math.PI / 2 + (a / 8) * (Math.PI / 2);
    points.push(new THREE.Vector2(radius - corner + Math.cos(t) * corner, -height / 2 + corner + Math.sin(t) * corner));
  }
  for (let a = 0; a <= 8; a++) {
    const t = (a / 8) * (Math.PI / 2);
    points.push(new THREE.Vector2(radius - corner + Math.cos(t) * corner, height / 2 - corner + Math.sin(t) * corner));
  }
  points.push(new THREE.Vector2(0, height / 2));
  return new THREE.LatheGeometry(points, 96);
}

const clearcoatWhite = () =>
  new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.42, clearcoat: 0.7, clearcoatRoughness: 0.2, envMapIntensity: 0.85 });

function buildDisk(index: number, geometry: THREE.BufferGeometry, material: THREE.Material): THREE.Group {
  const disk = new THREE.Group();
  disk.add(new THREE.Mesh(geometry, material));
  const ledGeometry = new THREE.SphereGeometry(0.07, 16, 12);
  [0, 0.35].forEach((offset, n) => {
    const angle = index * 0.9 + offset;
    const led = new THREE.Mesh(ledGeometry, new THREE.MeshBasicMaterial({ color: n ? 0xffffff : 0x41f1b6 }));
    led.position.set(Math.sin(angle) * (DISK.radius - 0.02), 0.05, Math.cos(angle) * (DISK.radius - 0.02));
    disk.add(led);
  });
  return disk;
}

function buildShackle(): THREE.Group {
  const metal = new THREE.MeshPhysicalMaterial({ color: 0xd9ddf2, metalness: 0.95, roughness: 0.22, envMapIntensity: 1.2 });
  const shackle = new THREE.Group();
  const arc = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.075, 20, 48, Math.PI), metal);
  arc.position.y = 0.78;
  shackle.add(arc);
  [-0.34, 0.34].forEach((x) => {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.36, 20), metal);
    leg.position.set(x, 0.6, 0);
    shackle.add(leg);
  });
  return shackle;
}

function buildLock(white: THREE.Material): { lock: THREE.Group; shackle: THREE.Group } {
  const lock = new THREE.Group();
  const inner = new THREE.Group();
  lock.add(inner);
  inner.add(homeSlab(1.15, 0.95, 0.22, 0.42, white, null, 0.06));
  const dark = new THREE.MeshPhysicalMaterial({ color: 0x363949, roughness: 0.5 });
  const keyholeTop = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.04, 32), dark);
  keyholeTop.rotation.x = Math.PI / 2;
  keyholeTop.position.set(0, 0.06, 0.28);
  const keyholeSlot = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.2, 0.04), dark);
  keyholeSlot.position.set(0, -0.08, 0.28);
  const shackle = buildShackle();
  inner.add(keyholeTop, keyholeSlot, shackle);
  return { lock, shackle };
}

export interface DatabaseScene {
  root: THREE.Group;
  spin: THREE.Group;
  disks: THREE.Group[];
  ring: THREE.Mesh<THREE.TorusGeometry, THREE.MeshBasicMaterial>;
  lock: THREE.Group;
  shackle: THREE.Group;
  lockShadow: THREE.Mesh;
}

export function buildDatabase(): DatabaseScene {
  const white = clearcoatWhite();
  const shadowMaterial = new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(drawRadial()), transparent: true, depthWrite: false });
  const root = new THREE.Group();
  const pedestal = new THREE.Mesh(roundedDiskGeometry(2.3, 0.2, 0.09), white);
  pedestal.position.y = -0.1;
  const groundShadow = new THREE.Mesh(new THREE.PlaneGeometry(7, 7), shadowMaterial);
  groundShadow.rotation.x = -Math.PI / 2;
  groundShadow.position.y = -0.21;
  const spin = new THREE.Group();
  root.add(pedestal, groundShadow, spin);
  const diskGeometry = roundedDiskGeometry(DISK.radius, DISK.height, 0.18);
  const disks = [0x5a69e9, 0x7380ec, 0xa78bfa].map((color, j) => {
    const material = new THREE.MeshPhysicalMaterial({ color, roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.16, envMapIntensity: 0.9 });
    const disk = buildDisk(j, diskGeometry, material);
    spin.add(disk);
    return disk;
  });
  const ring = new THREE.Mesh(new THREE.TorusGeometry(1, 0.008, 8, 160), new THREE.MeshBasicMaterial({ color: 0x7380ec, transparent: true, opacity: 0.45 }));
  ring.rotation.x = Math.PI / 2;
  ring.scale.set(ORBIT.radiusX, ORBIT.radiusZ, 1);
  ring.position.y = ORBIT.centerY;
  const { lock, shackle } = buildLock(white);
  const lockShadow = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 2.2), shadowMaterial);
  lockShadow.rotation.x = -Math.PI / 2;
  root.add(ring, lock, lockShadow);
  return { root, spin, disks, ring, lock, shackle, lockShadow };
}
