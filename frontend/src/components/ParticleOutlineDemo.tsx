import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * 粒子轮廓演示组件
 * 展示如何用粒子绘制形状轮廓并添加动画
 */
const ParticleOutlineDemo: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // 初始化场景
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0e1a);

    // 初始化相机
    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 30;

    // 初始化渲染器
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(
      containerRef.current.clientWidth,
      containerRef.current.clientHeight
    );
    containerRef.current.appendChild(renderer.domElement);

    // 创建圆形粒子纹理
    const createCircleTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 32;
      canvas.height = 32;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        gradient.addColorStop(0.4, 'rgba(255, 255, 255, 0.8)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 32, 32);
      }
      return new THREE.CanvasTexture(canvas);
    };

    // 生成心形轮廓点
    const generateHeartOutline = (numPoints: number) => {
      const points: THREE.Vector3[] = [];
      const colors: number[] = [];
      
      for (let i = 0; i < numPoints; i++) {
        const t = (i / numPoints) * Math.PI * 2;
        
        // 心形参数方程
        const x = 16 * Math.pow(Math.sin(t), 3);
        const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
        
        points.push(new THREE.Vector3(x * 0.8, y * 0.8, 0));
        
        // 渐变颜色
        const color = new THREE.Color();
        color.setHSL(t / (Math.PI * 2), 0.8, 0.6);
        colors.push(color.r, color.g, color.b);
      }
      
      return { points, colors };
    };

    // 创建粒子系统
    const numParticles = 200;
    const { points, colors } = generateHeartOutline(numParticles);
    
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(numParticles * 3);
    const colorsArray = new Float32Array(colors);
    const sizes = new Float32Array(numParticles);
    
    points.forEach((point, i) => {
      positions[i * 3] = point.x;
      positions[i * 3 + 1] = point.y;
      positions[i * 3 + 2] = point.z;
      sizes[i] = 0.5 + Math.random() * 0.5;
    });
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colorsArray, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    const material = new THREE.PointsMaterial({
      size: 0.8,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
      map: createCircleTexture(),
    });
    
    const particleSystem = new THREE.Points(geometry, material);
    scene.add(particleSystem);

    // 添加环境光
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    // 动画循环
    let time = 0;
    const animate = () => {
      requestAnimationFrame(animate);
      time += 0.01;

      // 更新粒子位置 - 添加流动和呼吸效果
      const positions = geometry.attributes.position.array as Float32Array;
      const sizes = geometry.attributes.size.array as Float32Array;
      
      points.forEach((originalPoint, i) => {
        const i3 = i * 3;
        
        // 呼吸效果
        const breathe = Math.sin(time * 2 + i * 0.1) * 0.3;
        
        // 流动效果
        const flow = Math.sin(time + i * 0.05) * 0.5;
        
        positions[i3] = originalPoint.x * (1 + breathe * 0.1) + flow * 0.2;
        positions[i3 + 1] = originalPoint.y * (1 + breathe * 0.1);
        positions[i3 + 2] = originalPoint.z + Math.sin(time * 3 + i * 0.2) * 2;
        
        // 粒子大小脉动
        sizes[i] = (0.5 + Math.random() * 0.5) * (1 + Math.sin(time * 4 + i * 0.3) * 0.3);
      });
      
      geometry.attributes.position.needsUpdate = true;
      geometry.attributes.size.needsUpdate = true;

      // 缓慢旋转
      particleSystem.rotation.z = Math.sin(time * 0.5) * 0.2;

      renderer.render(scene, camera);
    };
    animate();

    // 处理窗口大小变化
    const handleResize = () => {
      if (!containerRef.current) return;
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    // 清理
    return () => {
      window.removeEventListener('resize', handleResize);
      if (containerRef.current && renderer.domElement.parentNode === containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
      geometry.dispose();
      material.dispose();
    };
  }, []);

  return (
    <div className="w-full h-full flex flex-col">
      <div className="p-4 bg-gray-800 text-white">
        <h2 className="text-xl font-bold">粒子轮廓原型演示</h2>
        <p className="text-sm text-gray-300 mt-1">
          展示如何用粒子绘制形状轮廓并添加流动、呼吸动画效果
        </p>
      </div>
      <div ref={containerRef} className="flex-1" style={{ minHeight: '500px' }} />
    </div>
  );
};

export default ParticleOutlineDemo;
