# Design Document

## Overview

粒子轮廓功能将为生物信息面板添加动态的粒子动画展示。当用户点击星际场景中的生物时，信息面板右侧将显示该生物的粒子轮廓动画，通过流动、呼吸等效果展现生物的形态和情绪状态。

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React + Three.js)              │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────────┐         ┌──────────────────────────┐  │
│  │  GalaxyScene     │────────▶│  CreatureInfoPanel       │  │
│  │  (Main 3D Scene) │  Click  │  (Info Display)          │  │
│  └──────────────────┘         └──────────────────────────┘  │
│                                         │                     │
│                                         ▼                     │
│                               ┌──────────────────────────┐  │
│                               │ ParticleOutlineViewer    │  │
│                               │ (3D Particle Animation)  │  │
│                               └──────────────────────────┘  │
│                                         │                     │
│                                         ▼                     │
│                               ┌──────────────────────────┐  │
│                               │ ContourData              │  │
│                               │ (Outline Points)         │  │
│                               └──────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                                         │
                                         │ HTTP Request
                                         ▼
┌─────────────────────────────────────────────────────────────┐
│                     Backend (Node.js + Express)              │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────┐  │
│  │  ContourExtractionService                            │  │
│  │  - Extract contour from image                        │  │
│  │  - Smooth contour points                             │  │
│  │  - Return normalized coordinates                     │  │
│  └──────────────────────────────────────────────────────┘  │
│                           │                                  │
│                           ▼                                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Canvas API / Image Processing                       │  │
│  │  - Load image                                         │  │
│  │  - Apply edge detection                               │  │
│  │  - Trace contour                                      │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### 1. ParticleOutlineViewer Component

**Purpose**: 在信息面板中渲染粒子轮廓动画

**Props**:
```typescript
interface ParticleOutlineViewerProps {
  contourPoints: Vector2[];  // 轮廓点坐标数组
  color: string;             // 生物颜色
  emotionValue: number;      // 情绪值 (0-100)
  width?: number;            // 画布宽度
  height?: number;           // 画布高度
}
```

**State**:
```typescript
interface ParticleOutlineViewerState {
  scene: THREE.Scene | null;
  camera: THREE.PerspectiveCamera | null;
  renderer: THREE.WebGLRenderer | null;
  particleSystem: THREE.Points | null;
  animationId: number | null;
}
```

### 2. ContourExtractionService

**Purpose**: 从图像中提取轮廓点

**Methods**:
```typescript
class ContourExtractionService {
  // 从图像 URL 提取轮廓
  async extractContour(imageUrl: string): Promise<ContourData>;
  
  // 从 Canvas 提取轮廓
  extractContourFromCanvas(canvas: HTMLCanvasElement): ContourPoint[];
  
  // 平滑轮廓点
  smoothContour(points: ContourPoint[], iterations: number): ContourPoint[];
  
  // 归一化坐标到 [-1, 1] 范围
  normalizeContour(points: ContourPoint[]): Vector2[];
}
```

**Data Types**:
```typescript
interface ContourPoint {
  x: number;
  y: number;
}

interface Vector2 {
  x: number;
  y: number;
}

interface ContourData {
  points: Vector2[];
  boundingBox: {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
  };
}
```

### 3. CreatureInfoPanel Component (Updated)

**Purpose**: 显示生物信息和粒子轮廓

**Layout**:
```
┌─────────────────────────────────────────────────────┐
│  Creature Info Panel                          [X]   │
├──────────────────────────┬──────────────────────────┤
│                          │                          │
│  Basic Info              │   Particle Outline       │
│  - Name                  │   ┌──────────────────┐   │
│  - Species               │   │                  │   │
│  - Personality           │   │   ✨ Animated   │   │
│  - Emotion Value         │   │   Particles      │   │
│  - Habitat               │   │                  │   │
│  - Backstory             │   └──────────────────┘   │
│                          │                          │
│  [Chat] [Close]          │                          │
└──────────────────────────┴──────────────────────────┘
```

## Data Models

### ContourData Storage

轮廓数据将存储在生物记录中：

```typescript
interface CreatureProfile {
  id: string;
  name: string;
  species: string;
  // ... existing fields
  contourData?: {
    points: Vector2[];
    version: string;  // 用于缓存失效
  };
}
```

