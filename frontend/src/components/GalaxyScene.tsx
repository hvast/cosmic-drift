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
    scene.background = new THREE.Color(0x000510); // Deep space blue-black
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

    // Add Ambient Light
    const ambientLight = new THREE.AmbientLight(0x404040, 0.5); // Soft white light
    scene.add(ambientLight);

    // Add Directional Light (simulating distant starlight)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.3);
    directionalLight.position.set(10, 10, 10);
    scene.add(directionalLight);

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

      // Update camera controller for smooth transitions
      if (cameraControllerRef.current) {
        cameraControllerRef.current.update();
      }

      // Check for hover interactions
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
  }, [creatures, onCreatureClick, onCreatureHover, hoveredCreature]);

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
 * Creates a starfield background with thousands of stars
 */
function createStarfield(scene: THREE.Scene): void {
  const starGeometry = new THREE.BufferGeometry();
  const starCount = 5000;
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

    // Vary star colors (white to blue-white)
    const colorVariation = 0.8 + Math.random() * 0.2;
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

  // Create star material with custom shader for better performance
  const starMaterial = new THREE.PointsMaterial({
    size: 1.5,
    vertexColors: true,
    transparent: true,
    opacity: 0.8,
    sizeAttenuation: true,
    blending: THREE.AdditiveBlending, // Makes stars glow
  });

  const starfield = new THREE.Points(starGeometry, starMaterial);
  starfield.name = 'starfield';
  scene.add(starfield);
}

export default GalaxyScene;
