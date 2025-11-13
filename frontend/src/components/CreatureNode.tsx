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
    // 亮蓝到亮紫 - 冷静/孤独
    const t = emotionValue / 20;
    return new THREE.Color().lerpColors(
      new THREE.Color(0x3b82f6), // 亮蓝
      new THREE.Color(0xa855f7), // 亮紫
      t
    );
  } else if (emotionValue <= 40) {
    // 亮紫到亮青 - 好奇/探索
    const t = (emotionValue - 20) / 20;
    return new THREE.Color().lerpColors(
      new THREE.Color(0xa855f7), // 亮紫
      new THREE.Color(0x22d3ee), // 亮青
      t
    );
  } else if (emotionValue <= 60) {
    // 亮青到亮绿 - 平和/成长
    const t = (emotionValue - 40) / 20;
    return new THREE.Color().lerpColors(
      new THREE.Color(0x22d3ee), // 亮青
      new THREE.Color(0x34d399), // 亮绿
      t
    );
  } else if (emotionValue <= 80) {
    // 亮绿到亮黄 - 活跃/兴奋
    const t = (emotionValue - 60) / 20;
    return new THREE.Color().lerpColors(
      new THREE.Color(0x34d399), // 亮绿
      new THREE.Color(0xfde047), // 亮黄
      t
    );
  } else {
    // 亮黄到亮粉 - 热情/连接
    const t = (emotionValue - 80) / 20;
    return new THREE.Color().lerpColors(
      new THREE.Color(0xfde047), // 亮黄
      new THREE.Color(0xfb7185), // 亮粉红
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
  // 创建生物组
  const group = new THREE.Group();
  group.name = 'creatureNodes';

  // 使用球体，更细腻的分段数让表面更光滑
  const geometry = new THREE.SphereGeometry(1, 32, 32);
  
  // 创建实心球材质 - 明亮且有自发光
  const material = new THREE.MeshStandardMaterial({
    color: new THREE.Color(0xffffff), // 会被实例颜色覆盖
    emissive: new THREE.Color(0x222222), // 轻微的自发光，让生物在暗处可见
    emissiveIntensity: 1.5, // 适度发光
    metalness: 0.4,
    roughness: 0.4,
    transparent: false,
    side: THREE.FrontSide,
  });

  const mesh = new THREE.InstancedMesh(geometry, material, creatures.length);
  mesh.name = 'creatureNodesMesh';
  
  // 创建柔和模糊光晕纹理
  const createGlowTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
      gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
      gradient.addColorStop(0.1, 'rgba(255, 255, 255, 0.8)');
      gradient.addColorStop(0.3, 'rgba(255, 255, 255, 0.4)');
      gradient.addColorStop(0.6, 'rgba(255, 255, 255, 0.1)');
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 128, 128);
    }
    return new THREE.CanvasTexture(canvas);
  };
  
  // 使用粒子系统创建柔和光晕
  const glowGeometry = new THREE.BufferGeometry();
  const glowPositions = new Float32Array(creatures.length * 3);
  const glowColors = new Float32Array(creatures.length * 3);
  const glowSizes = new Float32Array(creatures.length);
  
  const glowMaterial = new THREE.PointsMaterial({
    size: 25, // 更大的光晕
    vertexColors: true,
    transparent: true,
    opacity: 0.6, // 增强光晕亮度
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    sizeAttenuation: true,
    map: createGlowTexture(),
  });
  
  glowGeometry.setAttribute('position', new THREE.BufferAttribute(glowPositions, 3));
  glowGeometry.setAttribute('color', new THREE.BufferAttribute(glowColors, 3));
  glowGeometry.setAttribute('size', new THREE.BufferAttribute(glowSizes, 1));
  
  const glowMesh = new THREE.Points(glowGeometry, glowMaterial);
  glowMesh.name = 'creatureNodesGlow';

  const nodeData: CreatureNodeData[] = [];
  const matrix = new THREE.Matrix4();
  const quaternion = new THREE.Quaternion();

  creatures.forEach((creature, index) => {
    const position = generateNodePosition(index, creatures.length);
    const nodeColor = getColorFromEmotion(creature.emotionValue);
    const glowIntensity = getGlowIntensity(creature.emotionValue);
    
    // 根据情绪值调整大小 - 更大更显眼
    const sizeMultiplier = 1.5 + (creature.emotionValue / 100) * 1.0;
    
    // 随机旋转，让每个生物看起来不同
    quaternion.setFromEuler(new THREE.Euler(
      Math.random() * Math.PI,
      Math.random() * Math.PI,
      Math.random() * Math.PI
    ));
    
    // 设置主体球的变换
    matrix.compose(position, quaternion, new THREE.Vector3(sizeMultiplier, sizeMultiplier, sizeMultiplier));
    mesh.setMatrixAt(index, matrix);
    mesh.setColorAt(index, nodeColor);
    
    // 设置光晕粒子的位置和颜色
    const i3 = index * 3;
    glowPositions[i3] = position.x;
    glowPositions[i3 + 1] = position.y;
    glowPositions[i3 + 2] = position.z;
    
    glowColors[i3] = nodeColor.r;
    glowColors[i3 + 1] = nodeColor.g;
    glowColors[i3 + 2] = nodeColor.b;
    
    // 光晕大小根据生物大小和情绪值调整（更大更模糊）
    glowSizes[index] = sizeMultiplier * 8 * (0.8 + glowIntensity * 0.4);
    
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
  
  glowGeometry.attributes.position.needsUpdate = true;
  glowGeometry.attributes.color.needsUpdate = true;
  glowGeometry.attributes.size.needsUpdate = true;

  // 将主体和光晕添加到组中
  group.add(mesh);
  group.add(glowMesh);

  return { mesh: group as any, nodeData };
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
