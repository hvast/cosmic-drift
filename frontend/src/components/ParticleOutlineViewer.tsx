import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface Vector2 {
  x: number;
  y: number;
}

interface ParticleOutlineViewerProps {
  contourPoints: Vector2[];
  color: string;
  emotionValue: number;
  width?: number;
  height?: number;
}

interface AnimationParams {
  breatheSpeed: number;
  breatheAmplitude: number;
  flowSpeed: number;
  flowAmplitude: number;
  depthWaveSpeed: number;
  depthWaveAmplitude: number;
  pulsateSpeed: number;
  pulsateAmplitude: number;
  rotationSpeed: number;
}

/**
 * ParticleOutlineViewer - Renders a 3D particle animation based on creature contours
 * OPTIMIZED VERSION with better visual effects
 */
const ParticleOutlineViewer: React.FC<ParticleOutlineViewerProps> = ({
  contourPoints,
  color,
  emotionValue,
  width = 400,
  height = 400,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const particleSystemRef = useRef<THREE.Points | null>(null);
  const animationIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!containerRef.current || contourPoints.length === 0) return;

    // Initialize Three.js scene
    const scene = new THREE.Scene();
    scene.background = null; // Transparent background
    sceneRef.current = scene;

    // Initialize camera with better perspective
    const camera = new THREE.PerspectiveCamera(
      45,
      width / height,
      0.1,
      1000
    );
    camera.position.z = 6; // Moved back for better view
    cameraRef.current = camera;

    // Initialize renderer with better settings
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      premultipliedAlpha: false,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Limit to 2x for performance
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Create particle texture with glow effect
    const particleTexture = createGlowParticleTexture();

    // Add ambient light for better visibility
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    // Add point light for depth
    const pointLight = new THREE.PointLight(color, 1, 100);
    pointLight.position.set(0, 0, 5);
    scene.add(pointLight);

    // Create particle system with optimized settings
    const particleSystem = createParticleSystem(
      contourPoints,
      color,
      emotionValue,
      particleTexture
    );
    scene.add(particleSystem);
    particleSystemRef.current = particleSystem;

    // Calculate animation parameters based on emotion value
    const animParams = calculateAnimationParams(emotionValue);

    // Store original positions and sizes for animation
    const positionAttr = particleSystem.geometry.attributes.position as THREE.BufferAttribute;
    const sizeAttr = particleSystem.geometry.attributes.size as THREE.BufferAttribute;

    const originalPositions = new Float32Array(positionAttr.array);
    const originalSizes = new Float32Array(sizeAttr.array);

    // Animation loop with optimized effects
    let startTime = Date.now();
    const animate = () => {
      const elapsed = (Date.now() - startTime) / 1000;

      const positions = positionAttr.array as Float32Array;
      const sizes = sizeAttr.array as Float32Array;
      const numParticles = positions.length / 3;

      // Gentle rotation for dynamic feel
      particleSystem.rotation.z = Math.sin(elapsed * animParams.rotationSpeed) * 0.1;

      for (let i = 0; i < numParticles; i++) {
        const i3 = i * 3;
        const t = i / numParticles; // Normalized position along contour

        // 1. Breathing effect - overall scale pulsation
        const breathe = 1 + Math.sin(elapsed * animParams.breatheSpeed + t * Math.PI * 2) * animParams.breatheAmplitude;

        // 2. Flow effect - particles move along contour creating wave motion
        const flowPhase = (elapsed * animParams.flowSpeed + t) % 1;
        const flowWave = Math.sin(flowPhase * Math.PI * 2) * animParams.flowAmplitude;

        // Calculate tangent direction for flow
        const nextIdx = ((i + 1) % numParticles) * 3;
        const tangentX = originalPositions[nextIdx] - originalPositions[i3];
        const tangentY = originalPositions[nextIdx + 1] - originalPositions[i3 + 1];
        const tangentLength = Math.sqrt(tangentX * tangentX + tangentY * tangentY) || 1;
        const normalizedTangentX = tangentX / tangentLength;
        const normalizedTangentY = tangentY / tangentLength;

        // 3. Depth wave effect - Z axis variation creating 3D depth
        const depthPhase = elapsed * animParams.depthWaveSpeed + t * Math.PI * 4;
        const depthWave = Math.sin(depthPhase) * Math.cos(depthPhase * 0.5) * animParams.depthWaveAmplitude;

        // 4. Spiral effect - slight rotation around center
        const spiralAngle = t * Math.PI * 2 + elapsed * animParams.flowSpeed * 0.5;
        const spiralRadius = 0.05 * Math.sin(elapsed * 2 + t * Math.PI * 4);
        const spiralX = Math.cos(spiralAngle) * spiralRadius;
        const spiralY = Math.sin(spiralAngle) * spiralRadius;

        // Apply all effects
        positions[i3] = originalPositions[i3] * breathe
                       + normalizedTangentX * flowWave
                       + spiralX;
        positions[i3 + 1] = originalPositions[i3 + 1] * breathe
                           + normalizedTangentY * flowWave
                           + spiralY;
        positions[i3 + 2] = depthWave;

        // 5. Pulsate effect - particle size variation with multiple frequencies
        const pulsate1 = Math.sin(elapsed * animParams.pulsateSpeed + t * Math.PI * 4);
        const pulsate2 = Math.sin(elapsed * animParams.pulsateSpeed * 1.5 + t * Math.PI * 8);
        const pulsate = 1 + (pulsate1 * 0.3 + pulsate2 * 0.15) * animParams.pulsateAmplitude;
        sizes[i] = originalSizes[i] * pulsate;
      }

      positionAttr.needsUpdate = true;
      sizeAttr.needsUpdate = true;

      renderer.render(scene, camera);
      animationIdRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      // Cleanup
      if (animationIdRef.current !== null) {
        cancelAnimationFrame(animationIdRef.current);
        animationIdRef.current = null;
      }

      if (particleSystemRef.current) {
        if (particleSystemRef.current.geometry) {
          particleSystemRef.current.geometry.dispose();
        }
        if (particleSystemRef.current.material) {
          if (Array.isArray(particleSystemRef.current.material)) {
            particleSystemRef.current.material.forEach(mat => mat.dispose());
          } else {
            particleSystemRef.current.material.dispose();
          }
        }
        particleSystemRef.current = null;
      }

      if (particleTexture) {
        particleTexture.dispose();
      }

      if (rendererRef.current) {
        rendererRef.current.dispose();
        if (containerRef.current && rendererRef.current.domElement.parentNode === containerRef.current) {
          containerRef.current.removeChild(rendererRef.current.domElement);
        }
        rendererRef.current = null;
      }

      if (sceneRef.current) {
        sceneRef.current.clear();
        sceneRef.current = null;
      }

      cameraRef.current = null;
    };
  }, [contourPoints, color, emotionValue, width, height]);

  // Calculate animation parameters based on emotion value (0-100)
  const calculateAnimationParams = (emotionValue: number): AnimationParams => {
    const t = emotionValue / 100; // Normalize to 0-1

    return {
      // Breathing: slower and subtler for calm, faster for excited
      breatheSpeed: 0.8 + t * 1.5,
      breatheAmplitude: 0.05 + t * 0.10,

      // Flow: gentle wave motion along contour
      flowSpeed: 0.5 + t * 1.2,
      flowAmplitude: 0.10 + t * 0.20,

      // Depth wave: 3D effect
      depthWaveSpeed: 1.0 + t * 2.0,
      depthWaveAmplitude: 0.6 + t * 1.2,

      // Pulsate: particle size variation
      pulsateSpeed: 2.0 + t * 4.0,
      pulsateAmplitude: 0.20 + t * 0.30,

      // Rotation: subtle rotation for dynamics
      rotationSpeed: 0.2 + t * 0.3,
    };
  };

  // Create particle texture with glow effect
  const createGlowParticleTexture = (): THREE.Texture => {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      // Create radial gradient with glow
      const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
      gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
      gradient.addColorStop(0.2, 'rgba(255, 255, 255, 0.8)');
      gradient.addColorStop(0.4, 'rgba(255, 255, 255, 0.4)');
      gradient.addColorStop(0.7, 'rgba(255, 255, 255, 0.1)');
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 128, 128);
    }

    const texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;
    return texture;
  };

  // Create particle system with optimized settings
  const createParticleSystem = (
    points: Vector2[],
    baseColor: string,
    emotion: number,
    texture: THREE.Texture
  ): THREE.Points => {
    const numParticles = points.length;

    // Create BufferGeometry
    const geometry = new THREE.BufferGeometry();

    // Position array
    const positions = new Float32Array(numParticles * 3);
    for (let i = 0; i < numParticles; i++) {
      positions[i * 3] = points[i].x * 2.5; // Scale for better visibility
      positions[i * 3 + 1] = points[i].y * 2.5;
      positions[i * 3 + 2] = 0;
    }
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    // Color array with gradient
    const colors = generateParticleColors(numParticles, baseColor, emotion);
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Size array with variation
    const sizes = new Float32Array(numParticles);
    for (let i = 0; i < numParticles; i++) {
      const t = i / numParticles;
      // Vary size along contour for visual interest
      const sizeVariation = 1 + Math.sin(t * Math.PI * 8) * 0.3;
      sizes[i] = 0.10 * sizeVariation;
    }
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    // Create PointsMaterial with optimized settings
    const material = new THREE.PointsMaterial({
      size: 0.12,
      map: texture,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
    });

    return new THREE.Points(geometry, material);
  };

  // Generate particle colors with smooth gradient and emotion-based hue shifts
  const generateParticleColors = (
    numParticles: number,
    baseColor: string,
    emotion: number
  ): Float32Array => {
    const colors = new Float32Array(numParticles * 3);
    const baseThreeColor = new THREE.Color(baseColor);

    const hsl = { h: 0, s: 0, l: 0 };
    baseThreeColor.getHSL(hsl);

    const emotionFactor = emotion / 100;

    for (let i = 0; i < numParticles; i++) {
      const t = i / numParticles;

      // Create rainbow gradient with emotion influence
      const hueShift = 0.15 + emotionFactor * 0.25; // More dramatic hue shifts with higher emotion
      const hue = (hsl.h + t * hueShift + Math.sin(t * Math.PI * 4) * 0.05) % 1;

      // Saturation increases with emotion
      const saturation = Math.max(0.6, Math.min(1.0, hsl.s + emotionFactor * 0.3));

      // Lightness varies along contour with emotion influence
      const lightnessBase = 0.55 + emotionFactor * 0.15;
      const lightnessWave = Math.sin(t * Math.PI * 6) * 0.15;
      const lightness = Math.max(0.3, Math.min(0.85, lightnessBase + lightnessWave));

      const color = new THREE.Color().setHSL(hue, saturation, lightness);

      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    return colors;
  };

  return (
    <div
      ref={containerRef}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        position: 'relative',
        background: 'radial-gradient(circle, rgba(20,20,40,1) 0%, rgba(10,10,20,1) 100%)',
        borderRadius: '12px',
      }}
    />
  );
};

export default ParticleOutlineViewer;