### Particle Animation Parameters

根据情绪值计算动画参数：

```typescript
interface AnimationParams {
  breatheSpeed: number;      // 呼吸速度 (0.5 - 2.0)
  breatheAmplitude: number;  // 呼吸幅度 (0.05 - 0.2)
  flowSpeed: number;         // 流动速度 (0.5 - 2.0)
  flowAmplitude: number;     // 流动幅度 (0.1 - 0.5)
  depthWaveSpeed: number;    // 深度波动速度 (1.0 - 4.0)
  depthWaveAmplitude: number;// 深度波动幅度 (1.0 - 3.0)
  pulsateSpeed: number;      // 脉动速度 (2.0 - 6.0)
  pulsateAmplitude: number;  // 脉动幅度 (0.2 - 0.5)
}

function calculateAnimationParams(emotionValue: number): AnimationParams {
  const t = emotionValue / 100;
  return {
    breatheSpeed: 0.5 + t * 1.5,
    breatheAmplitude: 0.05 + t * 0.15,
    flowSpeed: 0.5 + t * 1.5,
    flowAmplitude: 0.1 + t * 0.4,
    depthWaveSpeed: 1.0 + t * 3.0,
    depthWaveAmplitude: 1.0 + t * 2.0,
    pulsateSpeed: 2.0 + t * 4.0,
    pulsateAmplitude: 0.2 + t * 0.3,
  };
}
```

## Error Handling

### Contour Extraction Failures

1. **图像加载失败**: 返回默认圆形轮廓
2. **轮廓点过少** (< 50): 使用插值增加点数
3. **轮廓点过多** (> 500): 使用采样减少点数
4. **处理超时** (> 3s): 返回默认轮廓并记录错误

### Frontend Rendering Failures

1. **WebGL 不可用**: 显示静态图像作为后备
2. **性能问题** (FPS < 30): 减少粒子数量
3. **内存泄漏**: 确保组件卸载时清理所有 Three.js 资源

## Testing Strategy

### Unit Tests

1. **ContourExtractionService**
   - 测试边缘检测算法
   - 测试轮廓平滑算法
   - 测试坐标归一化

2. **AnimationParams Calculation**
   - 测试不同情绪值的参数计算
   - 测试边界值 (0, 100)

### Integration Tests

1. **ParticleOutlineViewer**
   - 测试组件挂载和卸载
   - 测试动画循环
   - 测试资源清理

2. **CreatureInfoPanel**
   - 测试粒子轮廓显示
   - 测试响应式布局

### Performance Tests

1. **Rendering Performance**
   - 测试 60 FPS 稳定性
   - 测试不同粒子数量的性能
   - 测试内存使用

2. **Contour Extraction Performance**
   - 测试不同图像尺寸的处理时间
   - 测试并发请求处理

## Implementation Notes

### Contour Extraction Algorithm

使用 Canvas API 实现简单的边缘检测：

1. 将图像绘制到 Canvas
2. 获取图像数据 (ImageData)
3. 应用 Sobel 边缘检测算法
4. 使用轮廓跟踪算法提取边界点
5. 应用高斯平滑减少噪点
6. 采样到目标点数 (200-300)

### Particle System Optimization

1. 使用 BufferGeometry 而不是 Geometry
2. 使用 InstancedMesh 如果需要多个轮廓
3. 只更新变化的属性 (position, size)
4. 使用 requestAnimationFrame 控制帧率
5. 在组件卸载时正确清理资源

### Color Gradient

粒子颜色沿轮廓渐变，使用与生物球体相同的颜色方案：

```typescript
function generateParticleColors(
  numParticles: number,
  baseColor: THREE.Color,
  emotionValue: number
): Float32Array {
  const colors = new Float32Array(numParticles * 3);
  
  for (let i = 0; i < numParticles; i++) {
    const t = i / numParticles;
    const hue = (baseColor.getHSL({}).h + t * 0.1) % 1;
    const color = new THREE.Color().setHSL(hue, 0.8, 0.6);
    
    colors[i * 3] = color.r;
    colors[i * 3 + 1] = color.g;
    colors[i * 3 + 2] = color.b;
  }
  
  return colors;
}
```
