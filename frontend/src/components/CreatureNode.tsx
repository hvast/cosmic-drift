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
 * 更丰富绚丽的颜色渐变
 */
export function getColorFromEmotion(emotionValue: number): THREE.Color {
  if (emotionValue <= 20) {
    // 深蓝到紫色 - 冷静/孤独
    const t = emotionValue / 20;
    return new THREE.Color().lerpColors(
      new THREE.Color(0x1e3a8a), // 深蓝
      new THREE.Color(0x7c3aed), // 紫色
      t
    );
  } else if (emotionValue <= 40) {
    // 紫色到青色 - 好奇/探索
    const t = (emotionValue - 20) / 20;
    return new THREE.Color().lerpColors(
      new THREE.Color(0x7c3aed), // 紫色
      new THREE.Color(0x06b6d4), // 青色
      t
    );
  } else if (emotionValue <= 60) {
    // 青色到绿色 - 平和/成长
    const t = (emotionValue - 40) / 20;
    return new THREE.Color().lerpColors(
      new THREE.Color(0x06b6d4), // 青色
      new THREE.Color(0x10b981), // 绿色
      t
    );
  } else if (emotionValue <= 80) {
    // 绿色到黄色 - 活跃/兴奋
    const t = (emotionValue - 60) / 20;
    return new THREE.Color().lerpColors(
      new THREE.Color(0x10b981), // 绿色
      new THREE.Color(0xfbbf24), // 黄色
      t
    );
  } else {
    // 黄色到粉红 - 热情/连接
    const t = (emotionValue - 80) / 20;
    return new THREE.Color().lerpColors(
      new THREE.Color(0xfbbf24), // 黄色
      new THREE.Color(0xf472b6), // 粉红
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
  // 使用球体，更细腻的分段数让表面更光滑
  const geometry = new THREE.SphereGeometry(1, 32, 32);
  
  // 创建强发光材质 - 让生物更突出
  const material = new THREE.MeshStandardMaterial({
    emissive: new THREE.Color(0x4fd1c5),
    emissiveIntensity: 2.5, // 大幅增强发光强度
    metalness: 0.1,
    roughness: 0.2,
    transparent: true,
    opacity: 0.95, // 更不透明
    side: THREE.FrontSide,
  });

  const mesh = new THREE.InstancedMesh(geometry, material, creatures.length);
  mesh.name = 'creatureNodes';

  const nodeData: CreatureNodeData[] = [];
  const matrix = new THREE.Matrix4();
  const quaternion = new THREE.Quaternion();

  creatures.forEach((creature, index) => {
    const position = generateNodePosition(index, creatures.length);
    const nodeColor = getColorFromEmotion(creature.emotionValue);
    const glowIntensity = getGlowIntensity(creature.emotionValue);
    
    // 根据情绪值调整大小 - 增大生物尺寸
    const sizeMultiplier = 1.2 + (creature.emotionValue / 100) * 0.8;
    
    // 随机旋转，让每个生物看起来不同
    quaternion.setFromEuler(new THREE.Euler(
      Math.random() * Math.PI,
      Math.random() * Math.PI,
      Math.random() * Math.PI
    ));
    
    // Set instance transform with rotation and scale
    matrix.compose(position, quaternion, new THREE.Vector3(sizeMultiplier, sizeMultiplier, sizeMultiplier));
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
        size: sizeMultiplier,
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
