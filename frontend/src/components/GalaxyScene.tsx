import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { CreatureProfile } from '../types/creature';
import {
  CreatureNodeData,
  createCreatureNodes,
} from './CreatureNode';
import { CameraController, setupCameraControls } from './CameraController';

interface GalaxySceneProps {
  creatures?: CreatureProfile[];
  onCreatureClick?: (creature: CreatureProfile) => void;
  onCreatureHover?: (creature: CreatureProfile | null) => void;
  className?: string;
}

const GalaxyScene: React.FC<GalaxySceneProps> = ({
  creatures = [],
  onCreatureClick,
  onCreatureHover,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const nodeDataRef = useRef<CreatureNodeData[]>([]);
  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster());
  const mouseRef = useRef<THREE.Vector2>(new THREE.Vector2());
  const cameraControllerRef = useRef<CameraController | null>(null);
  const [hoveredCreature, setHoveredCreature] = useState<string | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize Scene
    const scene = new THREE.Scene();
    
    // 创建渐变背景 - 从深蓝到紫黑
    const canvas = document.createElement('canvas');
    canvas.width = 2;
    canvas.height = 512;
    const context = canvas.getContext('2d');
    
    if (context) {
      const gradient = context.createLinearGradient(0, 0, 0, 512);
      gradient.addColorStop(0, '#020408'); // 几乎全黑，微微蓝
      gradient.addColorStop(0.3, '#030308'); // 几乎全黑
      gradient.addColorStop(0.6, '#020306'); // 几乎全黑
      gradient.addColorStop(1, '#010102'); // 纯黑
      
      context.fillStyle = gradient;
      context.fillRect(0, 0, 2, 512);
      
      const texture = new THREE.CanvasTexture(canvas);
      scene.background = texture;
    } else {
      scene.background = new THREE.Color(0x020408);
    }
    
    sceneRef.current = scene;

    // Initialize Camera
    const camera = new THREE.PerspectiveCamera(
      75, // Field of view
      containerRef.current.clientWidth / containerRef.current.clientHeight, // Aspect ratio
      0.1, // Near clipping plane
      1000 // Far clipping plane
    );
    camera.position.z = 50;
    camera.position.y = 20;
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Initialize Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });
    renderer.setSize(
      containerRef.current.clientWidth,
      containerRef.current.clientHeight
    );
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Optimize for performance
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 增强环境光，让生物更明亮
    const ambientLight = new THREE.AmbientLight(0x8b92a0, 1.2);
    scene.add(ambientLight);

    // 添加多个强点光源，突出生物
    const pointLight1 = new THREE.PointLight(0x4fd1c5, 2.5, 150);
    pointLight1.position.set(30, 30, 30);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xf687b3, 2.0, 150);
    pointLight2.position.set(-30, -20, 40);
    scene.add(pointLight2);

    const pointLight3 = new THREE.PointLight(0x667eea, 1.8, 150);
    pointLight3.position.set(0, 40, -30);
    scene.add(pointLight3);

    // 添加额外的顶部光源
    const topLight = new THREE.PointLight(0xffffff, 1.5, 200);
    topLight.position.set(0, 50, 0);
    scene.add(topLight);

    // 添加远景彩色星云背景
    createBackgroundNebula(scene);
    
    // Create Starfield Background
    createStarfield(scene);

    // Setup Camera Controls
    const cameraController = setupCameraControls(containerRef.current, camera);
    cameraControllerRef.current = cameraController;

    // Create Creature Nodes (will be updated when creatures change)
    if (creatures.length > 0) {
      const { mesh, nodeData } = createCreatureNodes(creatures);
      scene.add(mesh);
      nodeDataRef.current = nodeData;
    }

    // Mouse Move Handler for Hover Detection
    const handleMouseMove = (event: MouseEvent) => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    };

    // Click Handler
    const handleClick = (event: MouseEvent) => {
      if (!containerRef.current || !camera || !scene) return;

      // Don't trigger click if user was dragging
      if (cameraController.getIsDragging()) return;

      const rect = containerRef.current.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -((event.clientY - rect.top) / rect.height) * 2 + 1
      );

      raycasterRef.current.setFromCamera(mouse, camera);
      const creatureNodes = scene.getObjectByName('creatureNodes');
      
      if (creatureNodes && creatureNodes instanceof THREE.InstancedMesh) {
        const intersects = raycasterRef.current.intersectObject(creatureNodes);
        
        if (intersects.length > 0 && intersects[0].instanceId !== undefined) {
          const instanceId = intersects[0].instanceId;
          const nodeData = nodeDataRef.current[instanceId];
          
          if (nodeData && onCreatureClick) {
            onCreatureClick(nodeData.profile);
            // Focus camera on clicked creature
            cameraController.focusOn(nodeData.position, 15);
          }
        }
      }
    };

    containerRef.current.addEventListener('mousemove', handleMouseMove);
    containerRef.current.addEventListener('click', handleClick);

    // Animation Loop
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);

      // Slowly rotate the starfield for a subtle drift effect
      const starfield = scene.getObjectByName('starfield');
      if (starfield) {
        starfield.rotation.y += 0.0001;
        starfield.rotation.x += 0.00005;
      }

      // 银河带的缓慢旋转
      const galaxyBand = scene.getObjectByName('galaxyBand');
      if (galaxyBand) {
        galaxyBand.rotation.y += 0.0001;
        galaxyBand.rotation.z += 0.00005;
      }

      // 银河星云的流动旋转
      const nebula = scene.getObjectByName('nebula');
      if (nebula) {
        nebula.rotation.y += 0.00015;
        nebula.rotation.z += 0.00008;
      }

      // 添加生物脉动动画
      const creatureNodes = scene.getObjectByName('creatureNodes');
      if (creatureNodes && creatureNodes instanceof THREE.InstancedMesh) {
        const time = Date.now() * 0.001; // 时间（秒）
        const matrix = new THREE.Matrix4();
        const position = new THREE.Vector3();
        const quaternion = new THREE.Quaternion();
        const scale = new THREE.Vector3();

        nodeDataRef.current.forEach((nodeData, index) => {
          creatureNodes.getMatrixAt(index, matrix);
          matrix.decompose(position, quaternion, scale);

          // 脉动效果 - 根据情绪值调整频率
          const pulseFrequency = 1 + (nodeData.profile.emotionValue / 100) * 2;
          const pulseAmount = 0.1 + (nodeData.profile.emotionValue / 100) * 0.15;
          const pulse = Math.sin(time * pulseFrequency + index * 0.5) * pulseAmount + 1;

          // 缓慢旋转
          quaternion.multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0.01, 0)));

          // 应用脉动到缩放
          const baseScale = nodeData.visualState.size;
          scale.set(baseScale * pulse, baseScale * pulse, baseScale * pulse);

          matrix.compose(position, quaternion, scale);
          creatureNodes.setMatrixAt(index, matrix);
        });

        creatureNodes.instanceMatrix.needsUpdate = true;
      }

      // Update camera controller for smooth transitions
      if (cameraControllerRef.current) {
        cameraControllerRef.current.update();
      }

      // Check for hover interactions (only when not dragging)
      if (camera && scene && !cameraControllerRef.current?.getIsDragging()) {
        raycasterRef.current.setFromCamera(mouseRef.current, camera);
        const creatureNodes = scene.getObjectByName('creatureNodes');
        
        if (creatureNodes && creatureNodes instanceof THREE.InstancedMesh) {
          const intersects = raycasterRef.current.intersectObject(creatureNodes);
          
          if (intersects.length > 0 && intersects[0].instanceId !== undefined) {
            const instanceId = intersects[0].instanceId;
            const nodeData = nodeDataRef.current[instanceId];
            
            if (nodeData && hoveredCreature !== nodeData.id) {
              setHoveredCreature(nodeData.id);
              if (onCreatureHover) {
                onCreatureHover(nodeData.profile);
              }
              document.body.style.cursor = 'pointer';
            }
          } else if (hoveredCreature !== null) {
            setHoveredCreature(null);
            if (onCreatureHover) {
              onCreatureHover(null);
            }
            document.body.style.cursor = 'default';
          }
        }
      }

      renderer.render(scene, camera);
    };
    animate();

    // Handle Window Resize
    const handleResize = () => {
      if (!containerRef.current || !camera || !renderer) return;

      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();

      renderer.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      
      if (containerRef.current) {
        containerRef.current.removeEventListener('mousemove', handleMouseMove);
        containerRef.current.removeEventListener('click', handleClick);
      }

      document.body.style.cursor = 'default';

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      if (rendererRef.current && containerRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
        rendererRef.current.dispose();
      }

      if (sceneRef.current) {
        sceneRef.current.traverse((object) => {
          if (object instanceof THREE.Mesh || object instanceof THREE.InstancedMesh) {
            object.geometry.dispose();
            if (Array.isArray(object.material)) {
              object.material.forEach((material) => material.dispose());
            } else {
              object.material.dispose();
            }
          }
        });
      }
    };
  }, [creatures, onCreatureClick, onCreatureHover]);

  // Update creature nodes when creatures array changes
  useEffect(() => {
    if (!sceneRef.current || creatures.length === 0) return;

    // Remove old creature nodes
    const oldNodes = sceneRef.current.getObjectByName('creatureNodes');
    if (oldNodes) {
      sceneRef.current.remove(oldNodes);
      if (oldNodes instanceof THREE.InstancedMesh) {
        oldNodes.geometry.dispose();
        if (Array.isArray(oldNodes.material)) {
          oldNodes.material.forEach((m) => m.dispose());
        } else {
          oldNodes.material.dispose();
        }
      }
    }

    // Add new creature nodes
    const { mesh, nodeData } = createCreatureNodes(creatures);
    sceneRef.current.add(mesh);
    nodeDataRef.current = nodeData;
  }, [creatures]);

  return (
    <div
      ref={containerRef}
      className={`w-full h-full ${className}`}
      style={{ minHeight: '600px' }}
    />
  );
};

