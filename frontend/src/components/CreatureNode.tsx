import * as THREE from 'three';
import { CreatureProfile } from '../types/creature';

/**
 * Represents a single creature node in the galaxy
 */
export interface CreatureNodeData {
  id: string;
  position: THREE.Vector3;
  profile: CreatureProfile;
  visualState: {
    color: string;
    size: number;
    glowIntensity: number;
  };
}

/**
 * Calculate node color based on emotion value
 * Low emotion (0-30): Cool colors (blue, purple)
 * Medium emotion (31-70): Neutral colors (cyan, teal)
 * High emotion (71-100): Warm colors (pink, orange)
 */
export function getColorFromEmotion(emotionValue: number): THREE.Color {
  if (emotionValue <= 30) {
    // Cold/distant - blue to purple
    const t = emotionValue / 30;
    return new THREE.Color().lerpColors(
      new THREE.Color(0x4a5568), // Dark gray-blue
      new THREE.Color(0x667eea), // Purple-blue
      t
    );
  } else if (emotionValue <= 70) {
    // Neutral/curious - cyan to teal
    const t = (emotionValue - 30) / 40;
    return new THREE.Color().lerpColors(
      new THREE.Color(0x4fd1c5), // Cyan
      new THREE.Color(0x38b2ac), // Teal
      t
    );
  } else {
    // Warm/connected - pink to orange
    const t = (emotionValue - 70) / 30;
    return new THREE.Color().lerpColors(
      new THREE.Color(0xf687b3), // Pink
      new THREE.Color(0xf6ad55), // Orange
      t
    );
  }
}

/**
 * Calculate glow intensity based on emotion value
 */
export function getGlowIntensity(emotionValue: number): number {
  // Higher emotion = stronger glow
  return 0.3 + (emotionValue / 100) * 0.7;
}

/**
 * Generate creature node positions in a spherical distribution
 */
export function generateNodePosition(index: number, total: number): THREE.Vector3 {
  // Use golden ratio for even distribution on sphere
  const phi = Math.acos(1 - 2 * (index + 0.5) / total);
  const theta = Math.PI * (1 + Math.sqrt(5)) * index;
  
  const radius = 30 + Math.random() * 20; // Vary radius for depth
  
  return new THREE.Vector3(
    radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.sin(phi) * Math.sin(theta),
    radius * Math.cos(phi)
  );
}

/**
 * Create instanced mesh for creature nodes
 * Uses instanced rendering for optimal performance with many nodes
 */
export function createCreatureNodes(
  creatures: CreatureProfile[]
): {
  mesh: THREE.InstancedMesh;
  nodeData: CreatureNodeData[];
} {
  const geometry = new THREE.SphereGeometry(0.5, 16, 16);
  
  // Create material with emissive properties for glow effect
  const material = new THREE.MeshStandardMaterial({
    emissive: new THREE.Color(0x4fd1c5),
    emissiveIntensity: 0.5,
    metalness: 0.3,
    roughness: 0.7,
  });

  const mesh = new THREE.InstancedMesh(geometry, material, creatures.length);
  mesh.name = 'creatureNodes';

  const nodeData: CreatureNodeData[] = [];
  const matrix = new THREE.Matrix4();

  creatures.forEach((creature, index) => {
    const position = generateNodePosition(index, creatures.length);
    const nodeColor = getColorFromEmotion(creature.emotionValue);
    const glowIntensity = getGlowIntensity(creature.emotionValue);
    
    // Set instance transform
    matrix.setPosition(position);
    mesh.setMatrixAt(index, matrix);
    
    // Set instance color
    mesh.setColorAt(index, nodeColor);
    
    // Store node data for interaction
    nodeData.push({
      id: creature.id,
      position,
      profile: creature,
      visualState: {
        color: `#${nodeColor.getHexString()}`,
        size: 0.5,
        glowIntensity,
      },
    });
  });

  mesh.instanceMatrix.needsUpdate = true;
  if (mesh.instanceColor) {
    mesh.instanceColor.needsUpdate = true;
  }

  return { mesh, nodeData };
}

/**
 * Update creature node visual state (for emotion changes)
 */
export function updateNodeVisuals(
  mesh: THREE.InstancedMesh,
  nodeData: CreatureNodeData[],
  updatedCreature: CreatureProfile
): void {
  const index = nodeData.findIndex((node) => node.id === updatedCreature.id);
  if (index === -1) return;

  const nodeColor = getColorFromEmotion(updatedCreature.emotionValue);
  const glowIntensity = getGlowIntensity(updatedCreature.emotionValue);

  mesh.setColorAt(index, nodeColor);
  
  nodeData[index].profile = updatedCreature;
  nodeData[index].visualState = {
    color: `#${nodeColor.getHexString()}`,
    size: 0.5,
    glowIntensity,
  };

  if (mesh.instanceColor) {
    mesh.instanceColor.needsUpdate = true;
  }
}