/**
 * Creates a starfield background with thousands of stars and galaxy nebula
 */
function createStarfield(scene: THREE.Scene): void {
  // 创建银河带粒子系统
  const galaxyBandCount = 5000;
  const galaxyBandGeometry = new THREE.BufferGeometry();
  const galaxyBandPositions = new Float32Array(galaxyBandCount * 3);
  const galaxyBandColors = new Float32Array(galaxyBandCount * 3);
  const galaxyBandSizes = new Float32Array(galaxyBandCount);

  // 银河带颜色渐变
  const galaxyColors = [
    new THREE.Color(0x1e3a8a), // 深蓝
    new THREE.Color(0x3b82f6), // 蓝色
    new THREE.Color(0x06b6d4), // 青色
    new THREE.Color(0x8b5cf6), // 紫色
    new THREE.Color(0xec4899), // 粉色
    new THREE.Color(0xf59e0b), // 橙色
  ];

  for (let i = 0; i < galaxyBandCount; i++) {
    const i3 = i * 3;
    
    // 创建一条穿过场景的银河带
    const t = i / galaxyBandCount;
    const angle = t * Math.PI * 3; // 螺旋角度
    
    // 银河带的主轴
    const mainRadius = 60 + Math.sin(t * Math.PI * 2) * 20;
    const bandWidth = 25; // 银河带宽度
    
    // 在银河带内随机分布
    const offsetRadius = (Math.random() - 0.5) * bandWidth;
    const offsetHeight = (Math.random() - 0.5) * 15;
    
    const finalRadius = mainRadius + offsetRadius;
    
    galaxyBandPositions[i3] = Math.cos(angle) * finalRadius;
    galaxyBandPositions[i3 + 1] = offsetHeight + Math.sin(angle * 0.5) * 10;
    galaxyBandPositions[i3 + 2] = Math.sin(angle) * finalRadius;

    // 根据位置选择颜色，创建渐变效果
    const colorIndex = Math.floor(t * (galaxyColors.length - 1));
    const colorT = (t * (galaxyColors.length - 1)) - colorIndex;
    const color1 = galaxyColors[colorIndex];
    const color2 = galaxyColors[Math.min(colorIndex + 1, galaxyColors.length - 1)];
    const finalColor = new THREE.Color().lerpColors(color1, color2, colorT);
    
    galaxyBandColors[i3] = finalColor.r;
    galaxyBandColors[i3 + 1] = finalColor.g;
    galaxyBandColors[i3 + 2] = finalColor.b;

    // 中心更亮，边缘更暗
    const distanceFromCenter = Math.abs(offsetRadius) / (bandWidth / 2);
    galaxyBandSizes[i] = (1 - distanceFromCenter * 0.5) * (Math.random() * 2 + 1);
  }

  galaxyBandGeometry.setAttribute('position', new THREE.BufferAttribute(galaxyBandPositions, 3));
  galaxyBandGeometry.setAttribute('color', new THREE.BufferAttribute(galaxyBandColors, 3));
  galaxyBandGeometry.setAttribute('size', new THREE.BufferAttribute(galaxyBandSizes, 1));

  const galaxyBandMaterial = new THREE.PointsMaterial({
    size: 2,
    vertexColors: true,
    transparent: true,
    opacity: 0.35, // 降低银河带亮度
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  const galaxyBand = new THREE.Points(galaxyBandGeometry, galaxyBandMaterial);
  galaxyBand.name = 'galaxyBand';
  scene.add(galaxyBand);

  // 添加小的星云粒子点缀
  const nebulaCount = 1500;
  const nebulaGeometry = new THREE.BufferGeometry();
  const nebulaPositions = new Float32Array(nebulaCount * 3);
  const nebulaColors = new Float32Array(nebulaCount * 3);
  const nebulaSizes = new Float32Array(nebulaCount);

  for (let i = 0; i < nebulaCount; i++) {
    const i3 = i * 3;
    
    // 沿着螺旋分布
    const angle = (i / nebulaCount) * Math.PI * 6;
    const radius = 40 + Math.random() * 60;
    const spread = (Math.random() - 0.5) * 25;
    
    nebulaPositions[i3] = Math.cos(angle) * radius + (Math.random() - 0.5) * 15;
    nebulaPositions[i3 + 1] = spread + Math.sin(angle * 0.5) * 15;
    nebulaPositions[i3 + 2] = Math.sin(angle) * radius + (Math.random() - 0.5) * 15;

    const color = galaxyColors[Math.floor(Math.random() * galaxyColors.length)];
    nebulaColors[i3] = color.r;
    nebulaColors[i3 + 1] = color.g;
    nebulaColors[i3 + 2] = color.b;

    nebulaSizes[i] = Math.random() * 2 + 0.5;
  }

  nebulaGeometry.setAttribute('position', new THREE.BufferAttribute(nebulaPositions, 3));
  nebulaGeometry.setAttribute('color', new THREE.BufferAttribute(nebulaColors, 3));
  nebulaGeometry.setAttribute('size', new THREE.BufferAttribute(nebulaSizes, 1));

  const nebulaMaterial = new THREE.PointsMaterial({
    size: 1.5,
    vertexColors: true,
    transparent: true,
    opacity: 0.3, // 降低星云亮度
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  const nebula = new THREE.Points(nebulaGeometry, nebulaMaterial);
  nebula.name = 'nebula';
  scene.add(nebula);

  const starGeometry = new THREE.BufferGeometry();
  const starCount = 6000;
  const positions = new Float32Array(starCount * 3);
  const colors = new Float32Array(starCount * 3);
  const sizes = new Float32Array(starCount);

  // Generate random star positions and properties
  for (let i = 0; i < starCount; i++) {
    const i3 = i * 3;

    // Position stars in a sphere around the origin
    const radius = 200 + Math.random() * 300;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);

    positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    positions[i3 + 2] = radius * Math.cos(phi);

    // 纯白色到蓝白色的星星
    const colorVariation = 0.85 + Math.random() * 0.15;
    colors[i3] = colorVariation; // R
    colors[i3 + 1] = colorVariation; // G
    colors[i3 + 2] = 1.0; // B (slightly blue-tinted)

    // Vary star sizes
    sizes[i] = Math.random() * 2 + 0.5;
  }

  starGeometry.setAttribute(
    'position',
    new THREE.BufferAttribute(positions, 3)
  );
  starGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  starGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

  // Create star material with glow effect
  const starMaterial = new THREE.PointsMaterial({
    size: 2.0, // 更大的星星
    vertexColors: true,
    transparent: true,
    opacity: 0.9, // 更不透明
    sizeAttenuation: true,
    blending: THREE.AdditiveBlending, // 发光混合模式
    depthWrite: false, // 避免深度冲突
  });

  const starfield = new THREE.Points(starGeometry, starMaterial);
  starfield.name = 'starfield';
  scene.add(starfield);
}

/**
 * Creates background nebula clouds for atmosphere
 */
function createBackgroundNebula(scene: THREE.Scene): void {
  const nebulaColors = [
    { color: 0x1e3a8a, position: new THREE.Vector3(-150, 80, -200) },   // 深蓝
    { color: 0x7c3aed, position: new THREE.Vector3(120, -60, -180) },   // 紫色
    { color: 0x0e7490, position: new THREE.Vector3(-80, -100, -220) },  // 深青
    { color: 0x4c1d95, position: new THREE.Vector3(180, 50, -190) },    // 深紫
  ];

  nebulaColors.forEach((nebula, index) => {
    const geometry = new THREE.SphereGeometry(60, 32, 32);
    const material = new THREE.MeshBasicMaterial({
      color: nebula.color,
      transparent: true,
      opacity: 0.02, // 极低不透明度，几乎看不见
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(nebula.position);
    mesh.name = `backgroundNebula${index}`;
    scene.add(mesh);
  });
}

export default GalaxyScene;
